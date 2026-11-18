import { TutorialStep } from "../types";

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: "Explora la página de inicio y los accesos directos",
    targetSection: "inicio",
    actionLabel: "Ir al Inicio",
    summary:
      "Desde la pantalla principal puedes ubicarte rápidamente y acceder con un clic a cada herramienta de aprendizaje de inglés técnico.",
    instructions: [
      "Usa la barra superior para cambiar entre Inicio, Traductor, Vocabulario, Pronunciación, Asistente y Guía de uso.",
      "En teléfonos móviles, abre el menú compacto en la esquina superior derecha.",
      "Utiliza los accesos directos del inicio para ir sin rodeos a la herramienta que necesites en clase o práctica clínica.",
    ],
    tip: "Comienza revisando el vocabulario de la categoría que estés estudiando en tu rotación actual.",
    previewSample: {
      label: "Navegación directa",
      english: "Welcome to English Nurse AI",
      spanish: "Bienvenido a English Nurse AI",
      detail: "5 herramientas integradas enfocadas en Enfermería.",
    },
  },
  {
    id: 2,
    title: "Traduce términos y frases clínicas en ambos sentidos",
    targetSection: "traductor",
    actionLabel: "Probar el Traductor",
    summary:
      "Convierte palabras, indicaciones o notas cortas entre inglés y español usando MyMemory Translation API sin recargar la página.",
    instructions: [
      "Elige la dirección de traducción: Inglés → Español o Español → Inglés (o presiona el botón de intercambio).",
      "Escribe una palabra o frase clínica, o selecciona uno de los ejemplos rápidos de Enfermería.",
      "Presiona «Traducir» para obtener el resultado, usa «Copiar» para guardarlo o «Limpiar» para iniciar una nueva consulta.",
    ],
    tip: "Si traduces hacia o desde el inglés, puedes escuchar la pronunciación del texto en inglés directamente desde el traductor.",
    previewSample: {
      label: "Ejemplo de traducción (en|es)",
      english: "Check blood pressure every two hours",
      spanish: "Revisar la presión arterial cada dos horas",
      detail: "Resultado instantáneo listo para copiar.",
    },
  },
  {
    id: 3,
    title: "Consulta el vocabulario técnico por categorías",
    targetSection: "vocabulario",
    actionLabel: "Explorar Vocabulario",
    summary:
      "Encuentra términos esenciales de Enfermería organizados en 9 categorías clínicas con su significado, guía fonética y audio.",
    instructions: [
      "Selecciona una de las 9 categorías (Partes del cuerpo, Signos vitales, Medicamentos, etc.) para filtrar los términos.",
      "Usa el buscador superior para localizar rápidamente cualquier término por su nombre en inglés, español o descripción.",
      "Haz clic en el botón de audio junto a cada término para escuchar su pronunciación en inglés.",
    ],
    tip: "El buscador funciona en tiempo real mientras escribes, tanto en inglés como en español.",
    previewSample: {
      label: "Ficha de vocabulario",
      english: "Pulse oximeter",
      spanish: "Oxímetro de pulso",
      detail: "/pʌls ɒkˈsɪmɪtər/ · Mide SpO2 y frecuencia cardíaca.",
    },
  },
  {
    id: 4,
    title: "Practica la pronunciación clínica con voz",
    targetSection: "pronunciacion",
    actionLabel: "Practicar Pronunciación",
    summary:
      "Escucha expresiones reales utilizadas con pacientes y ajusta la velocidad de voz del navegador para entrenar tu oído y habla.",
    instructions: [
      "Elige entre velocidad normal (1.0x) o lenta (0.75x) para captar cada sílaba con claridad.",
      "Escucha las frases agrupadas por escenario clínico (triaje, signos vitales, medicación y confort).",
      "Escribe cualquier palabra o frase en inglés en el cuadro de práctica libre y reprodúcela al instante.",
    ],
    tip: "Si estás estudiando una frase nueva, escúchala primero a 0.75x y luego repítela en voz alta a velocidad 1.0x.",
    previewSample: {
      label: "Práctica con SpeechSynthesis",
      english: "Take a deep breath",
      spanish: "Respire profundo",
      detail: "Velocidad ajustable: 0.75x (Lento) · 1.0x (Normal).",
    },
  },
  {
    id: 5,
    title: "Resuelve dudas en el Asistente Inteligente",
    targetSection: "asistente",
    actionLabel: "Abrir Asistente",
    summary:
      "Consulta diferencias entre términos similares, ejemplos clínicos y expresiones frecuentes en Enfermería (cuando el servicio de IA esté conectado).",
    instructions: [
      "Verifica en la parte superior del módulo si la conexión con la API de inteligencia artificial está activa.",
      "Escribe tu duda sobre inglés técnico (por ejemplo: diferencia entre «pain» y «ache») o elige una pregunta sugerida.",
      "Recuerda que las explicaciones tienen fines exclusivamente educativos y no sustituyen el criterio de profesionales de la salud.",
    ],
    tip: "Si no hay una API de IA conectada en tu entorno, el módulo te lo indicará con transparencia sin simular respuestas.",
    previewSample: {
      label: "Consulta educativa",
      english: "Symptom vs. Sign",
      spanish: "Síntoma (subjetivo) vs. Signo (objetivo)",
      detail: "Explicación clara con ejemplos clínicos.",
    },
  },
];
