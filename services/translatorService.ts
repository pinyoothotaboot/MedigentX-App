
import { IProvider } from "../types";
import { TRANSLATE_PROMPT_V1, TRANSLATE_INPUT_PROMPT_V1 } from "./promptTemplates";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[TRANSLATOR] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[TRANSLATOR:ERROR] ${msg}`, ...args),
};

export class Translator {
  private systemPrompt: string;
  private inputSystemPrompt: string;

  constructor(systemPrompt: string = TRANSLATE_PROMPT_V1) {
    this.systemPrompt = systemPrompt;
    this.inputSystemPrompt = TRANSLATE_INPUT_PROMPT_V1;
  }

  public async translate(
    userContent: string,
    llmProvider: IProvider,
    language: string,
    isInput: boolean = false
  ): Promise<string> {
    logger.info("Translating content");
    
    const template = isInput ? this.inputSystemPrompt : this.systemPrompt;
    const prompt = template.replace("{{language}}", language);
    
    try {
        const response = await llmProvider.chat_completion(userContent, prompt, false);
        return response.content;
    } catch (e) {
        logger.error("Translation failed", e);
        return userContent;
    }
  }
}
