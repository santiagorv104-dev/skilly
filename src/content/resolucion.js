export const RESOLUCION = {
  id: 'resolucion',
  title: 'Resolución de problemas',
  summary: 'Analiza, prioriza y encuentra salidas.',
  badge: 'Solucionador',
  certText: 'definir problemas, encontrar la causa raíz, generar alternativas, priorizar y probar soluciones',
  passScore: 70,
  video: {
    intro: 'Hola, soy Kiki. En este módulo vas a entrenar la resolución de problemas: analizar, priorizar y encontrar salidas.',
    outro: 'Completa las cuatro lecciones, supera el reto final y gana tu certificado. ¡Juega a crecer!',
  },
  lessons: [
    {
      id: 'resolucion-1',
      title: 'Define bien el problema',
      minutes: 3,
      body: [
        'Un problema bien definido está medio resuelto. Antes de buscar soluciones, describe qué pasa, desde cuándo, a quién afecta y cómo sabrás que se resolvió.',
        'Evita saltar a la primera solución que se te ocurra: muchas veces resuelve un problema distinto al que de verdad tienes.',
      ],
      key: 'Antes de resolver, entiende.',
      say: 'Antes de buscar soluciones, define qué pasa, a quién afecta y cómo sabrás que se resolvió.',
    },
    {
      id: 'resolucion-2',
      title: 'Encuentra la causa raíz',
      minutes: 4,
      body: [
        'Usa los "5 porqués": pregunta "¿por qué?" varias veces hasta llegar al origen del problema.',
        'Ejemplo: los pedidos llegan tarde. ¿Por qué? Porque se aprueban tarde. ¿Por qué? Porque el gerente no recibe el aviso. ¿Por qué? Porque el formulario no lo notifica. Ahí está la causa que hay que arreglar.',
      ],
      key: 'Ataca la causa, no solo el síntoma.',
      say: 'Pregunta por qué varias veces, hasta encontrar la causa raíz y no solo el síntoma.',
    },
    {
      id: 'resolucion-3',
      title: 'Genera opciones',
      minutes: 3,
      body: [
        'Antes de elegir, piensa al menos tres alternativas. Pide ideas a otras personas y no las juzgues al principio: primero cantidad, después calidad.',
        'Luego compáralas con criterios claros: impacto, costo y tiempo. Una tabla sencilla basta.',
      ],
      key: 'La primera idea rara vez es la mejor.',
      say: 'Antes de decidir, piensa al menos tres opciones y compáralas por impacto, costo y tiempo.',
    },
    {
      id: 'resolucion-4',
      title: 'Decide, prueba y aprende',
      minutes: 4,
      body: [
        'Elige una opción, pruébala en pequeño, mide si funcionó y ajusta. Si no funcionó, no es un fracaso: aprendiste algo que antes no sabías.',
        'Para priorizar, separa lo urgente de lo importante: lo importante y no urgente se planifica con fecha; no lo dejes para "cuando haya tiempo".',
      ],
      key: 'Probar en pequeño reduce el riesgo.',
      say: 'Elige una opción, pruébala en pequeño, mide el resultado y ajusta.',
    },
  ],
  quiz: [
    {
      question: 'Tu equipo dice "las ventas están mal". ¿Cuál es el mejor primer paso?',
      options: [
        'Bajar los precios de inmediato.',
        'Definir qué cayó, desde cuándo y en qué productos.',
        'Contratar más vendedores.',
        'Esperar al próximo mes a ver si mejora.',
      ],
      answer: 1,
      why: 'Definir bien el problema evita gastar esfuerzo en soluciones que no atacan lo que pasa.',
    },
    {
      question: '¿Para qué sirven los "5 porqués"?',
      options: [
        'Para encontrar culpables.',
        'Para llegar a la causa raíz de un problema.',
        'Para alargar las reuniones.',
        'Para elegir entre dos opciones.',
      ],
      answer: 1,
      why: 'Preguntar "¿por qué?" varias veces lleva del síntoma al origen del problema.',
    },
    {
      question: 'Tienes una idea para resolver un problema. ¿Qué haces antes de decidir?',
      options: [
        'La aplicas de una vez.',
        'Buscas al menos dos alternativas más y las comparas.',
        'Esperas a que otra persona decida.',
        'Descartas las ideas de los demás.',
      ],
      answer: 1,
      why: 'Comparar varias opciones aumenta la probabilidad de elegir la mejor.',
    },
    {
      question: '¿Cuál es la ventaja de probar una solución en pequeño?',
      options: [
        'Ninguna, es perder tiempo.',
        'Aprendes rápido y con menos riesgo.',
        'Así nadie se entera si falla.',
        'Te evita tener que medir resultados.',
      ],
      answer: 1,
      why: 'Una prueba pequeña muestra si la solución funciona antes de invertir mucho en ella.',
    },
    {
      question: 'Una tarea es importante pero no urgente. ¿Qué haces?',
      options: [
        'La ignoras.',
        'La planificas con una fecha concreta.',
        'La haces solo si te sobra tiempo.',
        'La delegas sin explicar nada.',
      ],
      answer: 1,
      why: 'Lo importante y no urgente se pierde si no tiene fecha; planificarlo evita que se vuelva urgente.',
    },
  ],
};
