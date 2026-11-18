import { useMemo, useState } from "react";
import { BookOpen, Search, Volume2, X } from "lucide-react";
import { NURSING_VOCABULARY, VOCAB_CATEGORIES } from "../data/nursingVocabulary";
import { VocabCategoryId } from "../types";
import { speakEnglish } from "../utils/speech";

export default function VocabularySection() {
  const [selectedCategory, setSelectedCategory] = useState<VocabCategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(0.85);
  const [audioWarning, setAudioWarning] = useState("");

  const categoryLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    VOCAB_CATEGORIES.forEach((cat) => map.set(cat.id, cat.label));
    return map;
  }, []);

  const filteredTerms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return NURSING_VOCABULARY.filter((term) => {
      const matchesCategory =
        selectedCategory === "all" || term.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      return (
        term.english.toLowerCase().includes(query) ||
        term.spanish.toLowerCase().includes(query) ||
        term.description.toLowerCase().includes(query)
      );
    });
  }, [selectedCategory, searchQuery]);

  const activeCategoryMeta = useMemo(() => {
    if (selectedCategory === "all") return null;
    return VOCAB_CATEGORIES.find((c) => c.id === selectedCategory) || null;
  }, [selectedCategory]);

  const handleSpeakTerm = (id: string, text: string) => {
    setAudioWarning("");
    void speakEnglish(text, {
      rate: speechRate,
      onStart: () => setSpeakingId(id),
      onEnd: () => setSpeakingId((prev) => (prev === id ? null : prev)),
      onError: (msg) => {
        setSpeakingId(null);
        setAudioWarning(msg);
      },
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-sky-700">
            Glosario clínico organizado · 9 categorías de Enfermería
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Vocabulario Técnico de Enfermería
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Consulta términos esenciales con su traducción, significado clínico, guía de pronunciación y audio.
          </p>
        </div>

        <p className="text-sm text-slate-600 font-mono tabular-nums shrink-0">
          {filteredTerms.length} de {NURSING_VOCABULARY.length} términos
        </p>
      </div>

      {/* Search & Category Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar palabra en inglés, traducción en español o significado..."
              aria-label="Buscar en el vocabulario médico"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Velocidad de audio:
            </span>
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setSpeechRate(0.7)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  speechRate === 0.7
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                0.70x Lento
              </button>
              <button
                type="button"
                onClick={() => setSpeechRate(0.85)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  speechRate === 0.85
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                0.85x Claro
              </button>
              <button
                type="button"
                onClick={() => setSpeechRate(1.0)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  speechRate === 1.0
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1.0x Normal
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Category Filter Buttons */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorías de vocabulario">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "all"}
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-sky-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            Todas ({NURSING_VOCABULARY.length})
          </button>

          {VOCAB_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isSelected
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {activeCategoryMeta && (
          <p className="text-xs sm:text-sm text-sky-800 bg-sky-50/70 border border-sky-100 rounded-lg px-3.5 py-2.5">
            <strong className="font-semibold">{activeCategoryMeta.label}:</strong>{" "}
            {activeCategoryMeta.shortDesc}
          </p>
        )}

        {audioWarning && (
          <p className="text-xs sm:text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
            {audioWarning}
          </p>
        )}
      </div>

      {/* Results Grid */}
      {filteredTerms.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <BookOpen className="w-10 h-10 text-sky-600 mx-auto mb-3" />
          <h2 className="font-display text-lg font-semibold text-slate-900">
            No se encontraron términos coincidentes
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Intenta con otra palabra clave o selecciona la vista de todas las categorías.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
          >
            Mostrar todo el vocabulario
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTerms.map((term) => {
            const isSpeaking = speakingId === term.id;
            const categoryName = categoryLabelMap.get(term.category) ?? "";

            return (
              <article
                key={term.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-sky-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 truncate">
                        {categoryName}
                      </p>
                      <h2 className="font-display text-lg font-bold text-slate-900 mt-1">
                        {term.english}
                      </h2>
                      <p className="text-sm font-semibold text-sky-700 mt-0.5">
                        {term.spanish}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSpeakTerm(term.id, term.english)}
                      aria-label={`Escuchar pronunciación de ${term.english}`}
                      title="Escuchar pronunciación"
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        isSpeaking
                          ? "bg-sky-600 border-sky-600 text-white"
                          : "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100"
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    {term.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500">Pronunciación:</span>
                    <span className="font-mono text-slate-800 text-right">
                      {term.pronunciation}
                    </span>
                  </div>
                  {term.example && (
                    <div className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 flex items-start justify-between gap-2">
                      <span className="italic">&ldquo;{term.example}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakTerm(`${term.id}-ex`, term.example!)
                        }
                        aria-label={`Escuchar ejemplo: ${term.example}`}
                        className="text-sky-700 hover:text-sky-800 shrink-0 mt-0.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
