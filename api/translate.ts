import process from "node:process";
import { readJsonBody, sendJson, type VercelReq, type VercelRes } from "./_gemini.js";

function isDeepLConfigured(): boolean {
  const key = process.env.DEEPL_API_KEY?.trim();
  return Boolean(
    key &&
      key !== "MY_DEEPL_API_KEY" &&
      key !== "YOUR_API_KEY" &&
      key.length > 10
  );
}

async function translateWithMyMemory(
  text: string,
  langPair: "en|es" | "es|en"
): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${encodeURIComponent(langPair)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`MyMemory HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    responseStatus?: number;
    responseData?: { translatedText?: string };
    responseDetails?: string;
  };
  const translated = data?.responseData?.translatedText?.trim();
  if (!translated || data?.responseStatus === 403) {
    throw new Error(data?.responseDetails || "MyMemory invalid response");
  }
  return translated;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "METHOD_NOT_ALLOWED", message: "Use POST." });
    return;
  }

  const body = await readJsonBody<{ text?: unknown; langPair?: unknown }>(req);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const langPair = body?.langPair === "es|en" ? "es|en" : "en|es";

  if (!text) {
    sendJson(res, 400, {
      error: "EMPTY_TEXT",
      message: "Por favor introduce un texto antes de traducir.",
    });
    return;
  }

  if (text.length > 2000) {
    sendJson(res, 400, {
      error: "TEXT_TOO_LONG",
      message: "El texto supera el límite de 2,000 caracteres.",
    });
    return;
  }

  if (isDeepLConfigured()) {
    const apiKey = process.env.DEEPL_API_KEY!.trim();
    const endpoint = apiKey.endsWith(":fx")
      ? "https://api-free.deepl.com/v2/translate"
      : "https://api.deepl.com/v2/translate";
    const [sourceLang, targetLang] =
      langPair === "en|es" ? ["EN", "ES"] : ["ES", "EN"];

    try {
      const deeplRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${apiKey}`,
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
          sendJson(res, 200, {
            translatedText,
            provider: "deepl",
          });
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
    const translatedText = await translateWithMyMemory(text, langPair);
    sendJson(res, 200, {
      translatedText,
      provider: "mymemory",
    });
  } catch (err) {
    console.error("Translation fallback error:", err);
    sendJson(res, 502, {
      error: "TRANSLATION_FAILED",
      message:
        "No se pudo completar la traducción en este momento. Verifica tu conexión e inténtalo de nuevo.",
    });
  }
}
