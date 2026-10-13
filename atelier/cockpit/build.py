#!/usr/bin/env python3
"""Assemble le cockpit en deux versions :
- dist/apercu.html : la page publiée en aperçu (polices intégrées, bibliothèques d'export depuis cdnjs) ;
- dist/site/cockpit.html : la page du site cockpit-buraliste.fr (polices et bibliothèques servies par le site).
Plus dist/test.html (aperçu enveloppé comme à la publication) pour les essais locaux."""
import base64, json, os, re, sys

ICI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ICI, 'src')
SITE = os.environ.get('SITE_COCKPIT') or os.path.abspath(os.path.join(ICI, '..', '..'))
POL = os.path.join(SITE, 'polices')
DIST = os.path.join(ICI, 'dist')
os.makedirs(os.path.join(DIST, 'site'), exist_ok=True)

TITRE = 'Cockpit Buraliste version test'
POLICES = [
    ('Inter', 'inter-latin-opsz-normal.woff2', '100 900', 'normal'),
    ('Instrument Serif', 'instrument-serif-latin-400-normal.woff2', '400', 'normal'),
    ('Instrument Serif', 'instrument-serif-latin-400-italic.woff2', '400', 'italic'),
    ('IBM Plex Mono', 'ibm-plex-mono-latin-400-normal.woff2', '400', 'normal'),
    ('IBM Plex Mono', 'ibm-plex-mono-latin-600-normal.woff2', '600', 'normal'),
]

def lire(nom):
    return open(os.path.join(SRC, nom), encoding='utf-8').read()

def font_faces(integrees):
    out = []
    for fam, fic, poids, style in POLICES:
        if integrees:
            b64 = base64.b64encode(open(os.path.join(POL, fic), 'rb').read()).decode()
            src = 'url(data:font/woff2;base64,' + b64 + ') format("woff2")'
        else:
            src = 'url(polices/' + fic + ') format("woff2")'
        out.append('@font-face{font-family:"%s";src:%s;font-weight:%s;font-style:%s;font-display:swap}' % (fam, src, poids, style))
    return '\n'.join(out)

css = lire('style.css')
js = '\n'.join(lire(n) for n in ['a_noyau.js', 'b_vues.js', 'c_app.js', 'd_export.js'])
js += "\nconst H0 = location.hash.slice(1);\nif (ROUTE[H0]) ETAT.route = H0;\nafficher();\n"
corps = lire('corps.html')
donnees = open(os.path.join(ICI, 'data.json'), encoding='utf-8').read()
assert '</script' not in donnees
script_donnees = '<script type="application/json" id="donnees">' + donnees + '</script>'
script_app = '<script>\n(function () {\n' + js + '\n})();\n</script>'

# ---- aperçu (Artifact) : <title> et <style> en tête, pas de squelette
apercu = '<title>' + TITRE + '</title>\n<style>\n' + css.replace('/*POLICES*/', font_faces(True)) + '\n</style>\n' + corps + script_donnees + '\n' + script_app + '\n'
open(os.path.join(DIST, 'apercu.html'), 'w', encoding='utf-8').write(apercu)

# ---- version de test locale : squelette identique à la publication
squelette = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
             '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>'
             '</head><body>' + apercu + '</body></html>')
open(os.path.join(DIST, 'test.html'), 'w', encoding='utf-8').write(squelette)

# ---- version du site : liens internes, sans nouvel onglet
js_site = js
for avant, apres in [
    ('<a class="marque" href="https://cockpit-buraliste.fr" target="_blank" rel="noopener">', '<a class="marque" href="./" aria-label="Retour au site Cockpit Buraliste">'),
    ('<a class="cx-lien" href="https://cockpit-buraliste.fr/#demo" target="_blank" rel="noopener">', '<a class="cx-lien" href="./#demo">'),
    ('<a href="https://cockpit-buraliste.fr" target="_blank" rel="noopener">cockpit-buraliste.fr</a>', '<a href="./">cockpit-buraliste.fr</a>'),
]:
    assert js_site.count(avant) == 1, avant
    js_site = js_site.replace(avant, apres)
script_site = '<script>\n(function () {\n' + js_site + '\n})();\n</script>'
libs = "<script>window.COCKPIT_LIBS={exceljs:'js/exceljs.min.js',jspdf:'js/jspdf.umd.min.js',autotable:'js/jspdf.plugin.autotable.min.js'};</script>"
site = ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<meta name="robots" content="noindex">\n<meta name="theme-color" content="#0d1830">\n<title>Cockpit Buraliste · espace buraliste</title>\n'
        '<meta name="description" content="Espace buraliste de Cockpit Buraliste : compte de démonstration du tabac Le Balto, données d’exemple.">\n'
        '<link rel="icon" href="favicon.svg" type="image/svg+xml">\n<link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">\n<link rel="apple-touch-icon" href="apple-touch-icon.png">\n'
        '<style>\n:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}\n'
        + css.replace('/*POLICES*/', font_faces(False)) + '\n</style>\n</head>\n<body>\n' + corps + script_donnees + '\n' + libs + '\n' + script_site + '\n</body>\n</html>\n')
open(os.path.join(DIST, 'site', 'cockpit.html'), 'w', encoding='utf-8').write(site)
if os.path.exists(os.path.join(SITE, 'index.html')):
    open(os.path.join(SITE, 'cockpit.html'), 'w', encoding='utf-8').write(site)

print('apercu.html', len(apercu) // 1024, 'Ko · site/cockpit.html', len(site) // 1024, 'Ko')
