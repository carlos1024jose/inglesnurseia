import { GoogleGenAI } from "@google/genai";

export interface VercelReq {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

export interface VercelRes {
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
  setHeader?: (name: string, value: string) => void;
}

export interface AssistantHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export const SYSTEM_INSTRUCTION = `Eres el asistente educativo de English Nurse AI, una plataforma digital dirigida a estudiantes de Enfermería que aprenden inglés técnico del área de la salud.

Tu rol es estrictamente educativo:
1. Explicar el significado de términos médicos y de Enfermería en inglés con traducción precisa al español.
2. Aclarar diferencias entre palabras similares o que suelen confundirse (por ejemplo: pain vs ache, symptom vs sign, dosage vs prescription, IV vs IM).
3. Proporcionar ejemplos sencillos y realistas de uso en entorno clínico (incluyendo oración en inglés y traducción al español).
4. Explicar expresiones y abreviaturas comunes utilizadas por personal de enfermería y en la comunicación con pacientes.

Reglas de estilo y seguridad:
- Responde en español claro, estructurado y fácil de leer para estudiantes de Enfermería.
- Incluye los términos técnicos y ejemplos clave en inglés resaltados con claridad.
- Mantén un tono pedagógico, directo y profesional.
- NO des diagnósticos médicos, prescripciones ni recomendaciones clínicas personalizadas. Recuerda brevemente cuando corresponda que tus explicaciones tienen un propósito educativo y no sustituyen la orientación de profesionales de la salud o docentes clínicos.`;

export const ALLOWED_TTS_VOICES = new Set(["Kore", "Zephyr", "Puck", "Charon"]);

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(
    key &&
      key !== "MY_GEMINI_API_KEY" &&
      key !== "YOUR_API_KEY" &&
      key.length > 10
  );
}

export function getGeminiClient(): GoogleGenAI | null {
  if (!isGeminiConfigured()) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

export function parseJsonBody<T = Record<string, unknown>>(req: VercelReq): T {
  const raw = req.body;
  if (!raw) return {} as T;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return {} as T;
    }
  }
  if (Buffer.isBuffer(raw)) {
    try {
      return JSON.parse(raw.toString("utf8")) as T;
    } catch {
      return {} as T;
    }
  }
  if (typeof raw === "object") {
    return raw as T;
  }
  return {} as T;
}

function isModelNotFoundError(error: unknown): boolean {
  const err = error as { status?: number; message?: string };
  const msg = (err?.message ?? "").toLowerCase();
  return (
    err?.status === 404 ||
    msg.includes("not found") ||
    msg.includes("is not supported") ||
    msg.includes("unknown model")
  );
}

export async function generateNursingReply(
  ai: GoogleGenAI,
  question: string,
  safeHistory: AssistantHistoryItem[]
): Promise<string> {
  const contents = [
    ...safeHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    {
      role: "user",
      parts: [{ text: question }],
    },
  ];

  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const candidates = configuredModel
    ? [configuredModel]
    : ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

  let lastError: unknown;
  for (const model of candidates) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });
      return response.text?.trim() ?? "";
    } catch (error) {
      lastError = error;
      if (!isModelNotFoundError(error)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("No available Gemini model succeeded.");
}

export function ensurePlayableWav(
  base64Data: string,
  mimeType?: string
): { audioBase64: string; mimeType: string } {
  const lower = (mimeType ?? "").toLowerCase();
  if (!lower.includes("pcm") && !lower.includes("l16")) {
    return {
      audioBase64: base64Data,
      mimeType: mimeType || "audio/wav",
    };
  }

  const rateMatch = lower.match(/rate=(\d+)/);
  const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
  const pcmBuffer = Buffer.from(base64Data, "base64");
  const header = Buffer.alloc(44);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  const wavBuffer = Buffer.concat([header, pcmBuffer]);
  return {
    audioBase64: wavBuffer.toString("base64"),
    mimeType: "audio/wav",
  };
}
