import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Languages,
  MessageSquareText,
  Stethoscope,
  Volume2,
} from "lucide-react";
import { SectionId } from "../types";

interface HomeSectionProps {
  onNavigate: (section: SectionId) => void;
}

const HERO_IMAGE = "/src/assets/images/hero_nursing_learning_1794950254630.jpg";
const DESK_IMAGE = "/src/assets/images/clinical_study_desk_1794950255051.jpg";

export default function HomeSection({ onNavigate }: HomeSectionProps) {
  const [heroImgError, setHeroImgError] = useState(false);
  const [deskImgError, setDeskImgError] = useState(false);

  const quickAccessCards: {
    id: SectionId;
    title: string;
    description: string;
    cta: string;
    icon: typeof Languages;
  }[] = [
    {
      id: "traductor",
      title: "Traductor Médico",
      description:
        "Traduce palabras, frases o notas clínicas entre inglés y español en segundos con copia y limpieza rápida.",
      cta: "Abrir traductor",
      icon: Languages,
    },
    {
      id: "vocabulario",
      title: "Vocabulario de Enfermería",
      description:
        "Explora 9 categorías esenciales con definición clínica, pronunciación fonética y buscador inmediato.",
      cta: "Explorar vocabulario",
      icon: BookOpen,
    },
    {
      id: "pronunciacion",
      title: "Práctica de Pronunciación",
      description:
        "Escucha términos y expresiones reales de atención al paciente mediante síntesis de voz del navegador.",
      cta: "Practicar audio",
      icon: Volume2,
    },
    {
      id: "guia",
      title: "¿Cómo usar la plataforma?",
      description:
        "Recorre nuestro tutorial interactivo paso a paso para aprovechar cada herramienta desde tu primer día.",
      cta: "Ver guía interactiva",
      icon: Compass,
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Split */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs font-medium text-sky-700 mb-4">
                <Stethoscope className="w-4 h-4 shrink-0" />
                <span>Plataforma educativa para estudiantes de Enfermería</span>
                <span aria-hidden="true">·</span>
                <span>Inglés técnico en salud</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15] [text-wrap:balance]">
                Domina el inglés técnico para tu práctica en Enfermería
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Bienvenido a <strong className="font-semibold text-slate-900">English Nurse AI</strong>,
                una plataforma digital diseñada para apoyar el aprendizaje del inglés técnico en el área de
                Enfermería. Aquí podrás consultar términos médicos, traducir palabras y expresiones,
                conocer sus significados y practicar vocabulario relacionado con el ámbito de la salud.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate("traductor")}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  <Languages className="w-4 h-4" />
                  <span>Ir al Traductor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate("vocabulario")}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Ver Vocabulario Médico</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex">
              <div className="relative w-full min-h-[260px] lg:min-h-[360px] rounded-2xl overflow-hidden border border-slate-200 bg-sky-50">
                {!heroImgError ? (
                  <img
                    src={HERO_IMAGE}
                    alt="Estudiantes de Enfermería repasando terminología clínica en inglés con tableta digital y estetoscopio"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-sky-100 via-white to-sky-50">
                    <Stethoscope className="w-12 h-12 text-sky-600 mb-3" />
                    <p className="font-display font-semibold text-slate-900">
                      English Nurse AI
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Formación en inglés clínico para Enfermería
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4-column summary strip below hero */}
          <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="font-mono text-2xl font-semibold text-sky-700 tabular-nums">
                9
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                Categorías clínicas
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Anatomía, signos vitales, fármacos y trato al paciente
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-sky-700 tabular-nums">
                EN ⇄ ES
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                Traducción bidireccional
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Integrada con MyMemory Translation API
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-sky-700 tabular-nums">
                Audio
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                Pronunciación guiada
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Síntesis de voz en inglés directo en el navegador
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-sky-700 tabular-nums">
                5 pasos
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                Tutorial interactivo
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Recorrido guiado por cada función de la plataforma
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Herramientas principales de aprendizaje
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Accede directamente a cada módulo según tu objetivo de estudio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("asistente")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800 whitespace-nowrap shrink-0"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Consultar al Asistente Inteligente</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickAccessCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-sky-300 transition-colors duration-150"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(card.id)}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-800 whitespace-nowrap"
                >
                  <span>{card.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Study Purpose & Assistant Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 min-h-[220px] bg-sky-50">
            {!deskImgError ? (
              <img
                src={DESK_IMAGE}
                alt="Materiales de estudio de Enfermería: estetoscopio, termómetro digital y libreta de notas anatómicas"
                referrerPolicy="no-referrer"
                onError={() => setDeskImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-sky-100 to-white">
                <BookOpen className="w-10 h-10 text-sky-600 mb-2" />
                <span className="text-sm font-semibold text-slate-800">
                  Apoyo académico en Enfermería
                </span>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <p className="text-xs font-medium text-sky-700">
              Enfoque clínico y educativo
            </p>
            <h2 className="font-display text-2xl font-bold text-slate-900 mt-2">
              ¿Tienes dudas sobre dos términos médicos parecidos?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Además de traducir y escuchar la pronunciación, puedes acudir al apartado de{" "}
              <strong className="font-semibold text-slate-800">Asistente Inteligente</strong> para
              revisar diferencias entre conceptos como <em>symptom</em> vs. <em>sign</em> o{" "}
              <em>dosage</em> vs. <em>prescription</em>, siempre con fines estrictamente educativos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate("asistente")}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <MessageSquareText className="w-4 h-4" />
                <span>Ir al Asistente</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate("guia")}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <Compass className="w-4 h-4" />
                <span>Ver tutorial interactivo</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
