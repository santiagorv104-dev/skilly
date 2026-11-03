// Contenido de la Brújula: las 12 habilidades, las frases, los pares, los casos
// y la configuración de cada versión. Los textos, el orden y los puntos son
// fijos e iguales para todos; el cálculo está en src/lib/puntaje.js.

export const SKILLS = [
  {
    id: 'com',
    short: 'Comunicación',
    full: 'Comunicación clara y asertiva',
    desc: 'Transmitir ideas con claridad y decir lo que piensas con respeto.',
    actions: [
      'Antes de cada presentación o correo importante, escribe en una línea la idea principal y ponla de primera.',
      'Grábate explicando un tema de tu carrera en dos minutos y revisa en qué momentos diste vueltas.',
    ],
  },
  {
    id: 'esc',
    short: 'Escucha y empatía',
    full: 'Escucha activa y empatía',
    desc: 'Entender lo que el otro dice y siente antes de responder.',
    actions: [
      'En tu próxima conversación importante, resume lo que entendiste antes de dar tu opinión: ‘Si te entiendo bien...’.',
      'Cuando no estés de acuerdo con alguien, haz una pregunta más antes de responder.',
    ],
  },
  {
    id: 'equ',
    short: 'Trabajo en equipo',
    full: 'Trabajo en equipo',
    desc: 'Colaborar, compartir el crédito y sostener al grupo hacia un objetivo común.',
    actions: [
      'En el próximo trabajo grupal, propone un chequeo corto a mitad de camino para detectar quién está atascado.',
      'Delega una parte que normalmente harías tú y acuerda el resultado esperado, no el cómo.',
    ],
  },
  {
    id: 'lid',
    short: 'Liderazgo',
    full: 'Liderazgo e influencia',
    desc: 'Dar dirección y lograr que otros se comprometan con ella.',
    actions: [
      'En el próximo proyecto sin líder claro, ofrécete a armar el plan: partes, responsables y fechas.',
      'Cierra cada reunión que coordines con las decisiones y los responsables dichos en voz alta.',
    ],
  },
  {
    id: 'neg',
    short: 'Negociación',
    full: 'Negociación y manejo de conflictos',
    desc: 'Resolver desacuerdos buscando intereses, no solo posiciones.',
    actions: [
      'Antes de negociar, escribe qué necesita de verdad la otra parte y qué podrías darle que a ti te cueste poco.',
      'Practica decir que no con una alternativa: ‘Eso no puedo, pero sí puedo...’.',
    ],
  },
  {
    id: 'res',
    short: 'Resiliencia',
    full: 'Resiliencia y manejo de la presión',
    desc: 'Mantener el rendimiento bajo presión y recuperarte de los tropiezos.',
    actions: [
      'Después de un mal resultado, escribe en diez minutos qué dependía de ti y qué no, y elige una sola cosa para cambiar.',
      'Cuando la presión te bloquee, define solo el siguiente paso de 25 minutos y empieza por ahí.',
    ],
  },
  {
    id: 'ada',
    short: 'Adaptabilidad',
    full: 'Adaptabilidad',
    desc: 'Ajustarte a cambios, ambigüedad y personas distintas a ti.',
    actions: [
      'Acepta a propósito una tarea con instrucciones abiertas y define tú los criterios de éxito.',
      'Cuando cambien los planes, pregunta primero qué sigue siendo importante y solo después reorganiza.',
    ],
  },
  {
    id: 'org',
    short: 'Organización',
    full: 'Autogestión y organización',
    desc: 'Priorizar, planear y cumplir sin depender de la presión del último día.',
    actions: [
      'Cada domingo, escoge máximo tres prioridades para la semana y revisa cómo te fue con las anteriores.',
      'Parte cada entrega grande en hitos con fecha propia, el último al menos tres días antes del plazo real.',
    ],
  },
  {
    id: 'pen',
    short: 'Pensamiento crítico',
    full: 'Pensamiento crítico y resolución de problemas',
    desc: 'Descomponer problemas y cuestionar supuestos con evidencia.',
    actions: [
      'Ante cada problema, escribe la pregunta clave y dos o tres hipótesis antes de buscar soluciones.',
      'Ante cada cifra importante en tus proyectos, pregunta cómo se sabe y de dónde sale.',
    ],
  },
  {
    id: 'ini',
    short: 'Iniciativa',
    full: 'Creatividad e iniciativa',
    desc: 'Proponer ideas y mejoras sin esperar a que te las pidan.',
    actions: [
      'Lleva una lista de cosas lentas o repetitivas que veas en el trabajo y, cada mes, prueba una mejora.',
      'Antes de elegir una solución con tu equipo, pongan sobre la mesa al menos tres alternativas.',
    ],
  },
  {
    id: 'aut',
    short: 'Autoconciencia',
    full: 'Autoconciencia y autorregulación',
    desc: 'Reconocer tus emociones y manejar cómo influyen en lo que haces.',
    actions: [
      'Dos veces al día, nombra en una palabra cómo te sientes y qué lo causó.',
      'Cuando algo te moleste, espera al menos una hora antes de responder por escrito.',
    ],
  },
  {
    id: 'apr',
    short: 'Aprendizaje',
    full: 'Curiosidad y aprendizaje continuo',
    desc: 'Buscar aprender, pedir retroalimentación y corregir sobre la marcha.',
    actions: [
      'Después de cada entrega, pide una cosa que debas mantener y una que debas cambiar.',
      'Escoge una habilidad nueva por trimestre con una meta concreta, por ejemplo terminar un proyecto real con ella.',
    ],
  },
];

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

// --- Parte 1: frases ----------------------------------------------------------

export const SCALE = [
  { value: 1, label: 'Totalmente en desacuerdo' },
  { value: 2, label: 'En desacuerdo' },
  { value: 3, label: 'Ni de acuerdo ni en desacuerdo' },
  { value: 4, label: 'De acuerdo' },
  { value: 5, label: 'Totalmente de acuerdo' },
];

// Id de cada frase: habilidad + 1 o 2 (directas, en el orden del contenido)
// o + I (inversa). Las de control de sinceridad son ctl1 a ctl4.
const item = (skill, kind, text) => ({ skill, inverse: kind === 'I', text, id: skill + kind });

export const STATEMENTS = Object.fromEntries(
  [
    item('com', '1', 'Cuando explico una idea compleja, la gente la entiende a la primera.'),
    item('com', '2', 'Digo lo que pienso con claridad aunque sepa que no a todos les va a gustar.'),
    item('com', 'I', 'Me cuesta ir al grano: suelo dar muchas vueltas antes de llegar al punto.'),
    item('esc', '1', 'Antes de responder, me aseguro de haber entendido lo que la otra persona quiso decir.'),
    item('esc', '2', 'Suelo notar cuando alguien está incómodo aunque no lo diga.'),
    item('esc', 'I', 'Mientras otros hablan, muchas veces ya estoy pensando en lo que voy a decir.'),
    item('equ', '1', 'Comparto información y crédito con mi equipo sin que me lo pidan.'),
    item('equ', '2', 'Cuando un compañero se atrasa, le ofrezco ayuda antes de que el problema crezca.'),
    item('equ', 'I', 'Prefiero hacer las cosas solo porque así quedan como yo quiero.'),
    item('lid', '1', 'En grupos sin un líder definido, termino organizando quién hace qué.'),
    item('lid', '2', 'Logro que otros se comprometan con una idea aunque al principio no estuvieran convencidos.'),
    item('lid', 'I', 'Evito tomar decisiones que afecten a otros si alguien más puede tomarlas.'),
    item('neg', '1', 'En un desacuerdo, busco entender qué necesita realmente la otra parte, no solo lo que pide.'),
    item('neg', '2', 'Puedo hablar de un conflicto de frente sin que la conversación se vuelva personal.'),
    item('neg', 'I', 'Cedo con tal de evitar una discusión, aunque después me quede inconforme.'),
    item('res', '1', 'Cuando algo me sale mal, me recupero rápido y vuelvo a intentarlo.'),
    item('res', '2', 'Bajo presión de tiempo sigo pensando con claridad.'),
    item('res', 'I', 'Una crítica fuerte me puede afectar el ánimo por varios días.'),
    item('ada', '1', 'Cuando los planes cambian a última hora, me reorganizo sin mayor problema.'),
    item('ada', '2', 'Me adapto con facilidad a personas con estilos de trabajo muy distintos al mío.'),
    item('ada', 'I', 'Me incomoda bastante trabajar sin instrucciones claras.'),
    item('org', '1', 'Cumplo mis entregas a tiempo sin tener que trasnochar al final.'),
    item('org', '2', 'Tengo un sistema claro para priorizar mis pendientes.'),
    item('org', 'I', 'Con frecuencia empiezo tareas importantes más tarde de lo que debería.'),
    item('pen', '1', 'Antes de proponer una solución, separo el problema en sus partes.'),
    item('pen', '2', 'Pregunto en qué datos se basa una afirmación antes de darla por cierta.'),
    item('pen', 'I', 'Suelo quedarme con la primera explicación que se me ocurre.'),
    item('ini', '1', 'Propongo mejoras a cómo se hacen las cosas aunque nadie me lo haya pedido.'),
    item('ini', '2', 'Cuando la solución obvia no funciona, se me ocurren varias alternativas.'),
    item('ini', 'I', 'Prefiero esperar a que me digan qué hacer antes de proponer algo nuevo.'),
    item('aut', '1', 'Sé identificar qué emoción estoy sintiendo y qué la causó.'),
    item('aut', '2', 'Cuando estoy molesto, puedo esperar a calmarme antes de reaccionar.'),
    item('aut', 'I', 'A veces mi estado de ánimo se nota en cómo trato a los demás, sin que yo quiera.'),
    item('apr', '1', 'Busco aprender por mi cuenta cosas que no me exigen en clase ni en el trabajo.'),
    item('apr', '2', 'Pido retroalimentación sobre mi trabajo aunque no sea obligatorio.'),
    item('apr', 'I', 'Cuando me corrigen, mi primera reacción es justificarme.'),
    { id: 'ctl1', control: true, text: 'Nunca he dicho una mentira, ni siquiera una pequeña.' },
    { id: 'ctl2', control: true, text: 'Jamás me he molestado con alguien que me cae bien.' },
    { id: 'ctl3', control: true, text: 'Siempre cumplo absolutamente todo lo que prometo, sin excepción.' },
    { id: 'ctl4', control: true, text: 'Nunca he hablado mal de alguien a sus espaldas.' },
  ].map((s) => [s.id, s]),
);

// --- Parte 2: pares de elección forzada -----------------------------------------

export const PAIRS = [
  {
    id: 'par1',
    a: { skill: 'com', text: 'Me destaco por explicar las cosas de forma que todos entiendan.' },
    b: { skill: 'org', text: 'Me destaco por tener mis pendientes bajo control y a tiempo.' },
  },
  {
    id: 'par2',
    a: { skill: 'pen', text: 'La gente me busca porque encuentro la falla en un razonamiento.' },
    b: { skill: 'esc', text: 'La gente me busca porque sabe que la voy a escuchar.' },
  },
  {
    id: 'par3',
    a: { skill: 'equ', text: 'Lo que más aporto a un equipo es que todos se sientan parte.' },
    b: { skill: 'ini', text: 'Lo que más aporto a un equipo son ideas nuevas.' },
  },
  {
    id: 'par4',
    a: { skill: 'res', text: 'En una crisis, mantengo la calma cuando otros la pierden.' },
    b: { skill: 'lid', text: 'En una crisis, tomo el mando y reparto tareas.' },
  },
  {
    id: 'par5',
    a: { skill: 'neg', text: 'Disfruto encontrar un acuerdo entre posiciones opuestas.' },
    b: { skill: 'apr', text: 'Disfruto dominar algo que hace un mes no sabía hacer.' },
  },
  {
    id: 'par6',
    a: { skill: 'aut', text: 'Mi fuerte es conocerme bien y saber cómo voy a reaccionar.' },
    b: { skill: 'ada', text: 'Mi fuerte es acomodarme rápido a lo que cambie.' },
  },
  {
    id: 'par7',
    a: { skill: 'com', text: 'Me siento cómodo presentando ante un comité con poca preparación.' },
    b: { skill: 'res', text: 'Me siento cómodo si me entregan un proyecto que va mal para rescatarlo.' },
  },
  {
    id: 'par8',
    a: { skill: 'lid', text: 'Prefiero proponer un rumbo y ajustarlo en el camino.' },
    b: { skill: 'esc', text: 'Prefiero entender a cada persona antes de proponer un rumbo.' },
  },
  {
    id: 'par9',
    a: { skill: 'equ', text: 'Me sale natural coordinarme con otros.' },
    b: { skill: 'pen', text: 'Me sale natural analizar datos hasta dar con la causa de un problema.' },
  },
  {
    id: 'par10',
    a: { skill: 'org', text: 'Soy bueno planeando y cumpliendo cronogramas.' },
    b: { skill: 'neg', text: 'Soy bueno manejando conversaciones difíciles.' },
  },
  {
    id: 'par11',
    a: { skill: 'ini', text: 'Se me ocurren soluciones que a otros no se les ocurren.' },
    b: { skill: 'aut', text: 'Noto rápido cuando estoy dejando que una emoción decida por mí.' },
  },
  {
    id: 'par12',
    a: { skill: 'apr', text: 'Siempre estoy aprendiendo algo nuevo por mi cuenta.' },
    b: { skill: 'ada', text: 'Cambio de plan sin drama cuando la situación lo pide.' },
  },
];

// --- Parte 3: casos ----------------------------------------------------------------
// Las opciones van en el orden en que se muestran (A a D) con sus puntos (0 a 3).

const opt = (points, text) => ({ points, text });

export const CASES = {
  caso1: {
    context: 'Universidad',
    text: 'Faltan tres días para entregar un trabajo grupal. Un compañero no ha enviado su parte, no responde mensajes desde ayer y el chat del grupo se está poniendo tenso.',
    options: [
      opt(2, 'Propones en el chat redistribuir su parte de una vez para no arriesgar la nota.'),
      opt(3, 'Le escribes en privado, le preguntas qué está pasando y acuerdan qué puede entregar y cuándo. Si hoy no responde, redistribuyen con el grupo.'),
      opt(0, 'Le avisas al profesor que ese compañero no está aportando.'),
      opt(1, 'Haces tú su parte esta noche para asegurar la entrega y la nota de todos, y hablas con él cuando ya hayan entregado.'),
    ],
  },
  caso2: {
    context: 'Consultoría',
    text: 'Estás presentando hallazgos a un cliente. Su gerente te interrumpe frente a su equipo y dice que tus cifras están mal. Estás bastante seguro de que son correctas.',
    options: [
      opt(2, 'Dices que lo van a revisar y sigues con la presentación.'),
      opt(1, 'Defiendes tus cifras explicando paso a paso la metodología, las fuentes y los supuestos para que quede claro que están bien.'),
      opt(0, 'Reconoces que seguramente tiene razón para no incomodarlo frente a su equipo.'),
      opt(3, 'Le preguntas qué cifra le parece distinta, explicas en una frase de dónde sale y le ofreces revisarla juntos al terminar si la duda sigue.'),
    ],
  },
  caso3: {
    context: 'Universidad',
    text: 'Te sacaste una nota muy baja en un proyecto al que le metiste muchas horas. La retroalimentación es dura y una parte te parece injusta.',
    options: [
      opt(3, 'Esperas un día, relees la retroalimentación separando lo válido de lo que no y pides una cita con el profesor con preguntas concretas.'),
      opt(0, 'Le escribes al profesor esa misma noche explicando por qué la nota es injusta.'),
      opt(2, 'Lo hablas con compañeros para ver si a ellos también les pareció injusta antes de decidir qué hacer.'),
      opt(1, 'Aceptas la nota sin decir nada y te concentras en la siguiente entrega.'),
    ],
  },
  caso4: {
    context: 'Eventos',
    text: 'Coordinas un evento corporativo. Dos horas antes de empezar, el cliente pide cambiar el montaje de las mesas y agregar 20 invitados.',
    options: [
      opt(1, 'Le dices que sí a todo y pones a todo el equipo a trabajar de inmediato.'),
      opt(2, 'Haces el cambio de mesas, que depende de tu equipo, y le pides al cliente que resuelva lo de los invitados directamente con el catering.'),
      opt(3, 'Confirmas qué es imprescindible para el cliente, revisas con los proveedores qué es viable en dos horas y le propones una versión realista.'),
      opt(0, 'Le explicas que con tan poco tiempo no es posible hacer cambios.'),
    ],
  },
  caso5: {
    context: 'Universidad',
    text: 'Te toca un proyecto grande con cuatro personas y ningún líder asignado. Después de la primera reunión nadie definió nada y todos parecen estar esperando.',
    options: [
      opt(2, 'Repartes tú las tareas según lo que crees que cada uno hace mejor y compartes el plan ya listo para no perder más tiempo.'),
      opt(0, 'Esperas a la siguiente reunión para ver si alguien toma la iniciativa.'),
      opt(1, 'Propones que cada uno elija en el chat qué parte quiere, por orden de llegada.'),
      opt(3, 'Propones una estructura inicial con partes, responsables y fechas, y le pides al grupo que la ajuste antes de cerrarla.'),
    ],
  },
  caso6: {
    context: 'Eventos',
    text: 'Una semana antes de un evento, un proveedor clave te sube el precio 15%. Tu presupuesto es fijo y el cliente ya lo aprobó.',
    options: [
      opt(3, 'Le preguntas qué motivó el aumento y exploras qué podrías ofrecer tú, como pago anticipado, más eventos o un pedido ajustado, a cambio de mantener el precio.'),
      opt(2, 'Le ofreces partir la diferencia y aceptar un aumento del 7,5%.'),
      opt(1, 'Le dices que el aumento es inaceptable, le recuerdas que el precio estaba acordado y le adviertes que, si no lo mantiene, buscas otro proveedor.'),
      opt(0, 'Aceptas el aumento porque ya no hay tiempo de buscar otro.'),
    ],
  },
  caso7: {
    context: 'Trabajo',
    text: 'Esta semana tienes un parcial, un informe del trabajo y una entrega de consultoría. Te das cuenta de que no alcanzas a hacer las tres cosas bien.',
    options: [
      opt(0, 'Empiezas por la que más te gusta para coger impulso y ves hasta dónde llegas con las demás.'),
      opt(1, 'Trasnochas los días que haga falta: sacrificar sueño una semana vale la pena si entregas las tres completas.'),
      opt(3, 'Estimas cuánto toma cada una, identificas cuál tiene más consecuencias si se atrasa y negocias desde hoy un nuevo plazo para la que tenga margen.'),
      opt(2, 'Te concentras en la de mayor peso y entregas las otras dos con lo mínimo aceptable.'),
    ],
  },
  caso8: {
    context: 'Consultoría',
    text: 'Un cliente te dice que sus ventas cayeron 20% por la llegada de un competidor nuevo y te pide diseñar una campaña de mercadeo para contrarrestarlo.',
    options: [
      opt(1, 'Investigas a fondo al competidor: precios, canales y propuesta de valor, para entender cómo diferenciarse.'),
      opt(0, 'Diseñas la campaña, porque el cliente conoce su negocio mejor que tú.'),
      opt(3, 'Antes de diseñar nada, revisas las ventas por producto, canal y periodo para confirmar si la caída coincide con la llegada del competidor.'),
      opt(2, 'Le propones validar la hipótesis con una encuesta rápida a clientes que dejaron de comprar.'),
    ],
  },
  caso9: {
    context: 'Trabajo',
    text: 'En tu trabajo hay un proceso mensual que toma dos días de trabajo manual. Crees que se podría automatizar en Excel, pero nadie te lo ha pedido.',
    options: [
      opt(2, 'Le preguntas primero a tu jefe por qué se hace así y si hay restricciones, y después propones la mejora.'),
      opt(1, 'Le comentas la idea a tu jefe en una frase la próxima vez que lo veas.'),
      opt(3, 'Haces un prototipo pequeño, mides cuánto tiempo ahorra y se lo muestras a tu jefe con esos datos.'),
      opt(0, 'No haces nada: si nadie lo ha cambiado, por algo será.'),
    ],
  },
  caso10: {
    context: 'Universidad',
    text: 'En una reunión de equipo, un compañero hace un comentario sarcástico sobre tu parte del trabajo delante de todos. Sientes que te sube la rabia.',
    options: [
      opt(0, 'Respondes con otro comentario para que no quede así.'),
      opt(2, 'Le pides en el momento, con calma, que explique qué le parece mal de tu parte.'),
      opt(1, 'Lo ignoras por completo y sigues como si nada.'),
      opt(3, 'Notas la reacción, no respondes en caliente y después hablas con él en privado sobre cómo te cayó el comentario.'),
    ],
  },
  caso11: {
    context: 'Trabajo',
    text: 'Una compañera se te acerca a contarte que está desbordada de trabajo y que tiene problemas personales. Tú también estás muy ocupado ese día.',
    options: [
      opt(1, 'Le das consejos prácticos rápidos para que se organice mejor.'),
      opt(3, 'Paras unos minutos, la escuchas sin interrumpir, le preguntas qué le ayudaría y, si no puedes ahora, acuerdan un momento concreto para hablar.'),
      opt(0, 'Le dices que la entiendes porque tú también estás igual de cargado.'),
      opt(2, 'Le sugieres que hable hoy mismo con el jefe para que le redistribuyan parte del trabajo, ya que eso sí soluciona el problema de fondo.'),
    ],
  },
  caso12: {
    context: 'Práctica',
    text: 'En tu práctica, tu jefe te dice que el informe que entregaste no tiene estructura y no está al nivel que espera el área.',
    options: [
      opt(0, 'Le explicas por qué lo estructuraste así para que entienda tu lógica.'),
      opt(2, 'Agradeces y corriges exactamente los puntos que señaló.'),
      opt(1, 'Buscas guías y plantillas de informes ejecutivos, eliges la que se vea más profesional y reorganizas todo con ese formato.'),
      opt(3, 'Le pides un ejemplo de un informe que sí cumpla el estándar, rehaces el tuyo con esa referencia y le pides que lo revise otra vez.'),
    ],
  },
  // Solo en la exprés.
  casoNuevo: {
    context: 'Trabajo',
    text: 'Propones automatizar en Excel un proceso que hoy toma dos días de trabajo manual. Un compañero con más años en la empresa dice, frente a tu jefe, que eso ya se intentó y no funcionó.',
    options: [
      opt(0, 'Le respondes que las herramientas han cambiado y que esta vez sí va a funcionar.'),
      opt(1, 'Retiras la propuesta por ahora y la vuelves a plantear en unos meses, cuando haya mejor ambiente.'),
      opt(3, 'Le preguntas qué pasó cuando lo intentaron, tomas nota de lo que falló y propones probar una versión pequeña que evite ese problema.'),
      opt(2, 'Le dices que entiendes y propones mostrarle a tu jefe un prototipo en una semana para que los resultados decidan.'),
    ],
  },
};

// --- Versiones -----------------------------------------------------------------------

// Orden fijo de la parte 1. Va por rondas (una frase de cada habilidad por ronda),
// el orden de las habilidades cambia en cada ronda, las inversas quedan repartidas
// y las de control caen en las posiciones pedidas (8, 19, 29 y 37 en la completa;
// 10 y 20 en la exprés).
const COMPLETA_STATEMENTS = [
  // Ronda 1
  'com1', 'orgI', 'esc1', 'ini1', 'resI', 'equ1', 'pen1', 'ctl1', 'lidI', 'aut1', 'ada1', 'negI', 'apr1',
  // Ronda 2
  'lid1', 'pen2', 'autI', 'com2', 'ada2', 'ctl2', 'escI', 'apr2', 'org1', 'equI', 'neg1', 'iniI', 'res1',
  // Ronda 3
  'neg2', 'adaI', 'ctl3', 'equ2', 'aprI', 'org2', 'lid2', 'res2', 'comI', 'ini2', 'ctl4', 'esc2', 'penI', 'aut2',
];

const EXPRES_STATEMENTS = [
  // Ronda 1
  'com1', 'orgI', 'esc1', 'iniI', 'res1', 'equI', 'pen1', 'lidI', 'aut2', 'ctl1', 'adaI', 'neg1', 'aprI',
  // Ronda 2
  'lid1', 'penI', 'ada1', 'autI', 'org2', 'comI', 'ctl3', 'equ2', 'escI', 'apr2', 'negI', 'ini1', 'resI',
];

export const VERSIONS = {
  expres: {
    id: 'expres',
    name: 'Exprés',
    minutes: 5,
    blurb: '5 minutos · 26 frases, 6 pares y 4 casos. Una foto rápida de tus 12 habilidades.',
    statements: EXPRES_STATEMENTS,
    pairs: PAIRS.slice(0, 6).map((p) => p.id),
    cases: [
      { id: 'caso1', main: 'equ', secondary: ['lid', 'neg'] },
      { id: 'caso2', main: 'com', secondary: ['pen', 'aut'] },
      { id: 'caso4', main: 'ada', secondary: ['org', 'res'] },
      { id: 'casoNuevo', main: 'ini', secondary: ['esc', 'apr'] },
    ],
    weights: { self: 0.5, cases: 0.4, pref: 0.1 },
    gap: 40,
    sincerityMin: 2,
    pace: { p1: 55, p3: 40 },
    partWeights: [2, 1, 2],
    method:
      'Esta versión usa dos frases y uno o dos casos por habilidad, así que es una foto rápida y puede moverse varios puntos de un día a otro. El índice combina tu autodescripción (50%), tus decisiones en los casos (40%) y tus elecciones forzadas (10%).',
  },
  completa: {
    id: 'completa',
    name: 'Completa',
    minutes: 20,
    blurb: '20 minutos · 40 frases, 12 pares y 12 casos. Más precisa, con más casos por habilidad.',
    statements: COMPLETA_STATEMENTS,
    pairs: PAIRS.map((p) => p.id),
    cases: [
      { id: 'caso1', main: 'equ', secondary: ['neg'] },
      { id: 'caso2', main: 'com', secondary: ['lid'] },
      { id: 'caso3', main: 'res', secondary: ['aut'] },
      { id: 'caso4', main: 'ada', secondary: ['org'] },
      { id: 'caso5', main: 'lid', secondary: ['equ'] },
      { id: 'caso6', main: 'neg', secondary: ['esc'] },
      { id: 'caso7', main: 'org', secondary: ['res'] },
      { id: 'caso8', main: 'pen', secondary: ['com'] },
      { id: 'caso9', main: 'ini', secondary: ['lid'] },
      { id: 'caso10', main: 'aut', secondary: ['esc'] },
      { id: 'caso11', main: 'esc', secondary: ['equ'] },
      { id: 'caso12', main: 'apr', secondary: ['res'] },
    ],
    weights: { self: 0.45, cases: 0.4, pref: 0.15 },
    gap: 35,
    sincerityMin: 3,
    pace: { p1: 100, p3: 150 },
    partWeights: [5, 2, 10],
    method:
      'La Brújula combina formatos de instrumentos validados: autodescripción con frases inversas, elección forzada, juicio situacional y una escala de sinceridad. El diagnóstico en sí no ha pasado por una validación estadística, así que úsalo como mapa de autoconocimiento y no como diagnóstico clínico. El índice combina tu autodescripción (45%), tus decisiones en los casos (40%) y tus elecciones forzadas (15%).',
  },
};

export const PAIR_BY_ID = Object.fromEntries(PAIRS.map((p) => [p.id, p]));

export const PARTS = [
  { n: 1, name: 'Autodescripción', unit: 'Frase' },
  { n: 2, name: 'Elección forzada', unit: 'Par' },
  { n: 3, name: 'Casos', unit: 'Caso' },
];
