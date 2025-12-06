
import { IProvider } from "./geminiService";
import { RetryJsonParser } from "./retryJsonParser";
import { UserQueryInternal } from "../types";
import { ORCHESTRATOR_PROMPT_V1 } from "./promptTemplates";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[ORCHESTRATOR] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ORCHESTRATOR:ERROR] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.debug(`[ORCHESTRATOR] ${msg}`, ...args),
};

export class Orchestrator {
  private systemPrompt: string;
  private retryJsonParser: RetryJsonParser;

  constructor(systemPrompt: string = ORCHESTRATOR_PROMPT_V1) {
    this.systemPrompt = systemPrompt;
    this.retryJsonParser = new RetryJsonParser(3);
    logger.info("Initialized Orchestrator");
  }

  public getSystemPrompt(): string {
    return this.systemPrompt;
  }

  public getUserPrompt(userQueryInternal: UserQueryInternal): string {
    return `User's primary goal is: '${userQueryInternal.original_user_content}'. Additional guidelines: '${userQueryInternal.additional_guidelines}'. Commence full process.`;
  }

  public async processGoalIngestionAndAnalysis(
    userQueryInternal: UserQueryInternal, 
    llmProvider: IProvider
  ): Promise<any> {
    logger.info("Starting goal ingestion and analysis", { sessionId: userQueryInternal.session_id });

    try {
      const userPrompt = this.getUserPrompt(userQueryInternal);
      const result = await this.retryJsonParser.parse_json_with_retry(
        llmProvider,
        userPrompt,
        this.systemPrompt,
        null,
        false
      );
      
      logger.info("Goal analysis completed");
      return result;
    } catch (e) {
      logger.error("Goal analysis failed", e);
      throw e;
    }
  }
}
