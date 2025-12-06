
import { IProvider } from "./geminiService";
import { RetryJsonParser } from "./retryJsonParser";
import { AgentInstance, RefinementPlan } from "../types";
import { ADAPTION_STRATEGIST_PROMPT_V1 } from "./promptTemplates";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[STRATEGIST] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[STRATEGIST:ERROR] ${msg}`, ...args),
};

export class AdaptionStrategist {
  private systemPrompt: string;
  private retryJsonParser: RetryJsonParser;

  constructor(systemPrompt: string = ADAPTION_STRATEGIST_PROMPT_V1) {
    this.systemPrompt = systemPrompt;
    this.retryJsonParser = new RetryJsonParser(3);
  }

  public async getRefinementGuidelines(
    llmProvider: IProvider,
    failingAgent: AgentInstance,
    verificationFeedback: any
  ): Promise<RefinementPlan | null> {
    logger.info("Getting refinement guidelines");

    const userContent = `
    **Current Failing Prompt:**
    \`\`\`
    ${failingAgent.system_prompt}
    \`\`\`

    **Verification Feedback (JSON with issues):**
    \`\`\`json
    ${JSON.stringify(verificationFeedback, null, 2)}
    \`\`\`
    `;

    try {
        const response = await this.retryJsonParser.parse_json_with_retry(
            llmProvider, userContent, this.systemPrompt
        );

        if (!response) return null;

        const plan: RefinementPlan = {
            analysis_summary: response.analysis_summary || "",
            refinement_guidelines: response.refinement_guidelines || []
        };
        return plan;
    } catch (e) {
        logger.error("Failed to get refinement guidelines", e);
        return null;
    }
  }
}
