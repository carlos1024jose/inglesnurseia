import { SectionId } from "../types";

interface FooterProps {
  onNavigate: (section: SectionId) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="font-display text-sm font-bold text-slate-900">
            English Nurse AI
          </p>
          <p className="text-xs text-slate-500 max-w-md">
            Plataforma digital educativa para el aprendizaje del inglés técnico en Enfermería. Contenido con fines formativos; no sustituye la orientación de profesionales de la salud.
          </p>
        </div>

        <nav
          aria-label="Enlaces del pie de página"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => onNavigate("inicio")}
            className="hover:text-sky-700 transition-colors whitespace-nowrap"
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => onNavigate("traductor")}
            className="hover:text-sky-700 transition-colors whitespace-nowrap"
          >
            Traductor
          </button>
          <button
            type="button"
            onClick={() => onNavigate("vocabulario")}
            className="hover:text-sky-700 transition-colors whitespace-nowrap"
          >
            Vocabulario
          </button>
          <button
            type="button"
            onClick={() => onNavigate("pronunciacion")}
            className="hover:text-sky-700 transition-colors whitespace-nowrap"
          >
            Pronunciación
          </button>
          <button
            type="button"
            onClick={() => onNavigate("asistente")}
            className="hover:text-sky-700 transition-colors whitespace-nowrap"
          >
            Asistente
          </button>
          <button
            type="button"
            onClick={() => onNavigate("guia")}
            className="hover:text-sky-700 transition-colors whitespace-nowrap"
          >
            Guía de uso
          </button>
        </nav>
      </div>
    </footer>
  );
}
