# 29 razones para celebrar tu vida

Experiencia web de cumpleaños para Nathaly, en cinco escenas: el sobre, la carta, las 29 razones, el pastel con 29 velas y el mensaje final. HTML, CSS y JavaScript sin dependencias, sin backend y sin datos personales en servidores.

## Cómo verla en tu computadora

Con Python instalado, desde esta carpeta:

```bash
python -m http.server 8330
```

Abre `http://localhost:8330` en el navegador. También funciona con doble clic sobre `index.html`, o con el archivo único de `dist/`, que no necesita servidor.

## Cómo publicarla

Es un sitio estático: sube el contenido de esta carpeta (o del ZIP de `dist/`) a cualquier hosting estático gratuito.

- **Netlify Drop**: arrastra la carpeta a app.netlify.com/drop y obtienes un enlace.
- **GitHub Pages**: sube los archivos a un repositorio y activa Pages en la rama principal.
- **Vercel / Cloudflare Pages**: proyecto estático, sin comando de build, carpeta raíz.

El archivo único `dist/29_razones_nathaly_<fecha>.html` también se puede enviar directamente por correo o mensajería: se abre en cualquier navegador.

## Estructura

```
index.html          estructura de las cinco escenas
css/estilos.css     diseño, paleta y animaciones
js/datos.js         TODOS los textos (carta, 29 razones, deseo, mensaje final)
js/musica.js        música opcional generada en el navegador (Web Audio API)
js/app.js           navegación, tarjetas, visor, pastel, partículas
img/favicon.svg     icono
construir.py        genera el archivo único y el ZIP en dist/
capturas/           capturas de las escenas a 375 px
INFORME_PRUEBAS.md  resultados de las pruebas
```

## Cambiar textos

Edita solo `js/datos.js`. Cada razón tiene `titulo`, `texto` y `motivo` (la ilustración: `corazon`, `flor`, `petalo`, `destello`, `hoja` o `luna`). La numeración 01–29 se asigna sola según el orden. Después de editar, regenera el paquete:

```bash
python construir.py
```

## Música

La música es opcional y nunca arranca sola: suena al pulsar el botón de nota musical (arriba a la derecha) y se pausa con el mismo botón. Se genera en el navegador, así que no hay archivos de audio ni derechos de autor de por medio. Para usar una canción propia, copia el archivo como `assets/musica.mp3` y cambia `USAR_ARCHIVO` a `true` en `js/musica.js`.

## Detalles de comportamiento

- El avance de las tarjetas se guarda en el navegador (localStorage). Si el navegador no lo permite, la experiencia funciona igual pero sin recordar el avance.
- En todas las escenas hay forma de regresar: la flecha superior y los puntos de navegación (solo hacia escenas ya visitadas).
- Enlaces directos para revisar: `#parte-1` … `#parte-5` al final de la URL.
- Si el dispositivo tiene activado «reducir movimiento», se desactivan las animaciones y las partículas.

## Paleta

Vino `#79113A` · Frambuesa `#C62744` · Rosa `#DB8192` · Rosa suave `#E7AAB7` · Marfil `#E9E7DD`.
Tipografías de Google Fonts: Cormorant Garamond (títulos), Jost (textos de apoyo), Pinyon Script (manuscrito).
