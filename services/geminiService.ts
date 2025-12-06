import { GoogleGenAI } from "@google/genai";
import { NoteType } from "../types";

// Helper to determine system instruction based on note type
const getSystemInstruction = (noteType: NoteType): string => {
  const baseInstruction = `You are an expert medical AI assistant for MediGentX. Your goal is to assist healthcare professionals in generating accurate, professional medical documentation.`;
  
  switch (noteType) {
    case NoteType.Psychiatry:
      return `${baseInstruction} Focus on mental status examination, mood, affect, and risk assessment. Generate notes in a psychiatric format.`;
    case NoteType.Operative:
      return `${baseInstruction} Focus on surgical procedure details, findings, anesthesia, and immediate post-op plan.`;
    default:
      return `${baseInstruction} Generate standard SOAP notes (Subjective, Objective, Assessment, Plan). Ensure medical terminology is precise.`;
  }
};

export const streamMedicalResponse = async function* (
  history: { role: string; content: string }[],
  noteType: NoteType,
  message: string
): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("No API KEY found. Returning mock stream.");
    // Fallback to mock if no key
    const mockResponse = `Based on the patient's presentation, here is the generated SOAP note:\n\n# Subjective\nPatient reports a 3-day history of sore throat and low-grade fever (100.4°F). Describes pain as 6/10, worsening with swallowing. Denies cough or rhinorrhea.\n\n# Objective\n- Vitals: T 100.4, BP 120/80, HR 88, RR 16\n- HEENT: Pharynx erythematous with bilateral tonsillar exudate (2+). Anterior cervical lymphadenopathy present.\n- Lungs: Clear to auscultation.\n\n# Assessment\n1. Acute Pharyngitis, likely Streptococcal\n2. Fever\n\n# Plan\n1. Perform Rapid Strep Test.\n2. If positive, start Amoxicillin 500mg BID x 10 days.\n3. Supportive care: Acetaminophen, hydration.\n4. Follow up if symptoms worsen.`;
    
    const chunks = mockResponse.split(/(?=[ #\n])/); // Split by logical chunks
    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50)); // Simulate typing
      yield chunk;
    }
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // We use the chat feature to maintain context
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(noteType),
        temperature: 0.2, // Low temperature for medical accuracy
        maxOutputTokens: 2000,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessageStream({ message });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "\n\n**Error: Unable to connect to Medical AI Service. Please check your connection or credentials.**";
  }
};