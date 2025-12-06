
import { IProvider } from "./geminiService";
import { RefinementPlan } from "../types";
import { PROMPT_BUILDER_PROMPT_V1 } from "./promptTemplates";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[BUILDER] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[BUILDER:ERROR] ${msg}`, ...args),
};

export class Builder {
  private systemPrompt: string;

  constructor(systemPrompt: string = PROMPT_BUILDER_PROMPT_V1) {
    this.systemPrompt = systemPrompt;
  }

  public async buildRefinedPrompt(
    llmProvider: IProvider,
    originalPrompt: string,
    refinementPlan: RefinementPlan
  ): Promise<string> {
    logger.info("Building refined prompt");

    const userContent = `
    **Original Prompt to Refine:**
    \`\`\`
    ${originalPrompt}
    \`\`\`

    **Refinement Guidelines (JSON):**
    \`\`\`json
    ${JSON.stringify(refinementPlan, null, 2)}
    \`\`\`
    `;

    try {
        const response = await llmProvider.chat_completion(userContent, this.systemPrompt, false);
        return response.content || originalPrompt;
    } catch (e) {
        logger.error("Failed to build refined prompt", e);
        return originalPrompt;
    }
  }
}
