
import { AgentInstance, PlanTask, WorkFlow, WorkFlowNode, WorkFlowEdge } from "../types";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[WORKFLOW_BUILDER] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[WORKFLOW_BUILDER:ERROR] ${msg}`, ...args),
};

export class WorkFlowBuilder {
  public createWorkflowStructure(
    userGoal: string,
    subTasksWithAgents: PlanTask[],
    agentInstances: Record<string, AgentInstance>
  ): WorkFlow {
    logger.info("Creating workflow structure");

    const outputProducerMap: Record<string, string> = {};
    for (const task of subTasksWithAgents) {
        for (const output of task.outputs) {
            outputProducerMap[output.name] = task.name;
        }
    }

    const nodes: WorkFlowNode[] = [];
    const edges: WorkFlowEdge[] = [];
    const subTasksDetailsMap: Record<string, PlanTask> = {};

    for (const task of subTasksWithAgents) {
        subTasksDetailsMap[task.name] = task;
        
        nodes.push({
            node_id: task.name,
            assigned_mini_agent_instance_id: task.assigned_mini_agent_instance_id || "",
            inputs_from_workflow: task.inputs.map(i => i.name),
            outputs_to_workflow: task.outputs.map(o => o.name)
        });

        for (const input of task.inputs) {
            const producerTaskName = outputProducerMap[input.name];
            if (producerTaskName) {
                edges.push({
                    from_node: producerTaskName,
                    to_node: task.name,
                    data_mapping: { [input.name]: input.name }
                });
            }
        }
    }

    // Find initial task (no incoming edges)
    const destinationNodes = new Set(edges.map(e => e.to_node));
    const initialNodes = nodes.filter(n => !destinationNodes.has(n.node_id));
    const initialTaskId = initialNodes.length > 0 ? initialNodes[0].node_id : null;

    return {
        workflow_id: `WF_MedicalNote_${Date.now()}`,
        user_goal_summary: userGoal,
        global_context: { user_goal_full_text: userGoal },
        nodes,
        edges,
        sub_tasks_details: subTasksDetailsMap,
        agent_instances: agentInstances,
        current_task_node_id: initialTaskId,
        max_refinement_cycles_per_task: 3
    };
  }
}
