import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Volume2,
} from "lucide-react";
import { TUTORIAL_STEPS } from "../data/tutorialSteps";
import { SectionId } from "../types";
import { speakEnglish } from "../utils/speech";

interface TutorialSectionProps {
  onNavigate: (section: SectionId) => void;
}

export default function TutorialSection({ onNavigate }: TutorialSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentStep = TUTORIAL_STEPS[activeIndex];
  const progressPercent = Math.round(
    ((activeIndex + 1) / TUTORIAL_STEPS.length) * 100
  );

  const handlePreviewAudio = () => {
    void speakEnglish(currentStep.previewSample.english, { rate: 0.85 });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-sky-700">
            Tutorial interactivo · Recorrido guiado
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            ¿Cómo utilizar la plataforma?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Sigue estos 5 pasos interactivos para dominar todas las herramientas de English Nurse AI.
          </p>
        </div>

        <span className="text-sm font-mono font-medium text-sky-700 tabular-nums shrink-0">
          Paso {activeIndex + 1} de {TUTORIAL_STEPS.length} ({progressPercent}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-sky-600 transition-transform duration-200 origin-left"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Step Selector List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-3 space-y-1.5">
          {TUTORIAL_STEPS.map((step, index) => {
            const isActive = index === activeIndex;
            const isCompleted = index < activeIndex;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`w-full text-left px-3.5 py-3 rounded-xl flex items-start gap-3 transition-colors ${
                  isActive
                    ? "bg-sky-600 text-white"
                    : "hover:bg-sky-50 text-slate-700"
                }`}
              >
                <span
                  className={`font-mono text-xs font-semibold w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 tabular-nums ${
                    isActive
                      ? "bg-white/20 text-white"
                      : isCompleted
                      ? "bg-sky-100 text-sky-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  0{step.id}
                </span>
                <span className="text-sm font-medium leading-snug">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Step Detail & Interactive Preview */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-700">
              <Compass className="w-4 h-4" />
              <span>Paso 0{currentStep.id}</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(currentStep.targetSection)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>{currentStep.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              {currentStep.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {currentStep.summary}
            </p>
          </div>

          {/* Numbered Instructions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Qué hacer en este módulo:
            </h3>
            <ul className="space-y-2.5">
              {currentStep.instructions.map((inst, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Mini-Preview Card */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-sky-800">
                Vista previa práctica · {currentStep.previewSample.label}
              </span>
              <button
                type="button"
                onClick={handlePreviewAudio}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-sky-700 bg-white border border-sky-200 hover:bg-sky-100 rounded-md transition-colors whitespace-nowrap"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Escuchar ejemplo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-[11px] font-medium text-slate-500">Inglés</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {currentStep.previewSample.english}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-[11px] font-medium text-slate-500">Español</p>
                <p className="text-sm font-semibold text-sky-800 mt-0.5">
                  {currentStep.previewSample.spanish}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-mono">
              {currentStep.previewSample.detail}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <strong className="font-semibold text-slate-800">Consejo de estudio:</strong>{" "}
            {currentStep.tip}
          </p>

          {/* Prev / Next Navigation */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 rounded-lg transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {activeIndex < TUTORIAL_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) =>
                    Math.min(TUTORIAL_STEPS.length - 1, prev + 1)
                  )
                }
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>Siguiente paso</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate("vocabulario")}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>Comenzar a practicar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
