import {
  isGeminiConfigured,
  type VercelReq,
  type VercelRes,
} from "../_gemini";

export default function handler(_req: VercelReq, res: VercelRes) {
  const configured = isGeminiConfigured();
  res.status(200).json({
    configured,
    provider: configured ? "gemini" : null,
  });
}
