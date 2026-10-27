// Ruta de habilidades blandas (las cinco que mide la perfilación).
export const MODULES = [
  {
    id: 'liderazgo',
    title: 'Liderazgo',
    summary: 'Inspira, escucha, da feedback y decide con tu equipo.',
    available: true,
  },
  { id: 'comunicacion', title: 'Comunicación efectiva', summary: 'Explica tus ideas con claridad y seguridad.', available: false },
  { id: 'equipo', title: 'Trabajo en equipo', summary: 'Colabora, acuerda y cumple con otros.', available: false },
  { id: 'resiliencia', title: 'Resiliencia', summary: 'Aprende de los errores y sigue adelante.', available: false },
  { id: 'resolucion', title: 'Resolución de problemas', summary: 'Analiza, prioriza y encuentra salidas.', available: false },
];

// Preguntas de perfilación (versión corta del flujo 5.1–5.5).
export const PROFILE_QUESTIONS = [
  {
    id: 'momento',
    question: '¿Qué te describe mejor ahora?',
    options: ['Estoy estudiando', 'Acabo de graduarme', 'Busco mi primer empleo', 'Quiero cambiar de área'],
  },
  {
    id: 'area',
    question: '¿Qué sector te interesa?',
    options: ['Tecnología', 'Negocios y administración', 'Marketing y comunicación', 'Diseño', 'Aún no lo sé'],
  },
  {
    id: 'objetivo',
    question: '¿Cuál es tu objetivo principal?',
    options: ['Conseguir mi primer empleo', 'Prácticas o pasantía', 'Trabajar como freelance', 'Mejorar mis habilidades'],
  },
  {
    id: 'tiempo',
    question: '¿Cuánto tiempo al día puedes dedicar?',
    options: ['Menos de 15 minutos', '15 a 30 minutos', '30 a 60 minutos', 'Más de 1 hora'],
  },
  {
    id: 'habilidad',
    question: '¿Qué habilidad quieres fortalecer primero?',
    options: ['Liderazgo', 'Comunicación efectiva', 'Trabajo en equipo', 'Resiliencia', 'Resolución de problemas'],
  },
];
