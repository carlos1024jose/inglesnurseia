import {
  isGeminiConfigured,
  sendJson,
  type VercelReq,
  type VercelRes,
} from "../_gemini.js";

export default function handler(_req: VercelReq, res: VercelRes) {
  const configured = isGeminiConfigured();
  sendJson(res, 200, {
    configured,
    provider: configured ? "gemini" : null,
  });
}
