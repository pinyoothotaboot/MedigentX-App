
import { IProvider } from "../types";
import { WorkFlow } from "../types";
import { OUTPUT_CONSOLIDATION_PROMPT_V1 } from "./promptTemplates";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[CONSOLIDATION] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[CONSOLIDATION:ERROR] ${msg}`, ...args),
};

export class Consolidation {
  private systemPrompt: string;

  constructor(systemPrompt: string = OUTPUT_CONSOLIDATION_PROMPT_V1) {
    this.systemPrompt = systemPrompt;
  }

  public async performOutputConsolidation(llmProvider: IProvider, workflow: WorkFlow): Promise<string> {
    logger.info("Performing output consolidation");

    const executionResults: Record<string, any> = {};
    for (const [id, task] of Object.entries(workflow.sub_tasks_details)) {
        executionResults[id] = { status: task.status, result: task.result };
    }

    const graphRep = {
        nodes: workflow.nodes.map(n => n.node_id),
        edges: workflow.edges.map(e => ({ from: e.from_node, to: e.to_node }))
    };

    let userContent = this.systemPrompt.replace("{{workflow_goal}}", workflow.user_goal_summary);
    userContent = userContent.replace("{{workflow_graph_representation_json}}", JSON.stringify(graphRep, null, 2));
    userContent = userContent.replace("{{workflow_execution_results_json}}", JSON.stringify(executionResults, null, 2));

    try {
        const response = await llmProvider.chat_completion(userContent, this.systemPrompt, false);
        return response.content;
    } catch (e) {
        logger.error("Consolidation failed", e);
        return "Failed to consolidate output.";
    }
  }
}
