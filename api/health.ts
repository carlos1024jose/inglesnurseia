import type { VercelReq, VercelRes } from "./_gemini";

export default function handler(_req: VercelReq, res: VercelRes) {
  res.status(200).json({ ok: true, runtime: "vercel" });
}
