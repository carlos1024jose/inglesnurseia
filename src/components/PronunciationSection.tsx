import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Square, Volume2 } from "lucide-react";
import { PRONUNCIATION_PHRASES } from "../data/pronunciationPhrases";
import {
  getRankedEnglishVoices,
  HdVoiceName,
  isSpeechSynthesisSupported,
  RankedVoice,
  speakEnglish,
  stopSpeaking,
} from "../utils/speech";

const HD_VOICES: { id: HdVoiceName; label: string }[] = [
  { id: "Kore", label: "Kore · Clara y profesional" },
  { id: "Zephyr", label: "Zephyr · Cálida y pausada" },
  { id: "Charon", label: "Charon · Grave y articulada" },
  { id: "Puck", label: "Puck · Ligera y dinámica" },
];

export default function PronunciationSection() {
  const [supported] = useState(() => isSpeechSynthesisSupported());
  const [rankedVoices, setRankedVoices] = useState<RankedVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [hdVoice, setHdVoice] = useState<HdVoiceName>("Kore");
  const [preferHD, setPreferHD] = useState(true);
  const [rate, setRate] = useState<number>(0.85);
  const [customText, setCustomText] = useState(
    "I am going to check your blood pressure and oxygen saturation."
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeVoiceLabel, setActiveVoiceLabel] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      const ranked = getRankedEnglishVoices();
      setRankedVoices(ranked);
      if (ranked.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(ranked[0].voice.voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      stopSpeaking();
    };
  }, [supported, selectedVoiceURI]);

  const handlePlay = (id: string, text: string) => {
    setStatusMessage("");
    if (!text.trim()) {
      setStatusMessage("Escribe una palabra o expresión en inglés para escucharla.");
      return;
    }

    void speakEnglish(text, {
      rate,
      voiceURI: selectedVoiceURI || undefined,
      hdVoice,
      preferHD,
      onEngineUsed: (_engine, label) => {
        setActiveVoiceLabel(label);
      },
      onStart: () => setActiveId(id),
      onEnd: () => setActiveId((prev) => (prev === id ? null : prev)),
      onError: (reason) => {
        setActiveId(null);
        setStatusMessage(reason);
      },
    });
  };

  const handleStop = () => {
    stopSpeaking();
    setActiveId(null);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <div>
        <p className="text-xs font-medium text-sky-700">
          Entrenamiento auditivo · Voz optimizada para claridad clínica
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          Práctica de Pronunciación Clínica
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Escucha palabras y expresiones reales de Enfermería con velocidad pausada, prioridad en voces naturales y normalización de siglas médicas.
        </p>
      </div>

      {!supported && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <span>
            Este navegador no ofrece soporte para SpeechSynthesis. Aún puedes consultar la guía fonética aproximada junto a cada expresión.
          </span>
        </div>
      )}

      {/* Voice Clarity Controls & Free Practice Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-5 border-b border-slate-100">
          {/* Speed Selector */}
          <div>
            <label
              htmlFor="speech-rate"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Velocidad y claridad al hablar
            </label>
            <div
              id="speech-rate"
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setRate(0.7)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  rate === 0.7
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                0.70x Muy lento
              </button>
              <button
                type="button"
                onClick={() => setRate(0.85)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  rate === 0.85
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                0.85x Claro
              </button>
              <button
                type="button"
                onClick={() => setRate(1.0)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  rate === 1.0
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1.0x Normal
              </button>
            </div>
          </div>

          {/* Device Voice Selector (Ranked by Clarity) */}
          <div>
            <label
              htmlFor="voice-select"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Voz del dispositivo (ordenadas por claridad)
            </label>
            <select
              id="voice-select"
              disabled={!supported || rankedVoices.length === 0}
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20 disabled:bg-slate-100 disabled:text-slate-500"
            >
              {rankedVoices.length === 0 ? (
                <option value="">Voz predeterminada en inglés (en-US)</option>
              ) : (
                rankedVoices.map((item) => (
                  <option key={item.voice.voiceURI} value={item.voice.voiceURI}>
                    [{item.quality}] {item.voice.name} ({item.voice.lang})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Mode & HD Voice Selector */}
          <div>
            <label
              htmlFor="hd-voice-select"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Preferencia de motor de voz
            </label>
            <div className="flex items-center gap-2">
              <select
                id="hd-voice-select"
                value={preferHD ? hdVoice : "browser"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "browser") {
                    setPreferHD(false);
                  } else {
                    setPreferHD(true);
                    setHdVoice(val as HdVoiceName);
                  }
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              >
                {HD_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    Auto HD: {v.label}
                  </option>
                ))}
                <option value="browser">Solo voz del dispositivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tip + Active Voice Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sky-50/70 border border-sky-100 rounded-xl px-4 py-3 text-xs text-slate-700">
          <p className="leading-relaxed">
            <strong className="font-semibold text-sky-900">Consejo para escuchar más claro:</strong>{" "}
            Usa la velocidad <strong>0.85x Claro</strong> o <strong>0.70x Muy lento</strong>. Si tu equipo tiene varias voces instaladas, elige las marcadas como{" "}
            <strong>[Alta claridad]</strong> (como <em>Google US English</em>, <em>Natural</em> o <em>Samantha</em>).
          </p>
          <button
            type="button"
            onClick={() =>
              handlePlay("test-clarity", "Please take a deep breath and relax your arm.")
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-white border border-sky-200 hover:bg-sky-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Probar claridad</span>
          </button>
        </div>

        {activeVoiceLabel && (
          <div className="flex items-center gap-2 text-xs text-sky-800">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              Reproduciendo con: <strong className="font-semibold">{activeVoiceLabel}</strong>{" "}
              ({rate === 0.7 ? "0.70x Muy lento" : rate === 0.85 ? "0.85x Claro" : "1.0x Normal"})
            </span>
          </div>
        )}

        {/* Custom Phrase Practice */}
        <div className="space-y-3">
          <label
            htmlFor="custom-pronunciation"
            className="block text-sm font-semibold text-slate-900"
          >
            Práctica libre: escribe cualquier palabra o frase en inglés
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="custom-pronunciation"
              type="text"
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                if (statusMessage) setStatusMessage("");
              }}
              placeholder="Ejemplo: Do you have any pain or dizziness?"
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm sm:text-base text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={!supported && !preferHD}
                onClick={() => handlePlay("custom", customText)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
              >
                <Volume2 className="w-4 h-4" />
                <span>{activeId === "custom" ? "Reproduciendo..." : "Escuchar"}</span>
              </button>
              {activeId && (
                <button
                  type="button"
                  onClick={handleStop}
                  aria-label="Detener reproducción"
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Detener</span>
                </button>
              )}
            </div>
          </div>

          {statusMessage && (
            <p className="text-xs sm:text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2">
              {statusMessage}
            </p>
          )}
        </div>
      </div>

      {/* Clinical Expressions Grid */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Expresiones frecuentes en el entorno clínico
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRONUNCIATION_PHRASES.map((item) => {
            const isActive = activeId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-sky-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-sky-700">
                      {item.scenario}
                    </p>
                    <p className="font-display text-base sm:text-lg font-semibold text-slate-900 mt-1">
                      {item.english}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {item.spanish}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlay(item.id, item.english)}
                    aria-label={`Reproducir pronunciación: ${item.english}`}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors whitespace-nowrap ${
                      isActive
                        ? "bg-sky-700 text-white"
                        : "bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100"
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isActive ? "Sonando" : "Escuchar"}</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Guía fonética:</span>{" "}
                    <span className="font-mono text-slate-800">{item.pronunciation}</span>
                  </p>
                  <p className="text-slate-500">{item.clinicalNote}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
