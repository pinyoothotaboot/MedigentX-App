
import { GoogleGenAI } from "@google/genai";
import { NoteType, AIMessage, FrontendRequest, TranslateLangType } from "../types";
import { Manager } from "./managerService";
import { MEDICAL_NOTE_MASTER_PROMPT_V1 } from "./promptTemplates";

// Simple logger to mimic the Python logger interface
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.debug(`[DEBUG] ${msg}`, ...args),
  warning: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
};

export interface IProvider {
  chat_completion(prompt: string, system_prompt: string, stream_handler?: any): Promise<AIMessage>;
  parse_json(response: AIMessage): any;
}

export class GeminiService implements IProvider {
  private ai: GoogleGenAI | null = null;
  private model: string;
  private apiKey: string | undefined;

  constructor(model: string = 'gemini-2.5-flash') {
    this.apiKey = process.env.API_KEY;
    this.model = model;
    
    logger.info("Initializing GeminiService", { model, hasKey: !!this.apiKey });

    if (this.apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        logger.info("GeminiService initialized successfully");
      } catch (e) {
        logger.error("Failed to initialize GeminiService", e);
      }
    } else {
        logger.info("Running in Mock/Demo Mode (No API Key found)");
    }
  }

  /**
   * Generic chat completion method matching the IProvider interface expected by Python services.
   */
  public async chat_completion(
    prompt: string, 
    system_prompt: string, 
    stream_handler: any = false
  ): Promise<AIMessage> {
    logger.debug("chat_completion called");

    if (!this.ai) {
      // Mock response for demo mode
      return { content: JSON.stringify({ mock: "response", status: "success" }) };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          systemInstruction: system_prompt,
          temperature: 0.1,
        }
      });
      
      const text = response.text || "";
      return { content: text };
    } catch (error) {
      logger.error("Gemini API Error", error);
      throw error;
    }
  }

  /**
   * Parses JSON from an AIMessage, cleaning up Markdown code blocks if present.
   */
  public parse_json(response: AIMessage): any {
    try {
      let text = response.content.trim();
      
      // Remove markdown code blocks ```json ... ```
      if (text.startsWith("```json")) {
        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      return JSON.parse(text);
    } catch (error) {
      logger.error("Failed to parse JSON", error, response.content);
      throw error;
    }
  }

  // --- Integration with Manager ---

  private getNoteTypeSystemPromptKey(noteType: NoteType): string {
      switch (noteType) {
        case NoteType.Psychiatry: return "NOTE_TYPE::Psychiatry";
        case NoteType.Operative: return "NOTE_TYPE::OperativeNote";
        case NoteType.SOAPList: return "NOTE_TYPE::SOAPList";
        case NoteType.Comprehensive: return "NOTE_TYPE::Comprehensive";
        case NoteType.DischargeSummary: return "NOTE_TYPE::DischargeSummary";
        case NoteType.StandardSOAP:
        default: return "NOTE_TYPE::StandardSOAP";
      }
  }

  public async *streamChat(
    history: { role: string; content: string }[],
    noteType: NoteType,
    message: string
  ): AsyncGenerator<string, void, unknown> {
    if (!this.ai) {
      yield "Demo Mode: Unable to stream chat without API Key.";
      return;
    }

    try {
        // Use Manager for advanced workflow
        // This simulates a streaming interface by yielding progress updates
        
        let finalResponse = "";
        const progressHandler = (msg: string) => {
             // In a real implementation with generator, we can't easily yield from callback
             // But we can simulate "thinking" steps or use a queue.
             // For this implementation, we will log progress
             logger.info("Progress:", msg);
        };

        const manager = new Manager(this, progressHandler);
        
        const request: FrontendRequest = {
            llm_provider: "gemini",
            llm_model: this.model,
            session_id: `sess_${Date.now()}`,
            system_prompt: this.getNoteTypeSystemPromptKey(noteType),
            user_prompt: message,
            language: TranslateLangType.ENGLISH // Default
        };

        // Yield initial thought to show it's working
        yield "> *Initializing MediGentX Agent Swarm...*\n\n";

        // Since Manager.process is async and not a generator, we wait for full result
        // But we can yield "steps" based on timing or if we refactor Manager to be a generator
        // For now, we wait.
        
        const response = await manager.process(request);
        
        if (response.message.content) {
            yield response.message.content;
        }

    } catch (error) {
      logger.error("Stream Chat Error", error);
      yield "\n\n**Error: Service unavailable or Agent workflow failed.**";
    }
  }
}

export const geminiService = new GeminiService();
