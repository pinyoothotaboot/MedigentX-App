import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { NoteType } from "../types";
import {
  MEDICAL_NOTE_MASTER_PROMPT_V1,
  STANDARD_SOAP_INSTRUCTIONS_V1,
  SOAP_LIST_FORMAT_INSTRUCTIONS_V1,
  PSYCHIATRY_NOTE_INSTRUCTIONS_V1,
  COMPREHENSIVE_MEDICAL_NOTE_INSTRUCTIONS_V1,
  OPERATIVE_NOTE_INSTRUCTIONS_V1
} from "./promptTemplates";

// Simple logger to mimic the Python logger interface
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.debug(`[DEBUG] ${msg}`, ...args),
};

export class GeminiService {
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
   * Generates specific system instructions based on the medical context using the Master Prompt Template.
   */
  private getSystemInstruction(noteType: NoteType): string {
    let specificInstructions = '';

    switch (noteType) {
      case NoteType.Psychiatry:
        specificInstructions = PSYCHIATRY_NOTE_INSTRUCTIONS_V1;
        break;
      case NoteType.Operative:
        specificInstructions = OPERATIVE_NOTE_INSTRUCTIONS_V1;
        break;
      case NoteType.SOAPList:
        specificInstructions = SOAP_LIST_FORMAT_INSTRUCTIONS_V1;
        break;
      case NoteType.Comprehensive:
        specificInstructions = COMPREHENSIVE_MEDICAL_NOTE_INSTRUCTIONS_V1;
        break;
      case NoteType.StandardSOAP:
      default:
        specificInstructions = STANDARD_SOAP_INSTRUCTIONS_V1;
        break;
    }

    // Inject values into the Master Prompt
    let prompt = MEDICAL_NOTE_MASTER_PROMPT_V1;
    
    // Replace {{note_type_specific_instructions_payload}}
    prompt = prompt.replace('{{note_type_specific_instructions_payload}}', specificInstructions);
    
    // Replace {{agent_name}}
    prompt = prompt.replace('{{agent_name}}', 'MediGentX AI');
    
    // Replace {{core_mission}}
    prompt = prompt.replace('{{core_mission}}', 'Assist healthcare professionals in generating accurate, professional medical documentation.');
    
    // Replace {{response_language}} (Defaulting to English, could be dynamic)
    prompt = prompt.replace('{{response_language}}', 'English (or matches input language)');
    
    // Replace {{current_date_from_nexus}}
    prompt = prompt.replace('{{current_date_from_nexus}}', new Date().toLocaleDateString());

    return prompt;
  }

  /**
   * Streaming chat completion method.
   * Mirrors the Python `chat_completion(stream_handler=True)` logic.
   */
  public async *streamChat(
    history: { role: string; content: string }[],
    noteType: NoteType,
    message: string
  ): AsyncGenerator<string, void, unknown> {
    
    logger.info("Starting chat completion", { 
      noteType, 
      historyLength: history.length, 
      messageLength: message.length 
    });

    // 1. Handle Mock/Fallback Mode
    if (!this.ai) {
      yield* this.generateMockResponse();
      return;
    }

    try {
      // 2. Configure Chat
      const chat = this.ai.chats.create({
        model: this.model,
        config: {
          systemInstruction: this.getSystemInstruction(noteType),
          temperature: 0.2, // Low temperature for medical accuracy
          maxOutputTokens: 4000, // Increased for full notes
        },
        history: history.map(h => ({
          role: h.role,
          parts: [{ text: h.content }]
        }))
      });

      // 3. Execute Stream
      const result = await chat.sendMessageStream({ message });

      for await (const chunk of result) {
        if (chunk.text) {
          yield chunk.text;
        }
      }

      logger.info("Chat stream completed successfully");

    } catch (error) {
      logger.error("Gemini API Error in streamChat", error);
      yield "\n\n**Error: Unable to connect to Medical AI Service. Please check your connection or credentials.**";
    }
  }

  /**
   * Generates a structured JSON response.
   * Mirrors the Python `parse_json` logic.
   */
  public async generateJson(
    noteType: NoteType, 
    prompt: string
  ): Promise<any> {
    logger.info("Starting JSON generation", { noteType });

    if (!this.ai) {
        throw new Error("Cannot generate JSON in demo mode");
    }

    try {
        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: prompt,
            config: {
                systemInstruction: this.getSystemInstruction(noteType),
                responseMimeType: "application/json",
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("Empty response from model");
        
        const json = JSON.parse(text);
        logger.info("JSON parsing successful");
        return json;

    } catch (error) {
        logger.error("Failed to generate/parse JSON", error);
        throw error;
    }
  }

  /**
   * Fallback generator for demo mode
   */
  private async *generateMockResponse(): AsyncGenerator<string, void, unknown> {
    const mockResponse = `Based on the patient's presentation, here is the generated SOAP note:\n\n# Subjective\nPatient reports a 3-day history of sore throat and low-grade fever (100.4°F). Describes pain as 6/10, worsening with swallowing. Denies cough or rhinorrhea.\n\n# Objective\n- Vitals: T 100.4, BP 120/80, HR 88, RR 16\n- HEENT: Pharynx erythematous with bilateral tonsillar exudate (2+). Anterior cervical lymphadenopathy present.\n- Lungs: Clear to auscultation.\n\n# Assessment\n1. Acute Pharyngitis, likely Streptococcal\n2. Fever\n\n# Plan\n1. Perform Rapid Strep Test.\n2. If positive, start Amoxicillin 500mg BID x 10 days.\n3. Supportive care: Acetaminophen, hydration.\n4. Follow up if symptoms worsen.`;
    
    const chunks = mockResponse.split(/(?=[ #\n])/);
    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
      yield chunk;
    }
  }
}

// Export a singleton or factory if needed, or just the class
export const geminiService = new GeminiService();