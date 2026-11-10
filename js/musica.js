/*
 * Música opcional generada en el navegador con Web Audio API.
 * No usa archivos ni servicios externos y nunca arranca sola:
 * solo suena después de que la persona pulsa el botón de música.
 *
 * Si prefieres una canción propia, coloca un archivo en assets/musica.mp3
 * y cambia USAR_ARCHIVO a true.
 */
window.Musica = (function () {
  var USAR_ARCHIVO = false;
  var RUTA_ARCHIVO = "assets/musica.mp3";

  var ctx = null;
  var maestro = null;
  var temporizador = null;
  var sonando = false;
  var audioEl = null;
  var paso = 0;

  // Progresión suave: Fmaj7 – Am7 – Dm9 – Bbmaj7 (frecuencias en Hz)
  var ACORDES = [
    [174.61, 220.00, 261.63, 329.63],
    [220.00, 261.63, 329.63, 392.00],
    [146.83, 220.00, 261.63, 349.23],
    [116.54, 174.61, 233.08, 293.66]
  ];
  var MELODIA = [523.25, 587.33, 659.25, 698.46, 659.25, 587.33, 523.25, 440.00];

  function nota(freq, inicio, duracion, volumen, tipo) {
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = tipo || "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, inicio);
    g.gain.exponentialRampToValueAtTime(volumen, inicio + Math.min(1.2, duracion / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
    osc.connect(g);
    g.connect(maestro);
    osc.start(inicio);
    osc.stop(inicio + duracion + 0.05);
  }

  function compas() {
    if (!sonando) return;
    var t = ctx.currentTime + 0.05;
    var acorde = ACORDES[paso % ACORDES.length];
    acorde.forEach(function (f) { nota(f, t, 4.4, 0.05, "sine"); });
    // Arpegio delicado
    for (var i = 0; i < 4; i++) {
      nota(MELODIA[(paso * 2 + i) % MELODIA.length], t + i, 1.6, 0.035, "triangle");
    }
    paso++;
  }

  function iniciarSintetizado() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (!ctx) {
      ctx = new AC();
      maestro = ctx.createGain();
      maestro.gain.value = 0.0001;
      maestro.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    maestro.gain.cancelScheduledValues(ctx.currentTime);
    maestro.gain.setValueAtTime(Math.max(maestro.gain.value, 0.0001), ctx.currentTime);
    maestro.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 1.5);
    compas();
    temporizador = setInterval(compas, 4000);
    return true;
  }

  function detenerSintetizado() {
    clearInterval(temporizador);
    temporizador = null;
    if (ctx && maestro) {
      maestro.gain.cancelScheduledValues(ctx.currentTime);
      maestro.gain.setValueAtTime(Math.max(maestro.gain.value, 0.0001), ctx.currentTime);
      maestro.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    }
  }

  function reproducir() {
    if (sonando) return true;
    sonando = true;
    if (USAR_ARCHIVO) {
      if (!audioEl) {
        audioEl = new Audio(RUTA_ARCHIVO);
        audioEl.loop = true;
        audioEl.volume = 0.5;
      }
      var p = audioEl.play();
      if (p && p.catch) p.catch(function () { sonando = false; });
      return true;
    }
    var ok = iniciarSintetizado();
    if (!ok) sonando = false;
    return ok;
  }

  function silenciar() {
    sonando = false;
    if (audioEl) audioEl.pause();
    detenerSintetizado();
  }

  // Destello sonoro al encender las velas. Solo suena si la música ya está activada.
  function campanita() {
    if (!sonando || USAR_ARCHIVO || !ctx) return;
    var t = ctx.currentTime + 0.05;
    [1046.5, 1318.5, 1568, 2093].forEach(function (f, i) { nota(f, t + i * 0.12, 1.8, 0.03, "sine"); });
  }

  // Pausa la música si la pestaña queda oculta y la retoma al volver.
  var pausadaPorOcultar = false;
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && sonando) { pausadaPorOcultar = true; silenciar(); }
    else if (!document.hidden && pausadaPorOcultar) { pausadaPorOcultar = false; reproducir(); }
  });

  return {
    campanita: campanita,
    reproducir: reproducir,
    silenciar: silenciar,
    alternar: function () { return sonando ? (silenciar(), false) : reproducir(); },
    estaSonando: function () { return sonando; }
  };
})();
