import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(
    key &&
      key !== "MY_GEMINI_API_KEY" &&
      key !== "YOUR_API_KEY" &&
      key.length > 10
  );
}

function getGeminiClient(): GoogleGenAI | null {
  if (!isGeminiConfigured()) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `Eres el asistente educativo de English Nurse AI, una plataforma digital dirigida a estudiantes de Enfermería que aprenden inglés técnico del área de la salud.

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

interface AssistantHistoryItem {
  role: "user" | "assistant";
  content: string;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/assistant/status", (_req, res) => {
    res.json({
      configured: isGeminiConfigured(),
      provider: isGeminiConfigured() ? "gemini" : null,
    });
  });

  app.post("/api/translate", async (req, res) => {
    const body = req.body as { text?: unknown; langPair?: unknown };
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const langPair = body?.langPair === "es|en" ? "es|en" : "en|es";

    if (!text) {
      res.status(400).json({
        error: "EMPTY_TEXT",
        message: "Por favor introduce un texto antes de traducir.",
      });
      return;
    }

    if (text.length > 2000) {
      res.status(400).json({
        error: "TEXT_TOO_LONG",
        message: "El texto supera el límite de 2,000 caracteres.",
      });
      return;
    }

    const deeplKey = process.env.DEEPL_API_KEY?.trim();
    const hasDeepL = Boolean(
      deeplKey &&
        deeplKey !== "MY_DEEPL_API_KEY" &&
        deeplKey !== "YOUR_API_KEY" &&
        deeplKey.length > 10
    );

    if (hasDeepL && deeplKey) {
      const endpoint = deeplKey.endsWith(":fx")
        ? "https://api-free.deepl.com/v2/translate"
        : "https://api.deepl.com/v2/translate";
      const [sourceLang, targetLang] =
        langPair === "en|es" ? ["EN", "ES"] : ["ES", "EN"];

      try {
        const deeplRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `DeepL-Auth-Key ${deeplKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: [text],
            source_lang: sourceLang,
            target_lang: targetLang,
          }),
        });

        if (deeplRes.ok) {
          const data = (await deeplRes.json()) as {
            translations?: Array<{ text?: string }>;
          };
          const translatedText = data?.translations?.[0]?.text?.trim();
          if (translatedText) {
            res.json({ translatedText, provider: "deepl" });
            return;
          }
        } else {
          console.error("DeepL API error status:", deeplRes.status);
        }
      } catch (err) {
        console.error("DeepL API request failed:", err);
      }
    }

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=${encodeURIComponent(langPair)}`;
      const mmRes = await fetch(url);
      if (!mmRes.ok) {
        throw new Error(`HTTP ${mmRes.status}`);
      }
      const data = (await mmRes.json()) as {
        responseStatus?: number;
        responseData?: { translatedText?: string };
        responseDetails?: string;
      };
      const translatedText = data?.responseData?.translatedText?.trim();
      if (!translatedText || data?.responseStatus === 403) {
        throw new Error(data?.responseDetails || "Respuesta inválida.");
      }
      res.json({ translatedText, provider: "mymemory" });
    } catch {
      res.status(502).json({
        error: "TRANSLATION_FAILED",
        message:
          "No se pudo completar la traducción. Verifica tu conexión e inténtalo de nuevo.",
      });
    }
  });

  app.post("/api/assistant", async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: "API_NOT_CONFIGURED",
        message:
          "No existe una API de inteligencia artificial conectada en este entorno. Esta sección no simula respuestas de IA y permanece preparada para una integración futura.",
      });
      return;
    }

    const body = req.body as {
      question?: unknown;
      history?: unknown;
    };

    const question =
      typeof body?.question === "string" ? body.question.trim() : "";

    if (!question) {
      res.status(400).json({
        error: "EMPTY_QUESTION",
        message: "Por favor escribe una consulta antes de enviar.",
      });
      return;
    }

    if (question.length > 1500) {
      res.status(400).json({
        error: "QUESTION_TOO_LONG",
        message:
          "La consulta excede el límite permitido de 1,500 caracteres. Intenta resumir tu pregunta.",
      });
      return;
    }

    const rawHistory = Array.isArray(body?.history) ? body.history : [];
    const safeHistory: AssistantHistoryItem[] = rawHistory
      .filter(
        (item): item is AssistantHistoryItem =>
          Boolean(item) &&
          typeof item === "object" &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string" &&
          item.content.trim().length > 0
      )
      .slice(-6);

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

    try {
      const configuredModel = process.env.GEMINI_MODEL?.trim();
      let response;
      if (configuredModel) {
        response = await ai.models.generateContent({
          model: configuredModel,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
      } else {
        try {
          response = await ai.models.generateContent({
            model: "gemini-4-hydrogen",
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
            },
          });
        } catch (primaryErr) {
          const pErr = primaryErr as { status?: number; message?: string };
          const pMsg = (pErr?.message ?? "").toLowerCase();
          if (
            pErr?.status === 404 ||
            pErr?.status === 400 ||
            pMsg.includes("not found") ||
            pMsg.includes("is not supported") ||
            pMsg.includes("model")
          ) {
            response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents,
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
              },
            });
          } else {
            throw primaryErr;
          }
        }
      }

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({
          error: "EMPTY_MODEL_RESPONSE",
          message:
            "El servicio de inteligencia artificial no devolvió contenido. Intenta reformular tu consulta.",
        });
        return;
      }

      res.json({ reply });
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errObj = error as { status?: number; message?: string };
      const errStatus = errObj?.status;
      const errMessage = errObj?.message ?? "Error desconocido";

      if (
        errStatus === 403 ||
        errMessage.includes("403") ||
        errMessage.includes("PERMISSION_DENIED") ||
        errMessage.includes("API_KEY_INVALID") ||
        errMessage.includes("API key not valid")
      ) {
        res.status(502).json({
          error: "AI_AUTH_ERROR",
          message:
            "La API de inteligencia artificial no está autorizada o la clave configurada no es válida en este entorno. No se muestran respuestas simuladas.",
        });
        return;
      }

      if (
        errStatus === 429 ||
        errMessage.includes("429") ||
        errMessage.includes("RESOURCE_EXHAUSTED")
      ) {
        res.status(429).json({
          error: "AI_RATE_LIMIT",
          message:
            "Se alcanzó temporalmente el límite de consultas del servicio de IA. Espera unos segundos e inténtalo de nuevo.",
        });
        return;
      }

      res.status(502).json({
        error: "AI_UPSTREAM_ERROR",
        message:
          "Ocurrió un error al consultar el servicio de inteligencia artificial. Por favor intenta nuevamente.",
      });
    }
  });

  const ttsCache = new Map<string, string>();
  const ALLOWED_TTS_VOICES = new Set(["Kore", "Zephyr", "Puck", "Charon"]);

  app.post("/api/tts", async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: "TTS_NOT_CONFIGURED",
        message: "El servicio de voz HD no está configurado en este entorno.",
      });
      return;
    }

    const body = req.body as {
      text?: unknown;
      voiceName?: unknown;
      slow?: unknown;
    };

    const rawText = typeof body?.text === "string" ? body.text.trim() : "";
    if (!rawText) {
      res.status(400).json({ error: "EMPTY_TEXT", message: "Texto vacío." });
      return;
    }
    if (rawText.length > 400) {
      res.status(400).json({
        error: "TEXT_TOO_LONG",
        message: "El texto para pronunciar excede el máximo de 400 caracteres.",
      });
      return;
    }

    const voiceName =
      typeof body?.voiceName === "string" && ALLOWED_TTS_VOICES.has(body.voiceName)
        ? body.voiceName
        : "Kore";
    const slow = Boolean(body?.slow);
    const cacheKey = `${voiceName}:${slow ? "slow" : "clear"}:${rawText.toLowerCase()}`;

    const cached = ttsCache.get(cacheKey);
    if (cached) {
      res.json({ audioBase64: cached, mimeType: "audio/wav", voiceName });
      return;
    }

    try {
      const stylePrompt = slow
        ? "Clear, warm, very slow and articulate English pronunciation instructor for nursing students. Pronounce every syllable distinctly."
        : "Clear, calm, articulate English nursing instructor speaking at a steady, easy-to-understand pace.";

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash-lite-tts",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: rawText,
                  speechMetadata: {
                    style: stylePrompt,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });
      } catch (primaryTtsErr) {
        const pErr = primaryTtsErr as { status?: number; message?: string };
        const pMsg = (pErr?.message ?? "").toLowerCase();
        if (
          pErr?.status === 404 ||
          pErr?.status === 400 ||
          pMsg.includes("not found") ||
          pMsg.includes("model")
        ) {
          const prefix = slow
            ? "Say clearly and very slowly for a nursing student"
            : "Say clearly at a steady pace for a nursing student";
          response = await ai.models.generateContent({
            model:
              process.env.GEMINI_TTS_MODEL?.trim() ||
              "gemini-2.5-flash-preview-tts",
            contents: [
              {
                role: "user",
                parts: [{ text: `${prefix}: ${rawText}` }],
              },
            ],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
              },
            },
          });
        } else {
          throw primaryTtsErr;
        }
      }

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        res.status(502).json({
          error: "EMPTY_AUDIO",
          message: "No se pudo generar el audio.",
        });
        return;
      }

      if (ttsCache.size >= 120) {
        const oldestKey = ttsCache.keys().next().value;
        if (oldestKey) ttsCache.delete(oldestKey);
      }
      ttsCache.set(cacheKey, base64Audio);

      res.json({ audioBase64: base64Audio, mimeType: "audio/wav", voiceName });
    } catch (error) {
      console.error("TTS upstream error:", error);
      res.status(502).json({
        error: "TTS_UPSTREAM_ERROR",
        message: "No se pudo obtener el audio HD en este momento.",
      });
    }
  });

  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      const indexFile = path.join(distDir, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("Build output not found.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`English Nurse AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
