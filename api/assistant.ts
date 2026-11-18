import {
  generateNursingReply,
  getGeminiClient,
  parseJsonBody,
  type AssistantHistoryItem,
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
      error: "API_NOT_CONFIGURED",
      message:
        "No existe una API de inteligencia artificial conectada en este entorno. Verifica GEMINI_API_KEY en Vercel.",
    });
    return;
  }

  const body = parseJsonBody<{ question?: unknown; history?: unknown }>(req);
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

  try {
    const reply = await generateNursingReply(ai, question, safeHistory);
    if (!reply) {
      res.status(502).json({
        error: "EMPTY_MODEL_RESPONSE",
        message:
          "El servicio de inteligencia artificial no devolvió contenido. Intenta reformular tu consulta.",
      });
      return;
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Vercel Gemini API error:", error);
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
          "La clave GEMINI_API_KEY configurada en Vercel no es válida o no tiene permisos.",
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
}
