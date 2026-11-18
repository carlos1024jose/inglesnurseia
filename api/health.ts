import { sendJson, type VercelReq, type VercelRes } from "./_gemini.js";

export default function handler(_req: VercelReq, res: VercelRes) {
  sendJson(res, 200, { ok: true, runtime: "vercel" });
}
