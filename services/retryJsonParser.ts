
import { IProvider } from "./geminiService";
import { RETRY_JSON_PROMPT_V1 } from "./promptTemplates";

// Simple logger
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[RETRY_PARSER:INFO] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[RETRY_PARSER:ERROR] ${msg}`, ...args),
  warning: (msg: string, ...args: any[]) => console.warn(`[RETRY_PARSER:WARN] ${msg}`, ...args),
};

export class RetryJsonParser {
  private maxRetryAttempts: number;

  constructor(maxRetryAttempts: number = 3) {
    this.maxRetryAttempts = maxRetryAttempts;
    logger.info("Initializing RetryJsonParser", { maxRetryAttempts });
  }

  public async parse_json_with_retry(
    llm_provider: IProvider,
    user_content: string,
    system_prompt: string,
    expected_json_schema_or_example: string | null = null,
    stream_handler: any = false
  ): Promise<any> {
    let lastErrorMessage = "";
    let lastLlmResponse = "";
    const originalPrompt = user_content;

    for (let attempt = 0; attempt < this.maxRetryAttempts; attempt++) {
      logger.info(`Attempt ${attempt + 1} to generate and parse JSON`);

      try {
        let llmResponse;
        
        if (attempt === 0) {
          // Initial call
          llmResponse = await llm_provider.chat_completion(user_content, system_prompt, stream_handler);
        } else {
          // Retry with repair prompt
          const retryPrompt = this._build_retry_prompt(
            lastLlmResponse,
            lastErrorMessage,
            originalPrompt,
            expected_json_schema_or_example
          );
          
          logger.info(`Using retry prompt for attempt ${attempt + 1}`);
          
          llmResponse = await llm_provider.chat_completion(retryPrompt, system_prompt, stream_handler);
        }

        // Use the provider to parse
        const jsonData = llm_provider.parse_json(llmResponse);
        logger.info(`JSON generated and parsed successfully on attempt ${attempt + 1}`);
        return jsonData;

      } catch (error: any) {
        lastErrorMessage = error.message || String(error);
        // We assume error might have happened during generation or parsing
        // If it was during generation, llmResponse might be undefined, but catch block handles logic flow
        
        logger.warning(`JSON parsing failed on attempt ${attempt + 1}`, { error: lastErrorMessage });
        
        if (attempt === this.maxRetryAttempts - 1) {
          logger.error("Failed to generate valid JSON after max attempts");
          throw new Error(`Failed to generate valid JSON: ${lastErrorMessage}`);
        }
      }
    }
    
    throw new Error("Unexpected error in retry logic");
  }

  private _build_retry_prompt(
    invalid_json_output: string,
    error_message: string,
    original_task_instructions: string,
    expected_schema: string | null
  ): string {
    let prompt = RETRY_JSON_PROMPT_V1;
    prompt = prompt.replace('{{invalid_json_output}}', invalid_json_output);
    prompt = prompt.replace('{{error_message_from_parser}}', error_message);
    prompt = prompt.replace('{{original_task_instructions}}', original_task_instructions);
    
    if (expected_schema) {
      prompt = prompt.replace('{{previous_valid_fragment_or_template}}', expected_schema);
    } else {
      prompt = prompt.replace('{{previous_valid_fragment_or_template}}', '');
    }

    return prompt;
  }
}
