import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SectionId } from "../types";

interface NavbarProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
}

const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: "inicio", label: "Inicio" },
  { id: "traductor", label: "Traductor" },
  { id: "vocabulario", label: "Vocabulario" },
  { id: "pronunciacion", label: "Pronunciación" },
  { id: "asistente", label: "Asistente" },
];

export default function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (id: SectionId) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark + Custom Medical Emblem */}
        <button
          type="button"
          onClick={() => handleSelect("inicio")}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded-md"
        >
          <span
            aria-hidden="true"
            className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            English Nurse AI
          </span>
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-6"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded-sm ${
                  isActive
                    ? "text-sky-700 font-semibold"
                    : "text-slate-600 hover:text-sky-700"
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-sky-600"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect("guia")}
            className={`hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
              activeSection === "guia"
                ? "bg-sky-800 text-white"
                : "bg-sky-600 text-white hover:bg-sky-700"
            }`}
          >
            Guía de uso
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sky-50 text-sky-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleSelect("guia")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeSection === "guia"
                ? "bg-sky-700 text-white"
                : "bg-sky-600 text-white hover:bg-sky-700"
            }`}
          >
            ¿Cómo utilizar la plataforma?
          </button>
        </div>
      )}
    </header>
  );
}
