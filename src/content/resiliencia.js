export const RESILIENCIA = {
  id: 'resiliencia',
  title: 'Resiliencia',
  summary: 'Aprende de los errores y sigue adelante.',
  badge: 'Resiliente',
  certText: 'aprender de los errores, manejar el estrés, recuperarse de los rechazos y mentalidad de crecimiento',
  passScore: 70,
  video: {
    intro: 'Hola, soy Kiki. En este módulo vas a entrenar tu resiliencia: aprender de los errores y seguir adelante.',
    outro: 'Completa las cuatro lecciones, supera el reto final y gana tu certificado. Porque en Skilly te adaptamos al mercado.',
  },
  lessons: [
    {
      id: 'resiliencia-1',
      title: 'Qué es ser resiliente',
      minutes: 3,
      body: [
        'Ser resiliente no es no caerse nunca: es levantarse y aprender. Todos enfrentamos rechazos, como una entrevista que no salió o una nota baja.',
        'Lo que cambia el resultado no es el tropiezo, sino lo que haces después. Y eso se puede entrenar.',
      ],
      key: 'Caer es parte del camino; quedarse en el suelo es opcional.',
      say: 'Ser resiliente no es no fallar nunca: es levantarte y aprender de lo que pasó.',
    },
    {
      id: 'resiliencia-2',
      title: 'Del error al aprendizaje',
      minutes: 4,
      body: [
        'Después de un tropiezo, hazte tres preguntas: ¿qué pasó?, ¿qué estuvo bajo mi control? y ¿qué haré distinto la próxima vez?',
        'Escribe las respuestas. Ver el error por escrito lo convierte en un plan, y deja de ser solo una mala sensación.',
      ],
      key: 'Un error analizado vale más que un acierto por suerte.',
      say: 'Después de un error, pregúntate qué pasó, qué dependía de ti y qué harás distinto la próxima vez.',
    },
    {
      id: 'resiliencia-3',
      title: 'Manejar el estrés',
      minutes: 4,
      body: [
        'Cuando el estrés aparezca: ponle nombre a lo que sientes y respira en cuatro tiempos (inhala 4 segundos, sostén 4, exhala 4).',
        'Divide el problema en pasos pequeños y empieza por uno. Pide ayuda cuando la necesites, y cuida lo básico: dormir, comer bien y moverte.',
      ],
      key: 'Un paso pequeño hoy vence a un plan perfecto mañana.',
      say: 'Cuando aparezca el estrés, respira, divide el problema en pasos pequeños y pide ayuda si la necesitas.',
    },
    {
      id: 'resiliencia-4',
      title: 'Mentalidad de crecimiento',
      minutes: 3,
      body: [
        'Cambia "no sé hacerlo" por "todavía no sé hacerlo". Las habilidades se entrenan con práctica, igual que un músculo.',
        'El feedback es información para mejorar, no un juicio sobre quién eres. Celebra tu progreso, no solo el resultado final.',
      ],
      key: '"Todavía" es la palabra más poderosa.',
      say: 'Cambia el no puedo por el todavía no. Las habilidades se entrenan con práctica.',
    },
  ],
  quiz: [
    {
      question: 'No pasaste una entrevista de trabajo. ¿Cuál es la reacción más resiliente?',
      options: [
        'Decidir que no sirves para ese tipo de trabajo.',
        'Pedir feedback y preparar mejor la próxima entrevista.',
        'No volver a postularte.',
        'Culpar al entrevistador.',
      ],
      answer: 1,
      why: 'Buscar feedback convierte el rechazo en información para mejorar.',
    },
    {
      question: '¿Cuál de estas preguntas ayuda a aprender de un error?',
      options: [
        '"¿Por qué siempre me pasa a mí?"',
        '"¿Qué haré distinto la próxima vez?"',
        '"¿Quién tuvo la culpa?"',
        '"¿Cómo hago para que nadie se entere?"',
      ],
      answer: 1,
      why: 'Mira hacia adelante y se enfoca en lo que sí está bajo tu control.',
    },
    {
      question: 'Tienes muchas tareas y te sientes bloqueado. ¿Qué haces primero?',
      options: [
        'Intentar hacerlo todo a la vez.',
        'Dividir el trabajo en pasos pequeños y empezar por uno.',
        'Esperar a sentirte mejor para empezar.',
        'Abandonar la tarea más difícil.',
      ],
      answer: 1,
      why: 'Un primer paso pequeño reduce la sensación de bloqueo y genera avance.',
    },
    {
      question: '¿Qué frase muestra mentalidad de crecimiento?',
      options: [
        '"Soy malo para los números."',
        '"Todavía no domino Excel, pero estoy practicando."',
        '"Esto no es para mí."',
        '"Si no me sale a la primera, no vale la pena."',
      ],
      answer: 1,
      why: 'Reconoce el punto de partida y asume que la habilidad se puede desarrollar.',
    },
    {
      question: 'Recibes una crítica sobre tu trabajo. ¿Cómo la tomas?',
      options: [
        'Como un ataque personal.',
        'Como información para mejorar.',
        'La ignoras.',
        'Respondes a la defensiva.',
      ],
      answer: 1,
      why: 'Separar la crítica de tu valor como persona te permite aprovecharla.',
    },
  ],
};
