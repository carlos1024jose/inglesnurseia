/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import AssistantSection from "./components/AssistantSection";
import Footer from "./components/Footer";
import HomeSection from "./components/HomeSection";
import Navbar from "./components/Navbar";
import PronunciationSection from "./components/PronunciationSection";
import TranslatorSection from "./components/TranslatorSection";
import TutorialSection from "./components/TutorialSection";
import VocabularySection from "./components/VocabularySection";
import { SectionId } from "./types";

const VALID_SECTIONS: SectionId[] = [
  "inicio",
  "traductor",
  "vocabulario",
  "pronunciacion",
  "asistente",
  "guia",
];

function getInitialSection(): SectionId {
  if (typeof window === "undefined") return "inicio";
  const hash = window.location.hash.replace("#", "") as SectionId;
  return VALID_SECTIONS.includes(hash) ? hash : "inicio";
}

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>(getInitialSection);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "") as SectionId;
      if (VALID_SECTIONS.includes(hash)) {
        setActiveSection(hash);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleNavigate = (section: SectionId) => {
    setActiveSection(section);
    if (window.location.hash !== `#${section}`) {
      window.history.pushState(null, "", `#${section}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      <main className="flex-1">
        {activeSection === "inicio" && (
          <HomeSection onNavigate={handleNavigate} />
        )}
        {activeSection === "traductor" && <TranslatorSection />}
        {activeSection === "vocabulario" && <VocabularySection />}
        {activeSection === "pronunciacion" && <PronunciationSection />}
        {activeSection === "asistente" && <AssistantSection />}
        {activeSection === "guia" && (
          <TutorialSection onNavigate={handleNavigate} />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
