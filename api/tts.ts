import {
  ALLOWED_TTS_VOICES,
  ensurePlayableWav,
  getGeminiClient,
  parseJsonBody,
  type VercelReq,
  type VercelRes,
} from "./_gemini";

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "Use POST." });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(503).json({
      error: "TTS_NOT_CONFIGURED",
      message: "El servicio de voz HD no está configurado en este entorno.",
    });
    return;
  }

  const body = parseJsonBody<{
    text?: unknown;
    voiceName?: unknown;
    slow?: unknown;
  }>(req);

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

  try {
    const ttsModel =
      process.env.GEMINI_TTS_MODEL?.trim() || "gemini-2.5-flash-preview-tts";
    const promptPrefix = slow
      ? "Say clearly and very slowly for a nursing student"
      : "Say clearly at a steady pace for a nursing student";

    const response = await ai.models.generateContent({
      model: ttsModel,
      contents: [
        {
          role: "user",
          parts: [{ text: `${promptPrefix}: ${rawText}` }],
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

    const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const base64Audio = inlineData?.data;

    if (!base64Audio) {
      res.status(502).json({
        error: "EMPTY_AUDIO",
        message: "No se pudo generar el audio.",
      });
      return;
    }

    const playable = ensurePlayableWav(base64Audio, inlineData?.mimeType);
    res.status(200).json({
      audioBase64: playable.audioBase64,
      mimeType: playable.mimeType,
      voiceName,
    });
  } catch (error) {
    console.error("Vercel TTS error:", error);
    res.status(502).json({
      error: "TTS_UPSTREAM_ERROR",
      message: "No se pudo obtener el audio HD en este momento.",
    });
  }
}
