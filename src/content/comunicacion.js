export const COMUNICACION = {
  id: 'comunicacion',
  title: 'Comunicación efectiva',
  summary: 'Explica tus ideas con claridad y seguridad.',
  badge: 'Buen comunicador',
  certText: 'mensajes claros con la idea principal primero, expresión oral, comunicación no verbal y escritura profesional',
  passScore: 70,
  video: {
    intro: 'Hola, soy Kiki. En este módulo vas a entrenar tu comunicación: explicar tus ideas con claridad y seguridad.',
    outro: 'Completa las cuatro lecciones, supera el reto final y gana tu certificado. ¡Juega a crecer!',
  },
  lessons: [
    {
      id: 'comunicacion-1',
      title: 'Primero, la idea principal',
      minutes: 3,
      body: [
        'Comunicar bien empieza por saber qué quieres que la otra persona entienda o haga. Antes de hablar o escribir, resume tu mensaje en una sola frase.',
        'Usa la regla de "lo más importante primero": la conclusión, luego las razones y al final los detalles. Así, aunque te escuchen solo diez segundos, se llevan lo esencial.',
      ],
      key: 'Si no cabe en una frase, todavía no está claro.',
      say: 'Antes de hablar, resume tu mensaje en una sola frase y di primero lo más importante.',
    },
    {
      id: 'comunicacion-2',
      title: 'Hablar con claridad',
      minutes: 4,
      body: [
        'Usa frases cortas, palabras sencillas y ejemplos concretos. Evita las muletillas ("o sea", "este", "como que") y haz pausas: le dan tiempo al otro para entender.',
        'Al terminar, comprueba que te entendieron con una pregunta abierta: "¿Qué parte te gustaría que aclare?" en lugar de "¿Entendiste?".',
      ],
      key: 'Claro no es simple: es fácil de entender.',
      say: 'Usa frases cortas, ejemplos concretos y pausas. Y al final, comprueba que te entendieron.',
    },
    {
      id: 'comunicacion-3',
      title: 'Lo que dices sin palabras',
      minutes: 3,
      body: [
        'Tu postura, tu mirada y tu tono transmiten tanto como tus palabras. Mantén contacto visual, una postura abierta y una voz firme y tranquila.',
        'En videollamadas: cámara a la altura de los ojos, buena luz de frente, fondo ordenado y mira a la cámara cuando hables, no a tu propia imagen.',
      ],
      key: 'Tu cuerpo y tu tono también hablan.',
      say: 'Tu postura, tu mirada y tu tono comunican tanto como tus palabras. En videollamadas, mira a la cámara.',
    },
    {
      id: 'comunicacion-4',
      title: 'Escribir para el trabajo',
      minutes: 4,
      body: [
        'Un buen correo tiene: un asunto que diga de qué trata, el propósito en la primera línea, una petición concreta con fecha y un cierre cordial.',
        'Un mensaje, un tema. Revisa la ortografía antes de enviar y léelo como si fueras quien lo recibe: ¿sabe exactamente qué tiene que hacer?',
      ],
      key: 'Un buen correo se entiende en 30 segundos.',
      say: 'En un correo, pon el propósito en la primera línea y termina con una petición concreta y una fecha.',
    },
  ],
  quiz: [
    {
      question: 'Tienes un minuto para contarle a tu jefe cómo va un proyecto. ¿Cómo empiezas?',
      options: [
        'Con todos los detalles desde el principio.',
        'Con la conclusión: "Vamos a tiempo, pero necesitamos aprobar el presupuesto".',
        'Con los problemas que tuviste durante la semana.',
        'Pidiendo una reunión más larga para explicarlo.',
      ],
      answer: 1,
      why: 'Decir primero la conclusión garantiza que lo esencial llegue, aunque el tiempo sea corto.',
    },
    {
      question: '¿Cuál de estos asuntos de correo es mejor?',
      options: [
        '"Hola"',
        '"¡¡Urgente!!"',
        '"Informe de ventas de marzo: revisión antes del viernes"',
        '"Una pregunta"',
      ],
      answer: 2,
      why: 'Dice de qué trata el correo y qué se necesita, antes incluso de abrirlo.',
    },
    {
      question: 'En una entrevista por videollamada, ¿qué ayuda más?',
      options: [
        'Cámara a la altura de los ojos y mirar a la cámara al hablar.',
        'Apagar la cámara para estar más tranquilo.',
        'Leer las respuestas en otra pestaña.',
        'Hablar muy rápido para mostrar seguridad.',
      ],
      answer: 0,
      why: 'Mirar a la cámara se percibe como contacto visual y transmite confianza.',
    },
    {
      question: 'Explicaste algo y no sabes si te entendieron. ¿Qué haces?',
      options: [
        'Lo repites igual, pero más fuerte.',
        'Asumes que sí y sigues.',
        'Preguntas: "¿Qué parte te gustaría que aclare?"',
        'Envías un documento largo con todo.',
      ],
      answer: 2,
      why: 'Una pregunta abierta invita a la otra persona a decir qué no quedó claro.',
    },
    {
      question: '¿Qué hace más claro un mensaje?',
      options: [
        'Usar palabras técnicas para sonar experto.',
        'Frases cortas y un ejemplo concreto.',
        'Tratar muchos temas en un solo mensaje.',
        'Evitar dar fechas para no comprometerse.',
      ],
      answer: 1,
      why: 'Las frases cortas y los ejemplos hacen que el mensaje se entienda a la primera.',
    },
  ],
};
