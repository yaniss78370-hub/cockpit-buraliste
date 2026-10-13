#!/usr/bin/env python3
"""Essai local du cockpit : erreurs de console, navigation, interactions, exports, captures."""
import base64, json, os, sys
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
import tempfile
S = os.environ.get('ESSAI_SORTIE') or os.path.join(tempfile.gettempdir(), 'essai-cockpit')
os.makedirs(S, exist_ok=True)
JS = os.path.abspath(os.path.join(ICI, '..', '..', 'js'))
OUT = os.path.join(S, 'captures')
os.makedirs(OUT, exist_ok=True)
LIBS = {
    'exceljs.min.js': os.path.join(JS, 'exceljs.min.js'),
    'jspdf.umd.min.js': os.path.join(JS, 'jspdf.umd.min.js'),
    'jspdf.plugin.autotable.min.js': os.path.join(JS, 'jspdf.plugin.autotable.min.js'),
}
URL = 'file://' + os.path.join(ICI, 'dist', 'test.html')
ROUTES = ['cockpit', 'tresorerie', 'caisse', 'factures', 'stock', 'rentabilite', 'mise']
MODE = sys.argv[1] if len(sys.argv) > 1 else 'tout'
erreurs = []

def route_cdn(route):
    nom = route.request.url.rsplit('/', 1)[-1]
    if nom in LIBS:
        route.fulfill(path=LIBS[nom], content_type='application/javascript')
    else:
        route.abort()

def page_neuve(b, w, h, sombre=False, mobile=False):
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1 if not mobile else 2,
                        color_scheme='dark' if sombre else 'light', is_mobile=mobile, has_touch=mobile, accept_downloads=True)
    p = ctx.new_page()
    p.route('https://cdnjs.cloudflare.com/**', route_cdn)
    p.on('console', lambda m: erreurs.append(('console', m.type, m.text)) if m.type in ('error', 'warning') else None)
    p.on('pageerror', lambda e: erreurs.append(('pageerror', str(e))))
    return ctx, p

with sync_playwright() as pw:
    b = pw.chromium.launch()
    # ---------------- bureau, clair
    ctx, p = page_neuve(b, 1440, 900)
    p.goto(URL)
    p.wait_for_timeout(400)
    p.screenshot(path=os.path.join(OUT, 'b-connexion.png'))
    p.click('#cx-entrer')
    p.wait_for_timeout(1000)
    for r in ROUTES:
        p.evaluate("r => { location.hash = r; }", r)
        p.wait_for_timeout(250)
        p.screenshot(path=os.path.join(OUT, 'b-' + r + '.png'), full_page=(MODE == 'plein'))
        if MODE == 'plein':
            pass
    # onglets de la trésorerie (dans le détail)
    p.evaluate("() => { location.hash = 'tresorerie'; }")
    p.wait_for_timeout(200)
    p.click('[data-action="detail"]')
    p.wait_for_timeout(300)
    p.screenshot(path=os.path.join(OUT, 'b-treso-detail.png'))
    for o in ['plan', 'quatorze', 'mouvements', 'fixes']:
        p.click('[data-seg="treso"][data-val="' + o + '"]')
        p.wait_for_timeout(200)
        p.screenshot(path=os.path.join(OUT, 'b-treso-' + o + '.png'), full_page=True)
    # plan : agencement
    p.click('[data-seg="treso"][data-val="plan"]')
    p.click('[data-levier="agencement"]')
    p.wait_for_timeout(200)
    p.screenshot(path=os.path.join(OUT, 'b-plan-agencement.png'), full_page=True)
    ciel = p.inner_text('.barre .ciel')
    p.click('[data-action="plan-defaut"]')
    # mouvement : tiroir
    p.click('[data-seg="treso"][data-val="mouvements"]')
    p.fill('#q-mvt', 'logista')
    p.wait_for_timeout(200)
    nb_logista = p.locator('#zone-mvt tbody tr').count()
    p.locator('#zone-mvt tbody tr').first.click()
    p.wait_for_timeout(200)
    p.screenshot(path=os.path.join(OUT, 'b-tiroir-mouvement.png'))
    p.keyboard.press('Escape')
    # recherche
    p.fill('#recherche', 'coca')
    p.wait_for_timeout(200)
    nres = p.locator('#resultats [data-res]').count()
    p.screenshot(path=os.path.join(OUT, 'b-recherche.png'))
    p.keyboard.press('Enter')
    p.wait_for_timeout(300)
    route_apres = p.evaluate('location.hash')
    # stock : onglets
    p.evaluate("() => { location.hash = 'stock'; }")
    p.wait_for_timeout(200)
    if p.locator('[data-action="detail"][aria-expanded="false"]').count():
        p.click('[data-action="detail"]'); p.wait_for_timeout(200)
    for o in ['cbd', 'ecarts', 'commande']:
        p.click('[data-seg="stockonglet"][data-val="' + o + '"]')
        p.wait_for_timeout(150)
        p.screenshot(path=os.path.join(OUT, 'b-stock-' + o + '.png'), full_page=True)
    # rentabilité : année
    p.evaluate("() => { location.hash = 'rentabilite'; }")
    p.wait_for_timeout(200)
    p.click('[data-action="detail"]'); p.wait_for_timeout(200)
    p.click('[data-seg="resvue"][data-val="annee"]')
    p.wait_for_timeout(150)
    p.screenshot(path=os.path.join(OUT, 'b-rentabilite-annee.png'), full_page=True)
    # caisse : jour précédent et semaine FDJ
    p.evaluate("() => { location.hash = 'caisse'; }")
    p.wait_for_timeout(200)
    p.screenshot(path=os.path.join(OUT, 'b-caisse-plein.png'), full_page=True)
    # menu exporter
    p.click('.barre [data-action="menu-export"]')
    p.wait_for_timeout(150)
    p.screenshot(path=os.path.join(OUT, 'b-menu-export.png'))
    p.keyboard.press('Escape')
    # exports : fichiers réels
    res = {}
    for cle in ['classeur', 'factures', 'resultat']:
        b64 = p.evaluate("""async (cle) => { const blob = await window.__cockpitTest.construireClasseur(cle); const buf = new Uint8Array(await blob.arrayBuffer()); let s=''; for (let i=0;i<buf.length;i++) s+=String.fromCharCode(buf[i]); return btoa(s); }""", cle)
        fic = os.path.join(S, 'export-' + cle + '.xlsx')
        open(fic, 'wb').write(base64.b64decode(b64))
        res[cle] = os.path.getsize(fic)
    b64 = p.evaluate("""async () => { const blob = await window.__cockpitTest.construirePack(); const buf = new Uint8Array(await blob.arrayBuffer()); let s=''; for (let i=0;i<buf.length;i++) s+=String.fromCharCode(buf[i]); return btoa(s); }""")
    open(os.path.join(S, 'pack.pdf'), 'wb').write(base64.b64decode(b64))
    csv = p.evaluate("() => window.__cockpitTest.versCSV('mouvements')")
    open(os.path.join(S, 'mouvements.csv'), 'w', encoding='utf-8').write(csv)
    # export par le bouton (site : téléchargement classique)
    p.evaluate("() => { location.hash = 'tresorerie'; }")
    p.wait_for_timeout(150)
    p.click('[data-seg="treso"][data-val="semaine"]')
    with p.expect_download() as dl:
        p.click('[data-action="export"][data-cle="semaine"][data-format="csv"]')
    telecharge = dl.value.suggested_filename
    ctx.close()

    # ---------------- bureau, sombre
    ctx, p = page_neuve(b, 1440, 900, sombre=True)
    p.goto(URL)
    p.click('#cx-entrer')
    p.wait_for_timeout(900)
    for r in ['cockpit', 'tresorerie', 'factures']:
        p.evaluate("r => { location.hash = r; }", r)
        p.wait_for_timeout(200)
        p.screenshot(path=os.path.join(OUT, 's-' + r + '.png'))
    ctx.close()

    # ---------------- portable 1180 et tablette 900
    for w, h, nom in [(1180, 820, 'l'), (900, 1000, 't')]:
        ctx, p = page_neuve(b, w, h)
        p.goto(URL)
        p.click('#cx-entrer')
        p.wait_for_timeout(900)
        p.screenshot(path=os.path.join(OUT, nom + '-cockpit.png'))
        p.evaluate("() => { location.hash = 'factures'; }")
        p.wait_for_timeout(200)
        p.screenshot(path=os.path.join(OUT, nom + '-factures.png'))
        ctx.close()

    # ---------------- téléphone
    ctx, p = page_neuve(b, 390, 844, mobile=True)
    p.goto(URL)
    p.wait_for_timeout(300)
    p.screenshot(path=os.path.join(OUT, 'm-connexion.png'))
    p.click('#cx-entrer')
    p.wait_for_timeout(900)
    for r in ROUTES:
        p.evaluate("r => { location.hash = r; }", r)
        p.wait_for_timeout(250)
        p.screenshot(path=os.path.join(OUT, 'm-' + r + '.png'))
        p.screenshot(path=os.path.join(OUT, 'm-' + r + '-plein.png'), full_page=True)
    largeur = p.evaluate('document.documentElement.scrollWidth')
    p.click('[data-action="plus"]')
    p.wait_for_timeout(200)
    p.screenshot(path=os.path.join(OUT, 'm-plus.png'))
    p.keyboard.press('Escape')
    p.evaluate("() => { location.hash = 'factures'; }")
    p.wait_for_timeout(200)
    p.locator('.visuel-simple .ligne.cliquable').nth(2).click()
    p.wait_for_timeout(250)
    p.screenshot(path=os.path.join(OUT, 'm-facture-tiroir.png'))
    ctx.close()
    b.close()

print(json.dumps({'erreurs': erreurs[:30], 'nb_erreurs': len(erreurs), 'ciel_agencement': ciel, 'mouvements_logista': nb_logista,
                  'resultats_coca': nres, 'route_apres_recherche': route_apres, 'xlsx': res, 'telecharge': telecharge,
                  'largeur_mobile': largeur}, ensure_ascii=False, indent=1))
