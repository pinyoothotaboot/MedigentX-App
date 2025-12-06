
import { IProvider } from "../types";
import { RetryJsonParser } from "./retryJsonParser";
import { UserQueryInternal, PlannerModel, PlanTask, PlanSubTask } from "../types";
import { STRATEGIC_PLANNING_PROMPT_V1 } from "./promptTemplates";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[PLANNER] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[PLANNER:ERROR] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.debug(`[PLANNER] ${msg}`, ...args),
};

export class Planner {
  private systemPrompt: string;
  private retryJsonParser: RetryJsonParser;

  constructor(systemPrompt: string = STRATEGIC_PLANNING_PROMPT_V1) {
    this.systemPrompt = systemPrompt;
    this.retryJsonParser = new RetryJsonParser(3);
    logger.info("Initialized Planner");
  }

  private userPrompt(userQueryInternal: UserQueryInternal): string {
    const refinementSuggestions = userQueryInternal.additional_guidelines || "{}";
    return `Your inputs are: \`user_goal\` (string): "${userQueryInternal.original_user_content}", \`historical_context\` (stringified JSON or null): null, \`refinement_suggestions\` (stringified JSON or null): ${refinementSuggestions}.\n\nRemember your final and ONLY output must be a single, valid JSON object as specified in your instructions.`;
  }

  public async planPerformSubTasks(
    userQueryInternal: UserQueryInternal,
    llmProvider: IProvider
  ): Promise<PlannerModel | null> {
    logger.info("Starting task planning");

    try {
      const userPrompt = this.userPrompt(userQueryInternal);
      const responseJson = await this.retryJsonParser.parse_json_with_retry(
        llmProvider,
        userPrompt,
        this.systemPrompt
      );

      if (!responseJson || typeof responseJson !== 'object') {
        throw new Error("Invalid JSON response from Planner");
      }

      // Map to PlannerModel
      const planData = responseJson.Plan || {};
      const subTasksData = planData.sub_tasks || [];

      const subTasks: PlanTask[] = subTasksData.map((taskData: any) => ({
        name: taskData.name || "",
        description: taskData.description || "",
        reason: taskData.reason || "",
        inputs: (taskData.inputs || []).map((i: any) => ({
          name: i.name, type: i.type, required: i.required, description: i.description
        } as PlanSubTask)),
        outputs: (taskData.outputs || []).map((o: any) => ({
          name: o.name, type: o.type, required: o.required, description: o.description
        } as PlanSubTask)),
        status: "Pending",
        refinement_attempts: 0
      }));

      const plannerModel: PlannerModel = {
        Thought: responseJson.Thought || "",
        Goal: responseJson.Goal || "",
        Plan: { sub_tasks: subTasks }
      };

      logger.info("Planning completed", { subTasks: subTasks.length });
      return plannerModel;

    } catch (e) {
      logger.error("Task planning failed", e);
      return null;
    }
  }
}
