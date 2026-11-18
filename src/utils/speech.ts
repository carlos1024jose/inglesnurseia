export type HdVoiceName = "Kore" | "Zephyr" | "Puck" | "Charon";

export interface RankedVoice {
  voice: SpeechSynthesisVoice;
  quality: "Alta claridad" | "Estándar";
  score: number;
}

export interface SpeechOptions {
  rate?: number;
  voiceURI?: string;
  hdVoice?: HdVoiceName;
  preferHD?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (reason: string) => void;
  onEngineUsed?: (engine: "hd" | "browser", label: string) => void;
}

let activeAudioEl: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let pendingTimer: number | null = null;
let hdTtsAvailable: boolean | null = null;
const clientAudioCache = new Map<string, string>();

export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

/**
 * Normalizes clinical acronyms and formatting so TTS engines pronounce
 * medical terms clearly instead of spelling symbols or misreading parentheses.
 */
export function prepareClinicalSpeechText(rawText: string): string {
  return rawText
    .replace(/\(BP\)/gi, "")
    .replace(/\(HR\)/gi, "")
    .replace(/\(RR\)/gi, "")
    .replace(/\(IV\)/gi, "")
    .replace(/\(ER\)/gi, "")
    .replace(/\(ICU\)/gi, "")
    .replace(/\(OR\)/gi, "")
    .replace(/\(RN\)/gi, "")
    .replace(/\(SpO2\)/gi, "")
    .replace(/\bSpO2\b/gi, "S P O 2")
    .replace(/\bmmHg\b/gi, "millimeters of mercury")
    .replace(/\bIV\b/g, "I V")
    .replace(/\bIM\b/g, "I M")
    .replace(/\s*\/\s*/g, ", or ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let score = 0;

  if (
    name.includes("natural") ||
    name.includes("neural") ||
    name.includes("online")
  ) {
    score += 120;
  }
  if (name.includes("google us english")) score += 110;
  if (name.includes("google uk english")) score += 100;
  if (
    name.includes("samantha") ||
    name.includes("ava") ||
    name.includes("allison") ||
    name.includes("jenny") ||
    name.includes("aria") ||
    name.includes("guy") ||
    name.includes("ryan") ||
    name.includes("daniel") ||
    name.includes("karen") ||
    name.includes("serena")
  ) {
    score += 80;
  }
  if (!v.localService) score += 25;
  if (lang === "en-us") score += 30;
  else if (lang === "en-gb") score += 24;
  else if (lang.startsWith("en-")) score += 15;

  if (
    name.includes("espeak") ||
    name.includes("compact") ||
    name.includes("festival")
  ) {
    score -= 90;
  }

  return score;
}

export function getRankedEnglishVoices(): RankedVoice[] {
  if (!isSpeechSynthesisSupported()) {
    return [];
  }
  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("en"));

  return voices
    .map((voice) => {
      const score = scoreVoice(voice);
      return {
        voice,
        score,
        quality: (score >= 60 ? "Alta claridad" : "Estándar") as
          | "Alta claridad"
          | "Estándar",
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  return getRankedEnglishVoices().map((item) => item.voice);
}

export function stopSpeaking(): void {
  if (pendingTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  if (activeAudioEl) {
    activeAudioEl.pause();
    activeAudioEl.currentTime = 0;
    activeAudioEl = null;
  }
  activeUtterance = null;
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

function speakWithBrowser(cleanText: string, options: SpeechOptions): void {
  if (!isSpeechSynthesisSupported()) {
    options.onError?.(
      "Tu navegador no es compatible con la reproducción de voz."
    );
    return;
  }

  const startUtterance = () => {
    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      activeUtterance = utterance;
      utterance.lang = "en-US";
      utterance.rate = options.rate ?? 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;

      const ranked = getRankedEnglishVoices();
      let chosenVoice: SpeechSynthesisVoice | undefined;

      if (options.voiceURI) {
        chosenVoice = ranked.find(
          (r) => r.voice.voiceURI === options.voiceURI
        )?.voice;
      }
      if (!chosenVoice && ranked.length > 0) {
        chosenVoice = ranked[0].voice;
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      }

      utterance.onstart = () => {
        options.onEngineUsed?.(
          "browser",
          chosenVoice ? chosenVoice.name : "Voz del navegador (en-US)"
        );
        options.onStart?.();
      };
      utterance.onend = () => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        options.onEnd?.();
      };
      utterance.onerror = () => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        options.onError?.(
          "No se pudo reproducir el audio en este dispositivo."
        );
      };

      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch {
      options.onError?.("Error al iniciar la reproducción de voz.");
    }
  };

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    // Brief delay prevents Chromium from clipping the first syllable after cancel()
    pendingTimer = window.setTimeout(() => {
      pendingTimer = null;
      startUtterance();
    }, 60);
  } else {
    startUtterance();
  }
}

async function trySpeakWithHD(
  cleanText: string,
  options: SpeechOptions
): Promise<boolean> {
  if (hdTtsAvailable === false || options.preferHD === false) {
    return false;
  }
  if (cleanText.length > 380) {
    return false;
  }

  const voiceName: HdVoiceName = options.hdVoice ?? "Kore";
  const slow = (options.rate ?? 0.85) < 0.8;
  const cacheKey = `${voiceName}:${slow ? "slow" : "clear"}:${cleanText.toLowerCase()}`;

  let dataUrl = clientAudioCache.get(cacheKey);
  if (!dataUrl) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4500);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, voiceName, slow }),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 503 || res.status === 502) {
          hdTtsAvailable = false;
        }
        return false;
      }

      const data = (await res.json()) as {
        audioBase64?: string;
        mimeType?: string;
      };
      if (!data.audioBase64) {
        return false;
      }

      hdTtsAvailable = true;
      dataUrl = `data:${data.mimeType || "audio/wav"};base64,${data.audioBase64}`;
      clientAudioCache.set(cacheKey, dataUrl);
    } catch {
      window.clearTimeout(timeoutId);
      return false;
    }
  }

  return new Promise<boolean>((resolve) => {
    try {
      const audio = new Audio(dataUrl);
      activeAudioEl = audio;
      const requestedRate = options.rate ?? 0.85;
      audio.playbackRate =
        requestedRate >= 1.1 ? 1.1 : requestedRate <= 0.72 ? 0.92 : 1.0;

      audio.onplay = () => {
        options.onEngineUsed?.("hd", `Voz HD Natural (${voiceName})`);
        options.onStart?.();
      };
      audio.onended = () => {
        if (activeAudioEl === audio) activeAudioEl = null;
        options.onEnd?.();
      };
      audio.onerror = () => {
        if (activeAudioEl === audio) activeAudioEl = null;
        resolve(false);
      };

      audio
        .play()
        .then(() => resolve(true))
        .catch(() => {
          if (activeAudioEl === audio) activeAudioEl = null;
          resolve(false);
        });
    } catch {
      resolve(false);
    }
  });
}

export async function speakEnglish(
  text: string,
  options: SpeechOptions = {}
): Promise<void> {
  const prepared = prepareClinicalSpeechText(text);
  if (!prepared) {
    options.onError?.("No hay texto disponible para reproducir.");
    return;
  }

  stopSpeaking();

  if (options.preferHD !== false && hdTtsAvailable !== false) {
    const playedHD = await trySpeakWithHD(prepared, options);
    if (playedHD) {
      return;
    }
  }

  speakWithBrowser(prepared, options);
}
