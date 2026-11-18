export type SectionId =
  | "inicio"
  | "traductor"
  | "vocabulario"
  | "pronunciacion"
  | "asistente"
  | "guia";

export type VocabCategoryId =
  | "all"
  | "body-parts"
  | "symptoms"
  | "conditions"
  | "medications"
  | "equipment"
  | "vital-signs"
  | "nursing-actions"
  | "places-staff"
  | "patient-communication";

export interface VocabCategory {
  id: Exclude<VocabCategoryId, "all">;
  label: string;
  shortDesc: string;
}

export interface VocabTerm {
  id: string;
  category: Exclude<VocabCategoryId, "all">;
  english: string;
  spanish: string;
  description: string;
  pronunciation: string;
  example?: string;
}

export interface PronunciationPhrase {
  id: string;
  scenario: string;
  english: string;
  spanish: string;
  pronunciation: string;
  clinicalNote: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface TutorialStep {
  id: number;
  title: string;
  targetSection: SectionId;
  actionLabel: string;
  summary: string;
  instructions: string[];
  tip: string;
  previewSample: {
    label: string;
    english: string;
    spanish: string;
    detail: string;
  };
}
