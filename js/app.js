/*
 * Lógica de la experiencia «29 razones para celebrar tu vida».
 * Los textos viven en datos.js; aquí solo hay comportamiento.
 */
(function () {
  "use strict";

  var D = window.EXPERIENCIA;
  var CLAVE = "29razones-nathaly-v2";
  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var COLORES = ["#79113A", "#C62744", "#DB8192", "#E7AAB7"];

  function $(id) { return document.getElementById(id); }
  function dos(n) { return (n < 10 ? "0" : "") + n; }
  function esperar(ms) { return reducido ? Math.min(ms, 60) : ms; }

  /* ---------- Ilustraciones de las tarjetas (viewBox 0 0 48 48) ---------- */
  var MOTIVOS = {
    corazon: '<path fill="currentColor" d="M24 40s-14-8.5-17.5-17C4.3 16.6 8 10 14.5 10c4 0 7.3 2.3 9.5 5.6C26.2 12.3 29.5 10 33.5 10 40 10 43.7 16.6 41.5 23 38 31.5 24 40 24 40z"/>',
    flor: (function () {
      var s = "";
      for (var i = 0; i < 5; i++) {
        s += '<ellipse cx="24" cy="13" rx="6.5" ry="10" fill="currentColor" opacity=".8" transform="rotate(' + (i * 72) + ' 24 24)"/>';
      }
      return s + '<circle cx="24" cy="24" r="5" fill="currentColor"/>';
    })(),
    petalo: '<path fill="currentColor" d="M24 5C35 14 37 30 24 43 11 30 13 14 24 5z"/><path d="M24 12v26" stroke="#F6F4EE" stroke-width="1.2" opacity=".6" fill="none"/>',
    destello: '<path fill="currentColor" d="M24 4c1.6 10.4 9.6 18.4 20 20-10.4 1.6-18.4 9.6-20 20-1.6-10.4-9.6-18.4-20-20 10.4-1.6 18.4-9.6 20-20z"/><circle cx="39" cy="9" r="2.4" fill="currentColor" opacity=".6"/>',
    hoja: '<path fill="currentColor" d="M9 39C9 20 21 9 40 8c0 19-12 31-31 31z"/><path d="M11 37C18 28 26 19 35 13" stroke="#F6F4EE" stroke-width="1.2" opacity=".6" fill="none"/>',
    luna: '<path fill="currentColor" d="M30 5a19 19 0 1 0 13 31A16 16 0 0 1 30 5z"/><circle cx="38" cy="13" r="1.8" fill="currentColor" opacity=".6"/>'
  };
  var CORAZON_SVG = '<svg viewBox="0 0 48 48" width="100%" height="100%">' + MOTIVOS.corazon + "</svg>";

  /* ---------- Estado (la persistencia es solo una comodidad) ---------- */
  var estado = { actual: 0, maxVisitada: 0, descubiertas: [], velas: false };

  function cargar() {
    try {
      var g = JSON.parse(window.localStorage.getItem(CLAVE) || "null");
      if (!g) return;
      if (Array.isArray(g.descubiertas)) {
        estado.descubiertas = g.descubiertas.filter(function (n, i, a) {
          return typeof n === "number" && n >= 0 && n < D.razones.lista.length && a.indexOf(n) === i;
        });
      }
      estado.maxVisitada = Math.max(0, Math.min(4, g.maxVisitada | 0));
      estado.velas = !!g.velas;
    } catch (e) { /* sin almacenamiento: se continúa sin persistencia */ }
  }
  function guardar() {
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify({
        descubiertas: estado.descubiertas, maxVisitada: estado.maxVisitada, velas: estado.velas
      }));
    } catch (e) { /* sin persistencia */ }
  }

  /* ---------- Aviso breve ---------- */
  var avisoT = null;
  function avisar(texto) {
    var el = $("aviso");
    el.textContent = texto;
    el.classList.add("visible");
    clearTimeout(avisoT);
    avisoT = setTimeout(function () { el.classList.remove("visible"); }, 2200);
  }

  /* ---------- Textos ---------- */
  function poblarTextos() {
    $("t-sobre").textContent = D.destinataria;
    $("frase-sobre").textContent = D.sobre.frase;
    $("btn-abrir").textContent = D.sobre.boton;

    $("t-carta").textContent = D.carta.saludo;
    var cp = $("carta-parrafos");
    D.carta.parrafos.forEach(function (t, i) {
      var p = document.createElement("p");
      p.className = "parrafo revela";
      p.style.setProperty("--d", (0.5 + i * 0.7) + "s");
      p.textContent = t;
      cp.appendChild(p);
    });
    $("btn-descubrir").textContent = D.carta.boton;

    $("t-razones").textContent = D.razones.titulo;
    $("subtitulo-razones").textContent = D.razones.subtitulo;
    $("mensaje-completo").textContent = D.razones.completo;

    $("t-pastel").textContent = D.pastel.titulo;
    $("subtitulo-pastel").textContent = D.pastel.subtitulo;
    $("btn-velas").textContent = D.pastel.boton;

    var fp = $("final-parrafos");
    D.final.parrafos.forEach(function (t, i) {
      var p = document.createElement("p");
      p.className = "parrafo revela";
      p.style.setProperty("--d", (0.3 + i * 0.8) + "s");
      p.textContent = t;
      fp.appendChild(p);
    });
    var f = $("felicidades");
    f.textContent = D.final.felicidades;
    f.style.setProperty("--d", (0.3 + D.final.parrafos.length * 0.8) + "s");
    var fi = $("firma");
    fi.textContent = D.final.firma;
    fi.style.setProperty("--d", (0.9 + D.final.parrafos.length * 0.8) + "s");
  }

  /* ---------- Navegación entre escenas ---------- */
  var escenas = Array.prototype.slice.call(document.querySelectorAll(".escena"));
  var puntos = [];
  var cambiando = false;

  function construirPuntos() {
    var nav = $("puntos");
    escenas.forEach(function (sec, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "punto";
      b.setAttribute("aria-label", (i + 1) + " de 5: " + sec.getAttribute("data-nombre"));
      b.addEventListener("click", function () { irA(i); });
      nav.appendChild(b);
      puntos.push(b);
    });
    actualizarPuntos();
  }
  function actualizarPuntos() {
    puntos.forEach(function (b, i) {
      if (i === estado.actual) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      b.classList.toggle("visitada", i <= estado.maxVisitada);
      b.disabled = i > estado.maxVisitada;
    });
    $("btn-volver").disabled = estado.actual === 0;
  }

  function irA(n) {
    if (n < 0 || n >= escenas.length || n === estado.actual || cambiando) return;
    cambiando = true;
    var desde = escenas[estado.actual];
    var hacia = escenas[n];
    salirDe(estado.actual);
    desde.classList.add("saliendo");
    setTimeout(function () {
      desde.hidden = true;
      desde.classList.remove("saliendo", "entrando", "mostrada", "sin-espera");
      estado.actual = n;
      estado.maxVisitada = Math.max(estado.maxVisitada, n);
      guardar();
      hacia.hidden = false;
      hacia.classList.add("entrando");
      $("escenario").scrollTop = 0;
      actualizarPuntos();
      var titulo = hacia.querySelector("h1, h2");
      if (titulo) { titulo.setAttribute("tabindex", "-1"); titulo.focus({ preventScroll: true }); }
      void hacia.offsetWidth;
      setTimeout(function () { hacia.classList.add("mostrada"); entrarEn(n); }, 40);
      cambiando = false;
    }, esperar(340));
  }

  function entrarEn(n) {
    if (n === 0) reiniciarSobre();
    if (n === 4) iniciarCorazones();
  }
  function salirDe(n) {
    if (n === 4) detenerCorazones();
  }

  /* ---------- Escena 01: sobre ---------- */
  var abriendo = false;
  function abrirSobre() {
    if (abriendo) return;
    abriendo = true;
    $("sobre").classList.add("abierto");
    escenas[0].querySelector(".contenido").classList.add("abriendo");
    $("btn-abrir").classList.remove("pulso");
    $("btn-abrir").disabled = true;
    setTimeout(function () { abriendo = false; irA(1); }, esperar(1900));
  }
  function reiniciarSobre() {
    $("sobre").classList.remove("abierto");
    escenas[0].querySelector(".contenido").classList.remove("abriendo");
    $("btn-abrir").disabled = false;
    $("btn-abrir").classList.add("pulso");
    abriendo = false;
  }

  /* ---------- Escena 03: tarjetas ---------- */
  var tarjetas = [];
  var total = D.razones.lista.length;

  function construirTarjetas() {
    var ul = $("rejilla");
    D.razones.lista.forEach(function (r, i) {
      var li = document.createElement("li");
      var esUltima = i === total - 1;
      if (esUltima) li.className = "ultima";
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tarjeta tono-" + "abc".charAt(i % 3);
      b.innerHTML =
        '<span class="marca" aria-hidden="true"></span>' +
        '<svg class="motivo" viewBox="0 0 48 48" aria-hidden="true">' + (MOTIVOS[r.motivo] || MOTIVOS.corazon) + "</svg>" +
        '<span class="num" aria-hidden="true">' + dos(i + 1) + "</span>" +
        (esUltima ? '<span class="etiqueta" aria-hidden="true">la última razón</span>' : "");
      if (!esUltima) b.appendChild(b.querySelector(".motivo"));
      b.addEventListener("click", function () { abrirVisor(i, b); });
      li.appendChild(b);
      ul.appendChild(li);
      tarjetas.push(b);
    });
    estado.descubiertas.forEach(function (i) { tarjetas[i].classList.add("descubierta"); });
    tarjetas.forEach(etiquetarTarjeta);
    actualizarProgreso(false);
  }
  function etiquetarTarjeta(b, i) {
    var hecha = estado.descubiertas.indexOf(i) >= 0;
    b.setAttribute("aria-label", "Razón " + (i + 1) + (hecha ? ": " + D.razones.lista[i].titulo : ", sin descubrir"));
  }

  function descubrir(i) {
    if (estado.descubiertas.indexOf(i) >= 0) return;
    estado.descubiertas.push(i);
    var b = tarjetas[i];
    b.classList.add("descubierta");
    if (!reducido) {
      b.classList.remove("girando");
      void b.offsetWidth;
      b.classList.add("girando");
    }
    etiquetarTarjeta(b, i);
    guardar();
    actualizarProgreso(true);
  }

  function actualizarProgreso(anunciar) {
    var n = estado.descubiertas.length;
    $("progreso-num").textContent = dos(n);
    $("progreso-relleno").style.width = (n / total * 100) + "%";
    $("progreso-barra").setAttribute("aria-valuenow", String(n));
    var txt = n === 0 ? "Ninguna descubierta todavía"
      : n === total ? "Las " + total + " descubiertas"
      : (n === 1 ? "1 descubierta" : n + " descubiertas") + " · faltan " + (total - n);
    $("progreso-texto").textContent = txt;
    var completo = n === total;
    $("mensaje-completo").hidden = !completo;
    if (completo && anunciar) {
      setTimeout(function () { lluviaPetalos(42); }, 400);
      $("btn-pastel").classList.add("pulso");
    }
  }

  /* ---------- Visor ---------- */
  var visorIndice = 0;
  var visorOrigen = null;

  function pintarVisor(i, animar) {
    var r = D.razones.lista[i];
    visorIndice = i;
    $("visor-numero").textContent = dos(i + 1);
    $("visor-motivo").innerHTML = MOTIVOS[r.motivo] || MOTIVOS.corazon;
    $("visor-titulo").textContent = r.titulo;
    $("visor-texto").textContent = r.texto;
    $("visor-pos").textContent = "Razón " + (i + 1) + " de " + total;
    if (animar && !reducido) {
      var t = $("visor-tarjeta");
      t.classList.remove("cambio");
      void t.offsetWidth;
      t.classList.add("cambio");
    }
    descubrir(i);
  }
  function abrirVisor(i, origen) {
    visorOrigen = origen || null;
    $("visor").hidden = false;
    pintarVisor(i, false);
    $("visor-tarjeta").focus();
    document.addEventListener("keydown", teclasVisor);
  }
  function cerrarVisor() {
    if ($("visor").hidden) return;
    $("visor").hidden = true;
    document.removeEventListener("keydown", teclasVisor);
    var destino = tarjetas[visorIndice] || visorOrigen;
    if (destino) {
      destino.focus({ preventScroll: true });
      destino.scrollIntoView({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
    }
  }
  function moverVisor(d) { pintarVisor((visorIndice + d + total) % total, true); }
  function teclasVisor(e) {
    if (e.key === "Escape") { e.preventDefault(); cerrarVisor(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); moverVisor(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); moverVisor(-1); }
    else if (e.key === "Tab") {
      var foc = Array.prototype.slice.call($("visor-tarjeta").querySelectorAll("button"));
      var idx = foc.indexOf(document.activeElement);
      if (e.shiftKey && idx <= 0) { e.preventDefault(); foc[foc.length - 1].focus(); }
      else if (!e.shiftKey && idx === foc.length - 1) { e.preventDefault(); foc[0].focus(); }
    }
  }
  // Deslizar a los lados dentro del visor
  (function () {
    var x0 = null, y0 = null;
    var t = $("visor-tarjeta");
    t.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    t.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) moverVisor(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  })();

  /* ---------- Escena 04: pastel ---------- */
  var llamas = [];
  function el(tag, attrs, padre) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(n);
    return n;
  }

  function construirPastel() {
    var svg = $("pastel");
    var defs = el("defs", {}, svg);
    var g1 = el("linearGradient", { id: "g-piso", x1: "0", x2: "1" }, defs);
    el("stop", { offset: "0", "stop-color": "#D98C9C" }, g1);
    el("stop", { offset: ".35", "stop-color": "#EBB6C1" }, g1);
    el("stop", { offset: "1", "stop-color": "#D7889A" }, g1);
    var g2 = el("linearGradient", { id: "g-crema", x1: "0", x2: "1" }, defs);
    el("stop", { offset: "0", "stop-color": "#E6DFD2" }, g2);
    el("stop", { offset: ".4", "stop-color": "#F7F3EA" }, g2);
    el("stop", { offset: "1", "stop-color": "#E3DACB" }, g2);
    var g3 = el("radialGradient", { id: "g-halo" }, defs);
    el("stop", { offset: "0", "stop-color": "#F6D58E", "stop-opacity": ".55" }, g3);
    el("stop", { offset: ".5", "stop-color": "#E7AAB7", "stop-opacity": ".25" }, g3);
    el("stop", { offset: "1", "stop-color": "#E7AAB7", "stop-opacity": "0" }, g3);
    var g4 = el("linearGradient", { id: "g-llama", x1: "0", y1: "1", x2: "0", y2: "0" }, defs);
    el("stop", { offset: "0", "stop-color": "#C62744" }, g4);
    el("stop", { offset: ".35", "stop-color": "#F4A24C" }, g4);
    el("stop", { offset: "1", "stop-color": "#FFF3C9" }, g4);

    // Resplandor general (aparece al encender)
    el("ellipse", { "class": "halo", id: "halo", cx: 160, cy: 110, rx: 150, ry: 110, fill: "url(#g-halo)" }, svg);

    // Plato
    el("ellipse", { cx: 160, cy: 268, rx: 138, ry: 17, fill: "#79113A", opacity: ".12" }, svg);
    el("ellipse", { cx: 160, cy: 262, rx: 134, ry: 17, fill: "#F6F4EE", stroke: "#E7AAB7", "stroke-width": 1.2 }, svg);

    // Piso inferior (rosa)
    el("path", { d: "M50 190 V258 A110 18 0 0 0 270 258 V190 Z", fill: "url(#g-piso)" }, svg);
    el("ellipse", { cx: 160, cy: 190, rx: 110, ry: 18, fill: "#EFC3CC" }, svg);
    // Cinta y perlas del piso inferior
    el("path", { d: "M50 236 A110 18 0 0 0 270 236", fill: "none", stroke: "#C62744", "stroke-width": 2, opacity: ".55" }, svg);
    for (var p = 0; p <= 22; p++) {
      var a = Math.PI * p / 22;
      el("circle", { cx: 160 - 110 * Math.cos(a), cy: 258 + 18 * Math.sin(a), r: 3.2, fill: "#F6F4EE" }, svg);
    }
    // Rosetas
    [[104, 222], [160, 228], [216, 222]].forEach(function (c, k) {
      var g = el("g", { transform: "translate(" + c[0] + " " + c[1] + ")" }, svg);
      for (var j = 0; j < 5; j++) {
        el("ellipse", { cx: 0, cy: -5, rx: 3.6, ry: 5.5, fill: k === 1 ? "#C62744" : "#79113A", opacity: ".85", transform: "rotate(" + (j * 72) + ")" }, g);
      }
      el("circle", { cx: 0, cy: 0, r: 2.6, fill: "#F6F4EE" }, g);
      el("path", { d: "M7 4c6 0 10 3 12 7-6 0-10-2-12-7z", fill: "#B2667A", opacity: ".6" }, g);
      el("path", { d: "M-7 4c-6 0-10 3-12 7 6 0 10-2 12-7z", fill: "#B2667A", opacity: ".6" }, g);
    });

    // Piso superior (crema) con glaseado rosa que gotea
    el("path", { d: "M82 122 V184 A78 13 0 0 0 238 184 V122 Z", fill: "url(#g-crema)" }, svg);
    var goteo = "M82 122 V138";
    var xs = [82, 94, 104, 118, 130, 144, 158, 172, 186, 198, 212, 226, 238];
    for (var d = 1; d < xs.length; d++) {
      var x = xs[d], xm = (xs[d - 1] + x) / 2;
      var fondo = 138 + (d % 3 === 0 ? 14 : d % 2 ? 4 : 9);
      var curva = 13 * Math.sin(Math.PI * (x - 82) / 156);
      goteo += " Q" + xm + " " + (fondo + curva) + " " + x + " " + (136 + curva * .9);
    }
    goteo += " V122 Z";
    el("path", { d: goteo, fill: "#E7AAB7" }, svg);
    el("ellipse", { cx: 160, cy: 122, rx: 78, ry: 13, fill: "#EDBBC5" }, svg);
    el("ellipse", { cx: 160, cy: 122, rx: 78, ry: 13, fill: "none", stroke: "#DB8192", "stroke-width": 1 }, svg);
    // Perlas superiores
    for (var q = 0; q <= 16; q++) {
      var b2 = Math.PI * q / 16;
      el("circle", { cx: 160 - 78 * Math.cos(b2), cy: 184 + 13 * Math.sin(b2), r: 2.4, fill: "#DB8192" }, svg);
    }

    // 29 velas: anillo exterior (17), interior (11) y una central
    var pos = [];
    function anillo(n, rx, ry, desfase) {
      for (var i = 0; i < n; i++) {
        var ang = desfase + 2 * Math.PI * i / n;
        pos.push({ x: 160 + rx * Math.cos(ang), y: 122 + ry * Math.sin(ang), ang: ang });
      }
    }
    anillo(17, 64, 9.5, Math.PI);
    anillo(11, 34, 5, Math.PI + .3);
    pos.push({ x: 160, y: 122, ang: 0 });
    var orden = pos.map(function (v, i) { v.i = i; return v; });
    var dibujo = orden.slice().sort(function (a, b) { return a.y - b.y; });
    var colores = ["#C62744", "#F6F4EE", "#DB8192"];
    var porIndice = [];
    dibujo.forEach(function (v) {
      var g = el("g", {}, svg);
      var alto = 24;
      el("rect", { x: v.x - 2.1, y: v.y - alto, width: 4.2, height: alto, rx: 1.2, fill: colores[v.i % 3], stroke: "#79113A", "stroke-opacity": ".25", "stroke-width": .5 }, g);
      el("line", { x1: v.x, y1: v.y - alto, x2: v.x, y2: v.y - alto - 3, stroke: "#3E0A20", "stroke-width": .8, "stroke-linecap": "round" }, g);
      var ll = el("g", { "class": "llama" }, g);
      el("circle", { cx: v.x, cy: v.y - alto - 7, r: 6, fill: "#F6D58E", opacity: ".35" }, ll);
      el("path", {
        "class": "llama-forma",
        d: "M" + v.x + " " + (v.y - alto - 2.5) + " c-2.6 0 -3.4 -2.6 -2.2 -4.8 c0.9 -1.7 2.2 -3 2.2 -5.4 c1.6 1.6 3.4 3.6 3.2 6 c-0.1 2.3 -1.2 4.2 -3.2 4.2 z",
        fill: "url(#g-llama)"
      }, ll);
      porIndice[v.i] = ll;
    });
    llamas = porIndice;
  }

  var encendiendo = false;
  function encenderVelas() {
    if (encendiendo || estado.velas) return;
    encendiendo = true;
    $("btn-velas").disabled = true;
    Musica.campanita && Musica.campanita();
    llamas.forEach(function (ll, i) {
      setTimeout(function () { ll.classList.add("encendida"); }, esperar(400 + i * 85));
    });
    setTimeout(function () { $("halo").classList.add("encendido"); }, esperar(600));
    setTimeout(function () {
      encendiendo = false;
      estado.velas = true;
      guardar();
      mostrarDeseo(true);
    }, esperar(400 + llamas.length * 85 + 300));
  }
  function mostrarDeseo(celebrar) {
    var m = $("mensaje-deseo");
    m.textContent = D.pastel.mensaje;
    m.classList.add("visible");
    $("btn-velas").hidden = true;
    $("btn-final").hidden = false;
    if (celebrar) {
      lluviaPetalos(46);
      $("btn-final").focus({ preventScroll: true });
    }
  }
  function velasYaEncendidas() {
    llamas.forEach(function (ll) { ll.classList.add("encendida"); });
    $("halo").classList.add("encendido");
    mostrarDeseo(false);
  }

  /* ---------- Partículas ---------- */
  function lluviaPetalos(n) {
    if (reducido) return;
    var capa = $("particulas");
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      s.className = "petalo";
      s.style.left = (Math.random() * 100) + "%";
      s.style.background = COLORES[i % COLORES.length];
      s.style.animationDelay = (Math.random() * 1.4) + "s";
      s.style.setProperty("--dur", (3.4 + Math.random() * 2.6) + "s");
      s.style.setProperty("--dx", (Math.random() * 140 - 70) + "px");
      s.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      s.style.transform = "scale(" + (0.6 + Math.random() * 0.7) + ")";
      capa.appendChild(s);
      s.addEventListener("animationend", function () { this.remove(); });
    }
  }

  var corazonesT = null;
  var corazonesFin = 0;
  function unCorazon() {
    var capa = $("particulas");
    var c = document.createElement("span");
    c.className = "corazon";
    c.innerHTML = CORAZON_SVG;
    c.style.left = (5 + Math.random() * 90) + "%";
    c.style.color = COLORES[1 + Math.floor(Math.random() * 3)];
    c.style.setProperty("--t", (12 + Math.random() * 14) + "px");
    c.style.setProperty("--dur", (7 + Math.random() * 5) + "s");
    c.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
    capa.appendChild(c);
    c.addEventListener("animationend", function () { c.remove(); });
  }
  function iniciarCorazones() {
    if (reducido) return;
    detenerCorazones();
    corazonesFin = Date.now() + 16000;
    var ritmo = function () {
      if (Date.now() > corazonesFin) { corazonesT = null; return; }
      unCorazon();
      corazonesT = setTimeout(ritmo, 650 + Math.random() * 600);
    };
    corazonesT = setTimeout(ritmo, 1800);
  }
  function detenerCorazones() {
    clearTimeout(corazonesT);
    corazonesT = null;
  }

  /* ---------- Música ---------- */
  function alternarMusica() {
    var b = $("btn-musica");
    var antes = Musica.estaSonando();
    var sonando = !!Musica.alternar();
    if (!antes && !sonando) {
      avisar("Este navegador no permite reproducir la música");
      return;
    }
    b.setAttribute("aria-pressed", sonando ? "true" : "false");
    b.setAttribute("aria-label", sonando ? "Silenciar música" : "Reproducir música");
    avisar(sonando ? "Música activada" : "Música en pausa");
  }

  /* ---------- Arranque ---------- */
  function iniciar() {
    cargar();
    poblarTextos();
    construirPuntos();
    construirTarjetas();
    construirPastel();
    if (estado.velas) velasYaEncendidas();

    $("sobre").addEventListener("click", abrirSobre);
    $("btn-abrir").addEventListener("click", abrirSobre);
    $("btn-volver").addEventListener("click", function () { irA(estado.actual - 1); });
    $("btn-musica").addEventListener("click", alternarMusica);
    $("btn-velas").addEventListener("click", encenderVelas);
    $("btn-reiniciar").addEventListener("click", function () { irA(0); });
    $("carta").addEventListener("click", function () { escenas[1].classList.add("sin-espera"); });
    $("carta-final").addEventListener("click", function () { escenas[4].classList.add("sin-espera"); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-ir]"), function (b) {
      b.addEventListener("click", function () { irA(parseInt(b.getAttribute("data-ir"), 10)); });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-cerrar]"), function (b) {
      b.addEventListener("click", cerrarVisor);
    });
    $("visor-prev").addEventListener("click", function () { moverVisor(-1); });
    $("visor-next").addEventListener("click", function () { moverVisor(1); });

    escenas[0].classList.add("mostrada");
    // Enlace directo a una escena (#parte-1 … #parte-5), útil para revisar o capturar.
    var m = /^#parte-([1-5])$/.exec(location.hash);
    if (m && m[1] !== "1") {
      var destino = parseInt(m[1], 10) - 1;
      estado.maxVisitada = Math.max(estado.maxVisitada, destino);
      reducido = true;
      irA(destino);
      setTimeout(function () { reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }, 200);
    }
    // Para pruebas automatizadas y depuración
    window.__experiencia = { irA: irA, estado: estado };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
