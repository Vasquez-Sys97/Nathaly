# Informe de pruebas — 29 razones para celebrar tu vida

Fecha: 2026-11-10 · Versión: v2 (`01_Proyectos/29_Razones_Nathaly_v2`)

## Cómo se probó

1. **Prueba automatizada** con Playwright sobre Google Chrome, con emulación de dispositivo (agente de usuario, pantalla táctil y densidad de píxeles):
   - iPhone 13 Mini (375 × 812)
   - iPhone SE (375 × 667, pantalla baja)
   - iPhone 15 Pro Max (430 × 932)
   - Escritorio (1280 × 800)
   - Preferencia «reducir movimiento» activada
2. **Prueba manual** en el navegador integrado a 375 × 812 y 375 × 667: recorrido completo con clics reales, revisión visual de cada escena.

La prueba automatizada recorre la experiencia con clics reales: abre el sobre, pasa a la carta, revela tarjetas, navega el visor, recarga la página, completa las 29, enciende las velas, llega al mensaje final, regresa, reinicia y alterna la música.

## Resultados

| Validación | iPhone 13 Mini | iPhone SE | iPhone 15 Pro Max | Escritorio |
|---|---|---|---|---|
| Apertura del sobre y paso a la carta | ✔ | ✔ | ✔ | ✔ |
| Carta con 4 párrafos revelados en secuencia | ✔ | ✔ | ✔ | ✔ |
| 29 tarjetas generadas | ✔ | ✔ | ✔ | ✔ |
| Progreso tras 8 tarjetas: «8 descubiertas · faltan 21» | ✔ | ✔ | ✔ | ✔ |
| Visor: título correcto y botón «siguiente» (06 → 07) | ✔ | ✔ | ✔ | ✔ |
| Avance conservado al recargar (9 de 9) | ✔ | ✔ | ✔ | ✔ |
| Colección completa: «Las 29 descubiertas» y mensaje final | ✔ | ✔ | ✔ | ✔ |
| 29 velas encendidas y mensaje del deseo | ✔ | ✔ | ✔ | ✔ |
| Mensaje final con firma visible | ✔ | ✔ | ✔ | ✔ |
| Flecha «atrás» desde la escena 5 lleva a la 4 | ✔ | ✔ | ✔ | ✔ |
| «Volver a empezar» lleva al sobre | ✔ | ✔ | ✔ | ✔ |
| Música: activar y silenciar | ✔ | ✔ | ✔ | ✔ |
| Sin desplazamiento horizontal (escenas 1, 3 y 5) | ✔ | ✔ | ✔ | ✔ |
| Errores en consola | 0 | 0 | 0 | 0 |
| Recursos que no cargaron | 0 | 0 | 0 | 0 |

Movimiento reducido: el sobre abre de inmediato y las animaciones duran 0,01 ms; las partículas se ocultan. ✔

## Accesibilidad básica

- Todos los controles son `<button>` con nombre accesible (el sobre, las tarjetas, las flechas y la música).
- Las tarjetas anuncian su estado: «Razón 5, sin descubrir» o «Razón 5: Porque 29 años son una historia valiosa».
- El visor es un diálogo modal: recibe el foco, lo mantiene dentro (Tab), se cierra con Escape, se navega con las flechas del teclado y devuelve el foco a la tarjeta.
- Progreso con `role="progressbar"` y texto en región `aria-live`.
- Foco visible en todos los controles. Objetivos táctiles de 44 px o más.
- Contraste: texto vino `#3E0A20`/`#79113A` sobre marfil supera 4.5:1. El texto blanco sobre frambuesa `#C62744` (botones, 14 px en negrita y mayúsculas) está alrededor de 5:1.

## Problemas encontrados y corregidos

1. Al abrirse, la carta se superponía al nombre «Nathaly». Ahora el nombre se desvanece durante la apertura.
2. La ramita decorativa se montaba sobre el saludo. Ahora tiene más margen superior.
3. «¡Felices 29 años!» se partía en dos líneas a 375 px. Ahora el tamaño se adapta al ancho.
4. El encuadre del pastel dejaba aire de sobra arriba. Se recortó la caja del SVG y se agrandaron las velas.
5. La revelación de la carta dependía de `requestAnimationFrame`, que se pausa en pestañas en segundo plano. Se cambió por un temporizador.

## Limitaciones conocidas

- **No se probó en Safari real ni en el motor WebKit.** WebKit no está instalado en este equipo y descargarlo requiere autorización. Se usaron solo funciones con soporte amplio en Safari 15 o superior (CSS `clip-path`, `aspect-ratio`, variables, `dvh` no requerido, Web Audio con prefijo `webkit`). Recomendación: abrir el enlace en un iPhone antes de enviarlo.
- La música usa Web Audio. En iPhone, si el interruptor de silencio está activado, iOS puede no reproducir audio web.
- En la captura de Figma de la escena 5, la firma aún no había aparecido (estaba en su animación de entrada). En la página real sí aparece, como confirma la prueba.

## Capturas

En `capturas/` (iPhone 13 Mini, 375 × 812 a 3×): sobre, carta, razones, visor de una razón, pastel antes y después de encender, y mensaje final.
