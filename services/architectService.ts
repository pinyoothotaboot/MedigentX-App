
import { IProvider } from "./geminiService";
import { RetryJsonParser } from "./retryJsonParser";
import { 
    PlannerModel, PlanTask, AgentTeamConfiguration, 
    MiniAgentTeamConfiguration, SelectedMiniAgent, 
    CustomizationInstructions, PlaceholderReplacement, ToolInjection,
    AgentInstance 
} from "../types";
import { ARCHITECT_PROMPT_V1, STANDARD_SOAP_INSTRUCTIONS_V1, SOAP_LIST_FORMAT_INSTRUCTIONS_V1, SOAP_NARRATIVE_FORMAT_INSTRUCTIONS_V1, COMPREHENSIVE_MEDICAL_NOTE_INSTRUCTIONS_V1, PSYCHIATRY_NOTE_INSTRUCTIONS_V1, DISCHARGE_SUMMARY_INSTRUCTIONS_V1, OPERATIVE_NOTE_INSTRUCTIONS_V1 } from "./promptTemplates";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[ARCHITECT] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ARCHITECT:ERROR] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.debug(`[ARCHITECT] ${msg}`, ...args),
};

export class Architect {
  private systemPrompt: string;
  private retryJsonParser: RetryJsonParser;

  constructor(systemPrompt: string = ARCHITECT_PROMPT_V1) {
    this.systemPrompt = systemPrompt;
    this.retryJsonParser = new RetryJsonParser(3);
    logger.info("Initialized Architect");
  }

  private getUserContent(subTask: PlanTask, blueprints: Record<string, string>, tools: string[]): string {
    // Simplified serialization for prompt
    const subTaskDict = { ...subTask };
    const userContent = `
    Sub-task Specification (JSON):
    \`\`\`json
    ${JSON.stringify(subTaskDict, null, 2)}
    \`\`\`
    Existing Blueprints (JSON String):
    \`\`\`
    ${JSON.stringify(Object.keys(blueprints))}
    \`\`\`
    Available Tools (JSON String):
    \`\`\`
    ${JSON.stringify(tools)}
    \`\`\`
    `;
    return userContent;
  }

  private customizePrompt(placeholder: string, value: string, prompt: string, blueprints: Record<string, string>): string {
    if (placeholder === "{{note_type_specific_instructions_payload}}") {
       const instructionMap: Record<string, string> = {
         "USE_INSTRUCTION_BLOCK::STANDARD_SOAP_INSTRUCTIONS_V1": STANDARD_SOAP_INSTRUCTIONS_V1,
         "USE_INSTRUCTION_BLOCK::SOAP_LIST_FORMAT_INSTRUCTIONS_V1": SOAP_LIST_FORMAT_INSTRUCTIONS_V1,
         "USE_INSTRUCTION_BLOCK::SOAP_NARRATIVE_FORMAT_INSTRUCTIONS_V1": SOAP_NARRATIVE_FORMAT_INSTRUCTIONS_V1,
         "USE_INSTRUCTION_BLOCK::COMPREHENSIVE_MEDICAL_NOTE_INSTRUCTIONS_V1": COMPREHENSIVE_MEDICAL_NOTE_INSTRUCTIONS_V1,
         "USE_INSTRUCTION_BLOCK::PSYCHIATRY_NOTE_INSTRUCTIONS_V1": PSYCHIATRY_NOTE_INSTRUCTIONS_V1,
         "USE_INSTRUCTION_BLOCK::DISCHARGE_SUMMARY_INSTRUCTIONS_V1": DISCHARGE_SUMMARY_INSTRUCTIONS_V1,
         "USE_INSTRUCTION_BLOCK::OPERATIVE_NOTE_INSTRUCTIONS_V1": OPERATIVE_NOTE_INSTRUCTIONS_V1
       };
       const instruction = instructionMap[value] || "";
       return prompt.replace(placeholder, instruction);
    }
    return prompt.replace(placeholder, value);
  }

  public async processPerformTeamAssembly(
    llmProvider: IProvider,
    plannedSubTasks: PlannerModel,
    masterToolRegistry: string[],
    agentBlueprints: Record<string, string>
  ): Promise<[PlanTask[], Record<string, AgentInstance>]> {
    logger.info("Starting team assembly");
    
    const subTasksList = plannedSubTasks.Plan.sub_tasks;
    const agentInstancesMap: Record<string, AgentInstance> = {};
    const processedSubTasks: PlanTask[] = [];

    for (const subTask of subTasksList) {
        try {
            const userContent = this.getUserContent(subTask, agentBlueprints, masterToolRegistry);
            const parsedData = await this.retryJsonParser.parse_json_with_retry(
                llmProvider, userContent, this.systemPrompt
            );

            if (!parsedData || !parsedData.MiniAgentTeamConfiguration) continue;

            const miniAgentConfig = parsedData.MiniAgentTeamConfiguration;
            const selectedAgents = miniAgentConfig.selected_mini_agents || [];

            for (const agentData of selectedAgents) {
                const blueprintName = agentData.blueprint_name;
                let customPrompt = agentBlueprints[blueprintName] || "";
                
                // Customization
                const replacements = agentData.customization_instructions?.placeholder_replacements || [];
                for (const r of replacements) {
                    customPrompt = this.customizePrompt(r.placeholder_to_find, r.value_to_replace_with, customPrompt, agentBlueprints);
                }

                // Tool injection
                const toolInjection = agentData.customization_instructions?.tool_injection;
                let allowedTools: string[] = [];
                if (toolInjection) {
                    const toolsStr = toolInjection.tool_list_to_inject.map((t: string) => `\`${t}\``).join(", ");
                    customPrompt = customPrompt.replace(toolInjection.placeholder_target_description, toolsStr);
                    allowedTools = toolInjection.tool_list_to_inject;
                }

                const instanceId = agentData.instance_name;
                const agentInstance: AgentInstance = {
                    instance_id: instanceId,
                    blueprint_name: blueprintName,
                    system_prompt: customPrompt,
                    allowed_tools: allowedTools
                };

                agentInstancesMap[instanceId] = agentInstance;
                
                // Assign to task
                subTask.assigned_mini_agent_instance_id = instanceId;
            }
            processedSubTasks.push(subTask);

        } catch (e) {
            logger.error(`Failed to assemble team for task ${subTask.name}`, e);
        }
    }

    return [processedSubTasks, agentInstancesMap];
  }
}
