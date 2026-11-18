import { useEffect, useState } from "react";
import {
  AlertCircle,
  Info,
  Loader2,
  MessageSquareText,
  Send,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { ChatMessage } from "../types";

const SUGGESTED_QUESTIONS: string[] = [
  "¿Cuál es la diferencia entre 'symptom' y 'sign' en Enfermería?",
  "Explica cuándo usar 'pain', 'ache' y 'soreness' con ejemplos clínicos.",
  "¿Qué significan las abreviaturas IV, IM, PO y PRN en una indicación?",
  "Dame 3 expresiones sencillas en inglés para tranquilizar a un paciente antes de una inyección.",
];

export default function AssistantSection() {
  const [statusLoading, setStatusLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [statusError, setStatusError] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/assistant/status");
        if (!res.ok) {
          throw new Error("No se pudo verificar el estado del asistente.");
        }
        const data = (await res.json()) as { configured?: boolean };
        if (active) {
          setIsConfigured(Boolean(data.configured));
        }
      } catch {
        if (active) {
          setIsConfigured(false);
          setStatusError(
            "No fue posible comprobar la disponibilidad del servicio de inteligencia artificial."
          );
        }
      } finally {
        if (active) {
          setStatusLoading(false);
        }
      }
    };
    checkStatus();
    return () => {
      active = false;
    };
  }, []);

  const handleSend = async (promptText?: string) => {
    const query = (promptText ?? input).trim();
    setRequestError("");

    if (!isConfigured) {
      setRequestError(
        "No hay una API de inteligencia artificial conectada. Este módulo no genera respuestas simuladas."
      );
      return;
    }

    if (!query) {
      setRequestError("Escribe una duda sobre inglés técnico de Enfermería antes de enviar.");
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!promptText) {
      setInput("");
    }
    setSending(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        message?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(
          data.message || "El servicio de IA no devolvió una respuesta válida."
        );
      }

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setRequestError(
        err instanceof Error
          ? err.message
          : "Error de conexión al consultar al asistente."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-sky-700">
            Apoyo académico · Dudas de inglés técnico en Enfermería
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Asistente Inteligente Educativo
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Resuelve dudas sobre significado de términos médicos, diferencias entre palabras similares, ejemplos y expresiones clínicas.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setRequestError("");
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar conversación</span>
          </button>
        )}
      </div>

      {/* Mandatory Educational Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3.5 text-sm text-sky-950">
        <ShieldAlert className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Propósito estrictamente educativo:</strong> Las explicaciones de este apartado están diseñadas para apoyar el aprendizaje del inglés técnico en Enfermería y{" "}
          <strong className="font-semibold">
            no sustituyen la orientación clínica, supervisión docente ni el criterio de profesionales de la salud.
          </strong>
        </p>
      </div>

      {/* Connection State Check */}
      {statusLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex items-center gap-3 text-sm text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
          <span>Comprobando disponibilidad de la API de inteligencia artificial...</span>
        </div>
      ) : !isConfigured ? (
        /* Unconnected honest state — zero simulated responses */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3.5 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900">
                API de inteligencia artificial no conectada
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {statusError ||
                  "Actualmente no existe una API de inteligencia artificial conectada en este entorno. Por transparencia académica, este apartado no simula respuestas automáticas y permanece preparado para conectarse a un servicio real de IA."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <h3 className="font-display text-sm font-semibold text-slate-900">
                Funciones preparadas para integración
              </h3>
              <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-5">
                <li>Explicación detallada de términos médicos en inglés y español.</li>
                <li>Comparación entre palabras similares (ej. <em>pain</em> vs. <em>ache</em>).</li>
                <li>Ejemplos sencillos de frases usadas en consulta y hospitalización.</li>
                <li>Interpretación educativa de abreviaturas clínicas comunes.</li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <h3 className="font-display text-sm font-semibold text-slate-900">
                Mientras tanto, puedes utilizar
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                El <strong>Traductor Médico</strong> (conectado a MyMemory API), el catálogo de{" "}
                <strong>Vocabulario Técnico</strong> con 9 categorías y el módulo de{" "}
                <strong>Pronunciación</strong> con audio del navegador funcionan al 100%.
              </p>
            </div>
          </div>

          {/* Prepared Input Preview (Disabled cleanly without simulating AI) */}
          <div className="pt-2 border-t border-slate-100 space-y-3 opacity-75">
            <label
              htmlFor="assistant-disabled-input"
              className="block text-xs font-semibold text-slate-700"
            >
              Área de consulta (se habilitará automáticamente al conectar la API de IA)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="assistant-disabled-input"
                type="text"
                disabled
                value=""
                placeholder="Ej. ¿Cuál es la diferencia entre 'dosage' y 'prescription'?"
                className="flex-1 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-400 rounded-lg cursor-not-allowed whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span>Enviar consulta</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Live Connected AI Assistant */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chat Workspace */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 space-y-4 min-h-[340px] max-h-[520px] overflow-y-auto bg-slate-50/40">
              {messages.length === 0 ? (
                <div className="h-full py-10 text-center max-w-md mx-auto space-y-2">
                  <MessageSquareText className="w-10 h-10 text-sky-600 mx-auto" />
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    ¿Qué término o expresión quieres aclarar hoy?
                  </h2>
                  <p className="text-sm text-slate-600">
                    Escribe una duda en español o inglés sobre terminología de Enfermería, o selecciona una consulta sugerida.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? "bg-sky-600 text-white"
                            : "bg-white border border-slate-200 text-slate-800"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 px-1 font-mono tabular-nums">
                        {isUser ? "Estudiante" : "Asistente educativo"} · {msg.timestamp}
                      </span>
                    </div>
                  );
                })
              )}

              {sending && (
                <div className="flex items-center gap-2 text-sm text-sky-700 bg-white border border-slate-200 rounded-xl px-4 py-3 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparando explicación educativa...</span>
                </div>
              )}
            </div>

            {requestError && (
              <div
                role="alert"
                className="mx-4 sm:mx-6 mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs sm:text-sm text-red-800"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{requestError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
                placeholder="Pregunta sobre términos médicos, diferencias o ejemplos de uso..."
                aria-label="Consulta para el asistente de inglés en Enfermería"
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              />
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-55 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Consultar</span>
              </button>
            </form>
          </div>

          {/* Suggested Prompts Sidebar */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Consultas sugeridas
            </h2>
            <p className="text-xs text-slate-600">
              Haz clic en cualquiera de estas preguntas frecuentes para obtener una explicación rápida:
            </p>
            <div className="space-y-2.5">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={sending}
                  onClick={() => void handleSend(q)}
                  className="w-full text-left text-xs sm:text-sm text-slate-700 bg-slate-50 hover:bg-sky-50 hover:text-sky-800 border border-slate-200 hover:border-sky-200 rounded-xl px-3.5 py-2.5 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
