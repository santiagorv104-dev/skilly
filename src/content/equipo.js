export const EQUIPO = {
  id: 'equipo',
  title: 'Trabajo en equipo',
  summary: 'Colabora, acuerda y cumple con otros.',
  badge: 'Jugador de equipo',
  certText: 'acordar objetivos y roles, cumplir compromisos, manejar desacuerdos y colaborar a distancia',
  passScore: 70,
  video: {
    intro: 'Hola, soy Kiki. En este módulo vas a entrenar el trabajo en equipo: colaborar, ponerse de acuerdo y cumplir con otros.',
    outro: 'Completa las cuatro lecciones, supera el reto final y gana tu certificado. ¡Juega a crecer!',
  },
  lessons: [
    {
      id: 'equipo-1',
      title: 'Un objetivo común',
      minutes: 3,
      body: [
        'Un equipo funciona cuando todos saben qué quieren lograr y cómo se va a medir. Sin eso, cada uno trabaja duro… en una dirección distinta.',
        'Al empezar, acuerden tres cosas: el objetivo, quién hace qué y para cuándo. Escríbanlo en un lugar que todos vean.',
      ],
      key: 'Si cada uno rema hacia un lado, el bote no avanza.',
      say: 'Al empezar, acuerden el objetivo, quién hace qué y para cuándo, y déjenlo por escrito.',
    },
    {
      id: 'equipo-2',
      title: 'Cumplir y avisar',
      minutes: 3,
      body: [
        'La confianza se construye cumpliendo lo que prometes, una y otra vez. Antes de decir "sí", revisa si de verdad puedes.',
        'Si vas a retrasarte, avisa antes de la fecha, no después, y llega con una propuesta: "Me falta un día; ¿entrego la primera parte hoy?".',
      ],
      key: 'Avisar a tiempo también es cumplir.',
      say: 'Cumple lo que prometes y, si vas a retrasarte, avisa antes y propone una solución.',
    },
    {
      id: 'equipo-3',
      title: 'Desacuerdos que suman',
      minutes: 4,
      body: [
        'Discutir ideas no es pelear. Habla de la tarea, no de las personas, y busca qué necesita cada uno detrás de su postura.',
        'Si no se ponen de acuerdo, pongan a prueba las opciones con datos o con un piloto pequeño. Y una vez que el equipo decide, todos empujan en la misma dirección.',
      ],
      key: 'Discute ideas, cuida a las personas.',
      say: 'En un desacuerdo, habla de la tarea y no de la persona, y busca qué necesita cada uno.',
    },
    {
      id: 'equipo-4',
      title: 'Colaborar a distancia',
      minutes: 4,
      body: [
        'Usen un canal para cada cosa: el chat para lo rápido, un documento compartido para lo que se decide y una reunión corta para lo que se complica.',
        'Comparte tu avance sin que te lo pidan y respeta los horarios de los demás. Al final de cada reunión, dejen por escrito los acuerdos y los responsables.',
      ],
      key: 'Lo que no está escrito, no se acordó.',
      say: 'A distancia, comparte tu avance sin que te lo pidan y deja por escrito lo que se decide.',
    },
  ],
  quiz: [
    {
      question: 'Empiezan un proyecto en grupo. ¿Qué deberían acordar primero?',
      options: [
        'El nombre del equipo.',
        'El objetivo, los roles y las fechas.',
        'Quién presenta al final.',
        'Nada: se organizan sobre la marcha.',
      ],
      answer: 1,
      why: 'Con objetivo, roles y fechas claros, cada persona sabe qué aportar y cuándo.',
    },
    {
      question: 'Sabes que no llegarás a la fecha acordada. ¿Qué haces?',
      options: [
        'Esperas a ver si nadie lo nota.',
        'Avisas antes y propones una solución.',
        'Entregas algo incompleto sin decir nada.',
        'Le pides a otra persona que lo termine.',
      ],
      answer: 1,
      why: 'Avisar a tiempo y con una propuesta permite al equipo reorganizarse y mantiene la confianza.',
    },
    {
      question: 'Un compañero critica tu propuesta en una reunión. ¿Cuál es la mejor respuesta?',
      options: [
        '"¿Qué te preocupa de la propuesta? Veamos cómo mejorarla."',
        'Criticas su idea también.',
        'Te quedas callado y molesto.',
        'Retiras tu propuesta de inmediato.',
      ],
      answer: 0,
      why: 'Preguntar por la preocupación convierte la crítica en información para mejorar la idea.',
    },
    {
      question: 'En un equipo que trabaja a distancia, ¿dónde deben quedar las decisiones?',
      options: [
        'En la memoria de cada uno.',
        'En un documento o canal compartido.',
        'En mensajes privados.',
        'En una llamada, sin notas.',
      ],
      answer: 1,
      why: 'Un registro compartido evita malentendidos y deja claro quién es responsable de qué.',
    },
    {
      question: '¿Qué construye más confianza en un equipo?',
      options: [
        'Trabajar solo para no depender de nadie.',
        'Cumplir lo prometido de forma constante.',
        'Decir que sí a todo.',
        'Evitar dar tu opinión.',
      ],
      answer: 1,
      why: 'La confianza nace de la constancia: los demás saben que pueden contar contigo.',
    },
  ],
};
