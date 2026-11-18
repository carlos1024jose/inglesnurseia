import { useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  Copy,
  Eraser,
  Languages,
  Loader2,
  Volume2,
} from "lucide-react";
import { speakEnglish } from "../utils/speech";

type LangPair = "en|es" | "es|en";

const QUICK_EXAMPLES: { pair: LangPair; text: string }[] = [
  { pair: "en|es", text: "The patient reports shortness of breath and chest pain." },
  { pair: "en|es", text: "Please take a deep breath while I check your lungs." },
  { pair: "es|en", text: "Voy a tomarle la presión arterial y la temperatura." },
  { pair: "es|en", text: "¿Es alérgico a algún medicamento?" },
];

export default function TranslatorSection() {
  const [langPair, setLangPair] = useState<LangPair>("en|es");
  const [sourceText, setSourceText] = useState("");
  const [submittedOriginal, setSubmittedOriginal] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [speechNotice, setSpeechNotice] = useState("");

  const isEnToEs = langPair === "en|es";
  const sourceLabel = isEnToEs ? "Inglés" : "Español";
  const targetLabel = isEnToEs ? "Español" : "Inglés";

  const handleSwapLanguages = () => {
    const nextPair: LangPair = isEnToEs ? "es|en" : "en|es";
    setLangPair(nextPair);
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText("");
      setSubmittedOriginal("");
    }
    setErrorMessage("");
    setCopied(false);
  };

  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setCopied(false);
    setSpeechNotice("");

    const trimmed = sourceText.trim();
    if (!trimmed) {
      setErrorMessage("Por favor introduce una palabra, frase o texto antes de traducir.");
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        trimmed
      )}&langpair=${encodeURIComponent(langPair)}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        responseStatus?: number;
        responseData?: { translatedText?: string };
        responseDetails?: string;
      };

      const result = data?.responseData?.translatedText?.trim();
      if (!result || data?.responseStatus === 403) {
        throw new Error(data?.responseDetails || "Respuesta inválida del servicio.");
      }

      setSubmittedOriginal(trimmed);
      setTranslatedText(result);
    } catch {
      setErrorMessage(
        "No se pudo completar la traducción por un error de conexión con MyMemory Translation API. Verifica tu red e inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage("No fue posible copiar el texto automáticamente en este navegador.");
    }
  };

  const handleClear = () => {
    setSourceText("");
    setSubmittedOriginal("");
    setTranslatedText("");
    setErrorMessage("");
    setCopied(false);
    setSpeechNotice("");
  };

  const handleSpeakEnglish = (textToSpeak: string) => {
    setSpeechNotice("");
    void speakEnglish(textToSpeak, {
      rate: 0.85,
      onError: (reason) => setSpeechNotice(reason),
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-sky-700">
            Traductor clínico bidireccional · MyMemory Translation API
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Traductor Médico de Enfermería
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Escribe palabras, indicaciones o pequeños textos clínicos para traducir entre inglés y español.
          </p>
        </div>
      </div>

      {/* Direction Bar + Quick Examples */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setLangPair("en|es");
                  setErrorMessage("");
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                  isEnToEs
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Inglés → Español
              </button>
              <button
                type="button"
                onClick={() => {
                  setLangPair("es|en");
                  setErrorMessage("");
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                  !isEnToEs
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Español → Inglés
              </button>
            </div>

            <button
              type="button"
              onClick={handleSwapLanguages}
              title="Intercambiar idiomas"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Invertir</span>
            </button>
          </div>

          <span className="text-xs text-slate-500">
            Origen: <strong className="text-slate-800">{sourceLabel}</strong> · Destino:{" "}
            <strong className="text-slate-800">{targetLabel}</strong>
          </span>
        </div>

        {/* Input and Output Split */}
        <form onSubmit={handleTranslate} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Source Box */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="translator-source"
                  className="text-sm font-semibold text-slate-800"
                >
                  Texto original ({sourceLabel})
                </label>
                {isEnToEs && sourceText.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSpeakEnglish(sourceText)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Escuchar en inglés</span>
                  </button>
                )}
              </div>
              <textarea
                id="translator-source"
                rows={6}
                value={sourceText}
                onChange={(e) => {
                  setSourceText(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder={
                  isEnToEs
                    ? "Ejemplo: Measure the patient's vital signs and document any fever."
                    : "Ejemplo: Voy a revisar sus signos vitales y administrar el analgésico."
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20 resize-y min-h-[168px]"
              />
              <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                <span>Máximo recomendado: 500 caracteres por consulta</span>
                <span className="font-mono tabular-nums">{sourceText.length} caracteres</span>
              </div>
            </div>

            {/* Translation Result Box */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">
                  Traducción ({targetLabel})
                </span>
                {!isEnToEs && translatedText && (
                  <button
                    type="button"
                    onClick={() => handleSpeakEnglish(translatedText)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Escuchar en inglés</span>
                  </button>
                )}
              </div>

              <div
                aria-live="polite"
                className="flex-1 min-h-[168px] rounded-xl border border-slate-200 bg-sky-50/40 px-4 py-3 flex flex-col justify-between"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-sky-700 my-auto">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Traduciendo texto clínico...</span>
                  </div>
                ) : translatedText ? (
                  <div className="space-y-3">
                    <p className="text-sm sm:text-base text-slate-900 font-medium leading-relaxed whitespace-pre-wrap">
                      {translatedText}
                    </p>
                    {submittedOriginal && (
                      <div className="pt-3 border-t border-sky-200/70 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Original:</span>{" "}
                        {submittedOriginal}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 my-auto">
                    Aquí aparecerá la traducción junto con la referencia del texto original.
                  </p>
                )}
              </div>

              <div className="mt-1.5 flex items-center justify-end gap-2 min-h-[16px]">
                {copied && (
                  <span className="text-xs font-medium text-emerald-700">
                    Traducción copiada al portapapeles
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Error & Notice Feedback */}
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {speechNotice && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              <span>{speechNotice}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4" />
                )}
                <span>{isLoading ? "Traduciendo..." : "Traducir"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyResult}
                disabled={!translatedText}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-45 rounded-lg transition-colors whitespace-nowrap"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copied ? "Copiado" : "Copiar resultado"}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <Eraser className="w-4 h-4" />
                <span>Limpiar campos</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Nursing Examples */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-700 mb-2.5">
            Ejemplos rápidos de Enfermería (haz clic para cargar):
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setLangPair(ex.pair);
                  setSourceText(ex.text);
                  setTranslatedText("");
                  setSubmittedOriginal("");
                  setErrorMessage("");
                }}
                className="text-left text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 text-slate-700 transition-colors"
              >
                <span className="font-mono text-sky-700 mr-1.5">
                  {ex.pair === "en|es" ? "EN→ES" : "ES→EN"}
                </span>
                {ex.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
