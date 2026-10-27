export const LIDERAZGO = {
  id: 'liderazgo',
  title: 'Liderazgo',
  summary: 'Inspira, escucha, da feedback y decide con tu equipo.',
  badge: 'Líder en formación',
  certText: 'liderar con el ejemplo, escucha activa, feedback con el modelo SCI, toma de decisiones y delegación',
  passScore: 70,
  video: {
    intro: 'Hola, soy Kiki. En este módulo vas a entrenar tu liderazgo: inspirar, escuchar, dar feedback y decidir con tu equipo.',
    outro: 'Completa las cuatro lecciones, supera el reto final y gana tu certificado. ¡Juega a crecer!',
  },
  lessons: [
    {
      id: 'liderazgo-1',
      title: 'Liderar no es mandar',
      minutes: 3,
      body: [
        'Liderar es lograr que un grupo avance hacia un objetivo común. No depende de un cargo: en un trabajo de la universidad, en tu primer empleo o en un voluntariado, lidera quien ayuda a que las cosas pasen.',
        'Un buen líder da el ejemplo, se hace cargo de los resultados del equipo y reconoce el mérito de los demás. La autoridad que nace del cargo se impone; la que nace del ejemplo se gana.',
      ],
      key: 'Liderar es influir con el ejemplo, no imponer con el cargo.',
      say: 'Liderar no es mandar: es lograr que el grupo avance, dando el ejemplo y reconociendo el mérito de los demás.',
    },
    {
      id: 'liderazgo-2',
      title: 'Escuchar para liderar',
      minutes: 4,
      body: [
        'Antes de decidir, un líder entiende. La escucha activa tiene tres pasos sencillos:',
        '1. Deja que la otra persona termine, sin interrumpir ni preparar tu respuesta.',
        '2. Haz preguntas abiertas: "¿Qué te preocupa de esto?", "¿Qué propones?".',
        '3. Parafrasea para confirmar: "Si entiendo bien, lo que te preocupa es…".',
      ],
      key: 'Antes de decidir, asegúrate de haber entendido.',
      say: 'Antes de decidir, escucha: deja terminar, haz preguntas abiertas y parafrasea para confirmar que entendiste.',
    },
    {
      id: 'liderazgo-3',
      title: 'Feedback que ayuda',
      minutes: 4,
      body: [
        'Para dar feedback usa el modelo SCI: Situación, Comportamiento e Impacto. Habla de hechos concretos, no de cómo es la persona.',
        'Ejemplo: "En la presentación del lunes (situación) hablaste muy rápido (comportamiento) y el cliente no alcanzó a tomar nota (impacto). ¿Probamos con pausas?".',
        'Cuando te den feedback a ti: escucha, agradece y pregunta qué harían en tu lugar.',
      ],
      key: 'Habla de hechos y efectos, no de la persona.',
      say: 'Para dar feedback, usa el modelo de situación, comportamiento e impacto. Habla de hechos, no de la persona.',
    },
    {
      id: 'liderazgo-4',
      title: 'Decidir y delegar',
      minutes: 4,
      body: [
        'En las decisiones de equipo: reúne opiniones, decide con un criterio claro y comunica el porqué, aunque no todos estén de acuerdo.',
        'Al delegar, deja claro qué se espera, para cuándo, con qué recursos y cómo vas a hacer seguimiento. Luego confía: no rehagas el trabajo de los demás.',
      ],
      key: 'Delegar bien es dar claridad y confianza, no solo tareas.',
      say: 'Al delegar, deja claro qué esperas, para cuándo y cómo harás el seguimiento. Y luego, confía.',
    },
  ],
  quiz: [
    {
      question: 'Coordinas un trabajo en grupo y dos compañeros no se ponen de acuerdo sobre cómo hacerlo. ¿Qué haces primero?',
      options: [
        'Decides tú para no perder tiempo.',
        'Escuchas ambas posturas y buscan juntos un criterio común.',
        'Lo someten a votación sin discutirlo.',
        'Dejas que lo resuelvan entre ellos.',
      ],
      answer: 1,
      why: 'Escuchar primero te da la información para decidir y hace que el equipo acepte mejor la decisión.',
    },
    {
      question: '¿Cuál de estos mensajes sigue el modelo SCI (Situación, Comportamiento, Impacto)?',
      options: [
        '"Eres muy desordenado."',
        '"Siempre llegas tarde."',
        '"En la reunión de hoy llegaste 15 minutos tarde y empezamos sin tu parte. ¿Qué pasó?"',
        '"Deberías esforzarte más."',
      ],
      answer: 2,
      why: 'Nombra una situación concreta, el comportamiento observado y su efecto, y abre la conversación.',
    },
    {
      question: 'Un compañero te cuenta un problema. ¿Qué respuesta muestra escucha activa?',
      options: [
        'Lo interrumpes con la solución.',
        'Revisas el celular mientras habla.',
        '"Si entiendo bien, te preocupa no llegar a la fecha, ¿cierto?"',
        'Cambias de tema para animarlo.',
      ],
      answer: 2,
      why: 'Parafrasear confirma que entendiste y hace que la otra persona se sienta escuchada.',
    },
    {
      question: 'Vas a delegar una tarea. ¿Qué no puede faltar?',
      options: [
        'Solo el nombre de la tarea.',
        'Qué se espera, para cuándo y cómo harás el seguimiento.',
        'Hacerla tú si no sale perfecta.',
        'No poner fecha para no presionar.',
      ],
      answer: 1,
      why: 'La claridad sobre el resultado, el plazo y el seguimiento es lo que permite confiar.',
    },
    {
      question: 'Tu equipo logra un gran resultado. ¿Qué hace un buen líder?',
      options: [
        'Se lleva el crédito.',
        'Reconoce el aporte de cada persona.',
        'No dice nada para no exagerar.',
        'Pide más trabajo de inmediato.',
      ],
      answer: 1,
      why: 'Reconocer el mérito de los demás refuerza la confianza y la motivación del equipo.',
    },
  ],
};
