# skilly

**Porque en Skilly te adaptamos al mercado.** Skilly prepara a jóvenes para su primer empleo con una ruta
gamificada de habilidades: perfilación corta, lecciones de pocos minutos, XP y
niveles con Kiki el camaleón, y certificados al aprobar cada módulo.

**Pruébala:** https://santiagorv104-dev.github.io/skilly/

Cada cambio que se sube a `main` se publica solo en ese link (workflow
`.github/workflows/publicar.yml`, tarda uno o dos minutos).

## Qué incluye esta versión

- **Splash** (~2,5 s): Kiki se dibuja de la cabeza a la cola, la espiral se
  enrolla, el ojo parpadea y aparece "skilly" letra por letra con el lema. Se ve
  una vez por sesión y es estático si el sistema tiene "reducir movimiento".
- **Landing**, **registro e inicio de sesión**.
- **Perfilación**: 5 preguntas que definen tu ruta (empieza por la habilidad que elijas).
- **Inicio**: Kiki, nivel y barra de XP, ruta de módulos y logros.
- **Cinco módulos**: Liderazgo, Comunicación efectiva, Trabajo en equipo,
  Resiliencia y Resolución de problemas. Cada uno con un video de Kiki,
  4 lecciones y un reto final (70 % para aprobar).
- **Certificado** de cada módulo, listo para imprimir o guardar como PDF.
- **Subida de nivel**: Kiki cambia de color (morado → verde → amarillo → morado).
- Favicon, íconos y `manifest.json` para instalarla como app.

Es una versión de prueba sin servidor: la cuenta y el progreso se guardan en el
navegador del dispositivo (`localStorage`) y la contraseña no se almacena.

## Cómo correrla

Necesitas [Node.js](https://nodejs.org) 18 o superior.

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # versión de producción en dist/
npm run preview  # sirve dist/ para probarla
```

## Estructura

```
public/            logo original, logo.svg, favicon, íconos y manifest.json
src/brand/         identidad: Kiki en SVG animable, logotipo, splash y paleta
src/pages/         pantallas (landing, acceso, perfilación, inicio, módulo, reto, certificado)
src/components/    barra de navegación, barra de XP y diálogo de subida de nivel
src/content/       textos de la perfilación y de los cinco módulos (lecciones, retos, guiones)
videos/            generador de los videos (clips de Pexels + voz Piper + ffmpeg)
src/state.jsx      cuenta, XP, niveles y progreso
```

## Videos de los módulos

Cada módulo tiene un video de ~1 minuto con personas reales: Kiki se dibuja,
una cortina revela al primer clip y en cada lección aparece su idea clave sobre
el video, con Kiki en una insignia. Están en `public/videos/` (MP4, póster y
subtítulos `.vtt`).

- **Clips**: Pexels ([licencia](https://www.pexels.com/license/): uso gratuito y
  comercial, sin atribución obligatoria). La lista con el id de cada clip está
  en `videos/clips.json`.
- **Voz**: [Piper](https://github.com/rhasspy/piper) (MIT) con la voz
  `es_MX-claude-high` (Apache 2.0), sin conexión.
- **Guion**: los textos de `src/content/` (`video.intro`, `video.outro` y `say`
  de cada lección).

Para regenerarlos (Windows), dentro de `videos/`:

```powershell
npm install
node render.mjs
```

La primera vez descarga Piper, la voz, los clips y la fuente en
`%LOCALAPPDATA%\skilly-videos`. `node piper.mjs --muestras` genera una muestra
de cada voz disponible.

## Identidad visual

Kiki es un camaleón morado de trazo grueso con la cola en espiral. El SVG de
`src/brand/kikiPaths.js` está calcado del logo original (`public/logo.png`) y
separado por partes (cabeza, lomo, panza, pata, cola y ojo) para animarlo.

| Uso | Color | Contraste |
|---|---|---|
| Morado principal (logo, títulos) | `#4A2475` | 9,4:1 sobre lavanda |
| Morado medio (botones) | `#6C3CE1` | texto blanco 6,2:1 |
| Lavanda (fondo) | `#EEE2FF` | — |
| Verde de logro | `#22C55E` | texto morado encima 5,1:1 |
| Amarillo de recompensa | `#FACC15` | texto morado encima 7,6:1 |

El verde y el amarillo no se usan como color de texto ni llevan texto blanco
encima; para texto hay variantes oscuras (`#166534`, `#854D0E`). Todas las
variables están en `src/brand/brand.css`.
