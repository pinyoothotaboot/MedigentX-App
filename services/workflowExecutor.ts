
import { IProvider } from "../types";
import { RetryJsonParser } from "./retryJsonParser";
import { AdaptionStrategist } from "./adaptionStrategist";
import { Builder } from "./builderService";
import { WorkFlow, PlanTask } from "../types";
import { ICD10Service } from "./icd10Service";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[EXECUTOR] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[EXECUTOR:ERROR] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.debug(`[EXECUTOR] ${msg}`, ...args),
};

export class WorkFlowExecutor {
  private adaptionStrategist: AdaptionStrategist;
  private builder: Builder;
  private retryJsonParser: RetryJsonParser;
  private tools: ICD10Service | null;

  constructor(strategistPrompt: string, builderPrompt: string, tools: ICD10Service | null = null) {
    this.adaptionStrategist = new AdaptionStrategist(strategistPrompt);
    this.builder = new Builder(builderPrompt);
    this.retryJsonParser = new RetryJsonParser(3);
    this.tools = tools;
    logger.info("Initialized WorkFlowExecutor");
  }

  private gatherInputsForTask(currentTaskId: string, workflow: WorkFlow): Record<string, any> {
    const inputsMap: Record<string, any> = {};
    const task = workflow.sub_tasks_details[currentTaskId];
    if (!task) return inputsMap;

    for (const reqInput of task.inputs) {
        if (reqInput.name === "user_goal" || reqInput.name === "user_goal_details") {
            inputsMap[reqInput.name] = workflow.global_context["user_goal_full_text"];
            continue;
        }

        // Find from edges
        for (const edge of workflow.edges) {
            if (edge.to_node === currentTaskId) {
                // Check if this edge maps to our required input
                // edge.data_mapping is { outputKey: inputKey }
                for (const [outputKey, inputKey] of Object.entries(edge.data_mapping)) {
                    if (inputKey === reqInput.name) {
                        const producerTask = workflow.sub_tasks_details[edge.from_node];
                        if (producerTask && producerTask.result && producerTask.result[outputKey]) {
                            inputsMap[reqInput.name] = producerTask.result[outputKey];
                        }
                    }
                }
            }
        }
    }
    return inputsMap;
  }

  private getNextTaskId(completedId: string, workflow: WorkFlow): string | null {
    const pendingTasks = Object.values(workflow.sub_tasks_details).filter(t => t.status === "Pending");
    
    for (const task of pendingTasks) {
        const dependencies = workflow.edges.filter(e => e.to_node === task.name).map(e => e.from_node);
        
        const allDepsCompleted = dependencies.every(depId => {
            const depTask = workflow.sub_tasks_details[depId];
            return depTask && depTask.status === "Completed";
        });

        if (allDepsCompleted) return task.name;
    }
    return null;
  }

  private async handleToolCalls(toolCallsData: any[]): Promise<any[]> {
    const observations: any[] = [];
    if (!this.tools || !toolCallsData) return observations;

    for (const call of toolCallsData) {
        const toolName = call.tool_name;
        if (toolName === 'icd10_search_tool') {
            logger.info("Executing ICD-10 Search", call.parameters);
            try {
                const result = await this.tools.search({ terms: call.parameters.query || call.parameters.terms });
                observations.push({
                    tool_name: toolName,
                    status: 'success',
                    output: result ? result.to_dict() : { message: "No results found" }
                });
            } catch (e) {
                observations.push({ tool_name: toolName, status: 'error', output: { message: String(e) } });
            }
        } else {
             observations.push({ tool_name: toolName, status: 'error', output: { message: "Tool not implemented" } });
        }
    }
    return observations;
  }

  public async execute(workflow: WorkFlow, llmProvider: IProvider): Promise<WorkFlow> {
    logger.info("Starting workflow execution");

    while (workflow.current_task_node_id) {
        const currentId = workflow.current_task_node_id;
        const subTask = workflow.sub_tasks_details[currentId];
        const agentInstance = workflow.agent_instances[subTask.assigned_mini_agent_instance_id || ""];

        if (!agentInstance) throw new Error("Agent instance missing");

        logger.info(`Executing task: ${subTask.name}`);

        const inputs = this.gatherInputsForTask(currentId, workflow);
        
        let agentUserMessage = `
            Your current sub-task is '${subTask.name}' (Description: ${subTask.description}).
            Please process the following inputs to produce the expected outputs (${subTask.outputs.map(o => o.name).join(", ")}).
            Inputs (JSON):
            \`\`\`json
            ${JSON.stringify(inputs, null, 2)}
            \`\`\`
            IMPORTANT: Your response must be valid JSON only.
        `;

        // Execution Loop (Tool Calls)
        let agentResponse: any = {};
        for (let turn = 0; turn < workflow.max_refinement_cycles_per_task; turn++) {
            try {
                agentResponse = await this.retryJsonParser.parse_json_with_retry(
                    llmProvider, agentUserMessage, agentInstance.system_prompt
                );
                
                if (agentResponse.tool_calls) {
                   const observations = await this.handleToolCalls(agentResponse.tool_calls);
                   agentUserMessage += `\n\n**Observation from tool call(s):**\n\`\`\`json\n${JSON.stringify(observations, null, 2)}\n\`\`\`\nProceed with final answer.`;
                   continue;
                }
                break;
            } catch (e) {
                logger.error("Error during agent execution loop", e);
                break;
            }
        }

        subTask.result = agentResponse;

        // Verification Check
        let needsRefinement = false;
        if (agentInstance.blueprint_name.includes("Verification")) {
            const issues = agentResponse.issues_identified || [];
            if (issues.length > 0) {
                 // Find source task
                 const edge = workflow.edges.find(e => e.to_node === currentId);
                 if (edge) {
                    const sourceTaskId = edge.from_node;
                    const sourceTask = workflow.sub_tasks_details[sourceTaskId];
                    if (sourceTask.refinement_attempts < workflow.max_refinement_cycles_per_task) {
                        needsRefinement = true;
                        
                        // Adapt
                        const failingAgent = workflow.agent_instances[sourceTask.assigned_mini_agent_instance_id || ""];
                        const refinementPlan = await this.adaptionStrategist.getRefinementGuidelines(
                            llmProvider, failingAgent, agentResponse
                        );
                        if (refinementPlan) {
                            const newPrompt = await this.builder.buildRefinedPrompt(
                                llmProvider, failingAgent.system_prompt, refinementPlan
                            );
                            failingAgent.system_prompt = newPrompt;
                            
                            sourceTask.status = "Pending";
                            sourceTask.refinement_attempts++;
                            workflow.current_task_node_id = sourceTaskId;
                            logger.info(`Refining task ${sourceTaskId}, attempt ${sourceTask.refinement_attempts}`);
                            continue; // Loop back
                        }
                    } else {
                        sourceTask.status = "Failed";
                    }
                 }
            }
        }

        if (!needsRefinement) {
            subTask.status = "Completed";
            const nextId = this.getNextTaskId(currentId, workflow);
            workflow.current_task_node_id = nextId;
        }
    }

    return workflow;
  }
}
