"""
Empaqueta la experiencia para compartir.

Genera en dist/ (nunca sobrescribe: cada salida lleva fecha y hora):
  - 29_razones_nathaly_<fecha>.html  -> un solo archivo con CSS y JS incrustados.
  - 29_razones_nathaly_<fecha>.zip   -> el sitio estático completo (index.html, css, js, img).
Con --artifact RUTA escribe además la variante para publicar como Artifact de claude.ai.

Uso:  python construir.py [--artifact RUTA]
"""
import re
import sys
import zipfile
import datetime
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
DIST = RAIZ / "dist"
SITIO = ["index.html", "css/estilos.css", "js/datos.js", "js/musica.js", "js/app.js", "img/favicon.svg", "README.md"]


def leer(rel):
    return (RAIZ / rel).read_text(encoding="utf-8")


def piezas():
    html = leer("index.html")
    cuerpo = re.search(r"<!--CUERPO-->(.*?)<!--/CUERPO-->", html, re.S).group(1)
    fuentes = re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]+>', html).group(0)
    css = leer("css/estilos.css")
    js = "\n".join(leer(f"js/{n}.js") for n in ("datos", "musica", "app"))
    return html, cuerpo, fuentes, css, js


def un_archivo():
    html, _, _, css, js = piezas()
    html = html.replace('<link rel="stylesheet" href="css/estilos.css">', "<style>\n" + css + "\n</style>")
    favicon = leer("img/favicon.svg").strip().replace('"', "'").replace("#", "%23")
    html = html.replace('href="img/favicon.svg"', 'href="data:image/svg+xml,' + favicon + '"')
    html = re.sub(r'<script src="js/datos\.js"></script>\s*<script src="js/musica\.js"></script>\s*<script src="js/app\.js"></script>',
                  lambda m: "<script>\n" + js + "\n</script>", html)
    return html


def artifact():
    _, cuerpo, fuentes, css, js = piezas()
    return (
        "<title>29 razones para celebrar tu vida</title>\n"
        '<meta name="claude:viewport-fit-sides" content="cover">\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        + fuentes + "\n<style>\n" + css + "\n</style>\n" + cuerpo + "\n<script>\n" + js + "\n</script>\n"
    )


def nuevo(ruta):
    if ruta.exists():
        raise SystemExit(f"Ya existe {ruta}; no se sobrescribe.")
    return ruta


def main():
    sello = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    DIST.mkdir(exist_ok=True)
    unico = nuevo(DIST / f"29_razones_nathaly_{sello}.html")
    unico.write_text(un_archivo(), encoding="utf-8")
    zp = nuevo(DIST / f"29_razones_nathaly_{sello}.zip")
    with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
        for rel in SITIO:
            z.write(RAIZ / rel, f"29_razones_nathaly/{rel}")
        for png in sorted((RAIZ / "capturas").glob("*.png")):
            z.write(png, f"29_razones_nathaly/capturas/{png.name}")
        if (RAIZ / "INFORME_PRUEBAS.md").exists():
            z.write(RAIZ / "INFORME_PRUEBAS.md", "29_razones_nathaly/INFORME_PRUEBAS.md")
    print("Archivo único:", unico)
    print("ZIP:", zp)
    if "--artifact" in sys.argv:
        destino = Path(sys.argv[sys.argv.index("--artifact") + 1])
        destino.write_text(artifact(), encoding="utf-8")
        print("Artifact:", destino)


if __name__ == "__main__":
    main()
