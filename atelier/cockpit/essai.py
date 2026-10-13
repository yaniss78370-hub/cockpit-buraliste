#!/usr/bin/env python3
"""Essai local du cockpit : erreurs de console, navigation, interactions, exports, captures."""
import base64, json, os, sys, tempfile
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
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
URL = 'file://' + os.path.join(ICI, 'dist', 'test.html') + '?sans-visite'   # la visite guidée a ses propres essais
ROUTES = ['cockpit', 'caisse', 'fdj', 'tresorerie', 'rentabilite', 'factures', 'stock', 'mise']
erreurs = []

def route_cdn(route):
    nom = route.request.url.rsplit('/', 1)[-1]
    if nom in LIBS:
        route.fulfill(path=LIBS[nom], content_type='application/javascript')
    else:
        route.abort()

def page_neuve(b, w, h, sombre=False, mobile=False, bouger=False):
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1 if not mobile else 2,
                        color_scheme='dark' if sombre else 'light', is_mobile=mobile, has_touch=mobile, accept_downloads=True,
                        reduced_motion='no-preference' if bouger else 'reduce')
    p = ctx.new_page()
    p.route('https://cdnjs.cloudflare.com/**', route_cdn)
    p.on('console', lambda m: erreurs.append(('console', m.type, m.text)) if m.type in ('error', 'warning') else None)
    p.on('pageerror', lambda e: erreurs.append(('pageerror', str(e))))
    return ctx, p

def aller(p, r, attente=300):
    p.evaluate("r => { location.hash = r; }", r)
    p.wait_for_timeout(attente)

with sync_playwright() as pw:
    b = pw.chromium.launch()
    # ---------------- animations (sans mouvement réduit) : aucune erreur, chiffres justes à la fin
    ctx, p = page_neuve(b, 1440, 900, bouger=True)
    p.goto(URL)
    p.wait_for_timeout(300)
    p.click('#cx-entrer')
    p.wait_for_timeout(700)
    p.screenshot(path=os.path.join(OUT, 'anim-1.png'))
    p.wait_for_timeout(2600)
    heros_final = p.inner_text('.heros .chiffre-xl')
    p.screenshot(path=os.path.join(OUT, 'anim-2.png'))
    for r in ROUTES[1:]:
        aller(p, r, 2800)
    ctx.close()

    # ---------------- bureau, clair
    ctx, p = page_neuve(b, 1440, 900)
    p.goto(URL)
    p.wait_for_timeout(300)
    p.screenshot(path=os.path.join(OUT, 'b-connexion.png'))
    p.click('#cx-entrer')
    p.wait_for_timeout(900)
    for r in ROUTES:
        aller(p, r, 350)
        p.screenshot(path=os.path.join(OUT, 'b-' + r + '.png'))
        p.screenshot(path=os.path.join(OUT, 'b-' + r + '-plein.png'), full_page=True)
    largeurs_bureau = {}
    for r in ROUTES:
        aller(p, r, 200)
        largeurs_bureau[r] = p.evaluate('document.documentElement.scrollWidth')
    # caisse : comptage
    aller(p, 'caisse')
    a_avoir = p.inner_text('.heros .chiffre-xl')
    p.fill('#compte-caisse', '5 000')
    p.wait_for_timeout(100)
    msg_manque = p.inner_text('#compte-res')
    p.fill('#compte-caisse', a_avoir.replace('€', '').strip())
    p.wait_for_timeout(100)
    msg_juste = p.inner_text('#compte-res')
    p.click('[data-action="detail"]')
    p.wait_for_timeout(300)
    p.click('[data-action="jour"][data-pas="-1"]')
    p.wait_for_timeout(250)
    jour_z = p.inner_text('.jour-nav b')
    p.screenshot(path=os.path.join(OUT, 'b-caisse-detail.png'), full_page=True)
    # FDJ
    aller(p, 'fdj')
    fdj_prochain = p.inner_text('.heros .chiffre-xl')
    fdj_atterrissage = p.inner_text('#fdj-semaine .rep-montant')
    p.click('[data-action="fdj-jour"][data-jour="2026-10-12"]')
    p.wait_for_timeout(150)
    fdj_jour = p.inner_text('#fdj-semaine .sem-droite .h3')
    p.click('[data-action="fdj-sem"][data-pas="-1"]')
    p.wait_for_timeout(150)
    fdj_sem_prec = p.inner_text('#fdj-semaine .sem-titre')
    fdj_calc_prec = p.inner_text('#fdj-semaine .calc')
    p.click('tr[data-action="fdj-semaine"]:nth-child(3)')
    p.wait_for_timeout(250)
    fdj_sem_ligne = p.inner_text('#fdj-semaine .sem-titre')
    p.click('[data-action="fdj-ops"]')
    p.wait_for_timeout(150)
    nb_ops = p.locator('.explication tbody tr').count()
    p.click('[data-action="detail"]')
    p.wait_for_timeout(300)
    p.screenshot(path=os.path.join(OUT, 'b-fdj-detail.png'), full_page=True)
    # trésorerie : plan de vol (commandes) puis détail
    aller(p, 'tresorerie')
    p.click('[data-levier="agencement"] .bascule')
    p.wait_for_timeout(700)
    ciel = p.inner_text('#plan-ciel')
    kpis_plan = p.inner_text('#plan-kpis')
    p.screenshot(path=os.path.join(OUT, 'b-plan-agencement.png'), full_page=True)
    # les dates et les montants : prêt, mois des travaux, aide, un mouvement à soi, la lecture à une date
    p.click('[data-plan="agencementPret"][data-v="true"]'); p.wait_for_timeout(300)
    p.click('[data-plan="agencementMois"][data-v="3"]'); p.wait_for_timeout(300)
    plan_pret = p.inner_text('#plan-kpis')
    p.click('[data-action="plan-ajout"]'); p.wait_for_timeout(200)
    p.fill('#mp-lib', 'Vitrine réfrigérée'); p.fill('#mp-montant', '4 800')
    p.click('[data-pf="mois"][data-v="2"]'); p.click('#form-plan-mvt button[type="submit"]'); p.wait_for_timeout(400)
    plan_mvts = p.locator('.mp-l').count()
    plan_evts = p.locator('#plan-graphe .evts li').count()
    d = p.locator('#plan-date'); d.focus()
    for _ in range(4): p.keyboard.press('ArrowLeft')
    p.wait_for_timeout(200)
    plan_lecture = p.inner_text('#plan-kpis .lecture-k')
    # un scénario d'un clic, puis la lecture en touchant la courbe
    p.click('[data-action="plan-scenario"][data-id="investir"]'); p.wait_for_timeout(900)
    plan_investir = p.inner_text('#plan-kpis')
    plan_effet = p.inner_text('.lv-reglage:has([data-plan="agencementPret"])')
    p.locator('#plan-graphe .cible[data-i="4"]').click(force=True); p.wait_for_timeout(300)
    plan_toucher = p.inner_text('#plan-kpis .lecture-k')
    p.click('[data-action="plan-defaut"]')
    p.wait_for_timeout(700)
    ciel_defaut = p.inner_text('#plan-ciel')
    p.click('[data-action="detail"]')
    p.wait_for_timeout(300)
    for o in ['plan', 'quatorze', 'mouvements', 'fixes']:
        p.click('[data-seg="treso"][data-val="' + o + '"]')
        p.wait_for_timeout(250)
        p.screenshot(path=os.path.join(OUT, 'b-treso-' + o + '.png'), full_page=True)
    p.click('[data-seg="treso"][data-val="mouvements"]')
    p.fill('#q-mvt', 'logista')
    p.wait_for_timeout(200)
    nb_logista = p.locator('#zone-mvt tbody tr').count()
    p.locator('#zone-mvt tbody tr').first.click()
    p.wait_for_timeout(300)
    p.screenshot(path=os.path.join(OUT, 'b-tiroir-mouvement.png'))
    p.keyboard.press('Escape')
    # export par le bouton de la semaine
    with p.expect_download() as dl:
        p.click('[data-action="export"][data-cle="semaine"][data-format="csv"]')
    telecharge = dl.value.suggested_filename
    # palette de recherche
    p.click('.tete .chercher')
    p.wait_for_timeout(200)
    p.fill('#pal-q', 'coca')
    p.wait_for_timeout(200)
    nres = p.locator('.pal-item').count()
    p.screenshot(path=os.path.join(OUT, 'b-palette.png'))
    p.keyboard.press('Enter')
    p.wait_for_timeout(500)
    route_apres = p.evaluate('location.hash')
    p.screenshot(path=os.path.join(OUT, 'b-facture-ouverte.png'))
    # notifications, sources, assistant
    p.click('.tete [data-action="notifs"]')
    p.wait_for_timeout(250)
    nb_notifs = p.locator('.notif').count()
    p.screenshot(path=os.path.join(OUT, 'b-notifs.png'))
    p.keyboard.press('Escape')
    p.click('.tete [data-action="sources"]')
    p.wait_for_timeout(250)
    p.screenshot(path=os.path.join(OUT, 'b-sources.png'))
    p.keyboard.press('Escape')
    p.click('.tete [data-action="assistant"]')
    p.wait_for_timeout(250)
    reponses = {}
    for q in ['Combien on a fait aujourd’hui ?', 'Il reste combien de Fraise glacée ?', 'Le FDJ est juste cette semaine ?', 'Qui a appelé ce soir ?', 'Combien je vire à la FDJ ?', 'quel temps fait-il demain ?']:
        p.fill('#as-q', q)
        p.keyboard.press('Enter')
        p.wait_for_timeout(200)
        reponses[q] = p.locator('.bulle.lui').last.inner_text()
    p.screenshot(path=os.path.join(OUT, 'b-assistant.png'))
    p.keyboard.press('Escape')
    # stock : onglets du détail
    aller(p, 'stock')
    p.click('[data-action="detail"]')
    p.wait_for_timeout(250)
    for o in ['cbd', 'ecarts', 'commande']:
        p.click('[data-seg="stockonglet"][data-val="' + o + '"]')
        p.wait_for_timeout(200)
    p.screenshot(path=os.path.join(OUT, 'b-stock-detail.png'), full_page=True)
    # résultat : l'année
    aller(p, 'rentabilite')
    p.click('[data-action="detail"]')
    p.wait_for_timeout(250)
    p.click('[data-seg="resvue"][data-val="annee"]')
    p.wait_for_timeout(200)
    p.screenshot(path=os.path.join(OUT, 'b-rentabilite-detail.png'), full_page=True)
    # accueil : une tuile mène à sa page, un geste se coche
    aller(p, 'cockpit')
    p.click('.geste input[data-tache="fdj"] + .g-coche')
    p.wait_for_timeout(200)
    geste_fait = p.locator('.geste.faite').count()
    p.click('.tuile-soir[data-route="fdj"]')
    p.wait_for_timeout(300)
    route_tuile = p.evaluate('location.hash')
    # menu exporter et exports réels
    p.click('.tete [data-action="menu-export"]')
    p.wait_for_timeout(200)
    p.screenshot(path=os.path.join(OUT, 'b-menu-export.png'))
    p.keyboard.press('Escape')
    res = {}
    for cle in ['classeur', 'factures', 'resultat']:
        b64 = p.evaluate("""async (cle) => { const blob = await window.__cockpitTest.construireClasseur(cle); const buf = new Uint8Array(await blob.arrayBuffer()); let s=''; for (let i=0;i<buf.length;i++) s+=String.fromCharCode(buf[i]); return btoa(s); }""", cle)
        fic = os.path.join(S, 'export-' + cle + '.xlsx')
        open(fic, 'wb').write(base64.b64decode(b64))
        res[cle] = os.path.getsize(fic)
    b64 = p.evaluate("""async () => { const blob = await window.__cockpitTest.construirePack(); const buf = new Uint8Array(await blob.arrayBuffer()); let s=''; for (let i=0;i<buf.length;i++) s+=String.fromCharCode(buf[i]); return btoa(s); }""")
    open(os.path.join(S, 'pack.pdf'), 'wb').write(base64.b64decode(b64))
    ctx.close()

    # ---------------- bureau, sombre
    ctx, p = page_neuve(b, 1440, 900, sombre=True)
    p.goto(URL)
    p.click('#cx-entrer')
    p.wait_for_timeout(900)
    for r in ['cockpit', 'caisse', 'fdj', 'tresorerie']:
        aller(p, r, 250)
        p.screenshot(path=os.path.join(OUT, 's-' + r + '.png'), full_page=True)
    ctx.close()

    # ---------------- portable 1180 et tablette 900
    for w, h, nom in [(1180, 820, 'l'), (900, 1000, 't')]:
        ctx, p = page_neuve(b, w, h)
        p.goto(URL)
        p.click('#cx-entrer')
        p.wait_for_timeout(900)
        for r in ['cockpit', 'caisse', 'fdj', 'tresorerie', 'factures']:
            aller(p, r, 250)
            p.screenshot(path=os.path.join(OUT, nom + '-' + r + '.png'), full_page=True)
        ctx.close()

    # ---------------- téléphone
    ctx, p = page_neuve(b, 390, 844, mobile=True)
    p.goto(URL)
    p.wait_for_timeout(300)
    p.screenshot(path=os.path.join(OUT, 'm-connexion.png'))
    p.click('#cx-entrer')
    p.wait_for_timeout(900)
    largeurs = {}
    for r in ROUTES:
        aller(p, r, 300)
        largeurs[r] = p.evaluate('document.documentElement.scrollWidth')
        p.screenshot(path=os.path.join(OUT, 'm-' + r + '.png'))
        p.screenshot(path=os.path.join(OUT, 'm-' + r + '-plein.png'), full_page=True)
    largeur = max(largeurs.values())
    p.click('[data-action="plus"]')
    p.wait_for_timeout(300)
    p.screenshot(path=os.path.join(OUT, 'm-plus.png'))
    p.keyboard.press('Escape')
    aller(p, 'factures')
    p.locator('.facture-l').nth(2).click()
    p.wait_for_timeout(350)
    p.screenshot(path=os.path.join(OUT, 'm-facture-tiroir.png'))
    p.keyboard.press('Escape')
    p.click('.tete [data-action="assistant"]')
    p.wait_for_timeout(250)
    p.click('.as-idees button >> nth=0')
    p.wait_for_timeout(1000)
    p.screenshot(path=os.path.join(OUT, 'm-assistant.png'))
    ctx.close()
    b.close()

print(json.dumps({'erreurs': erreurs[:30], 'nb_erreurs': len(erreurs), 'heros_anime_final': heros_final,
                  'ciel_agencement': ciel, 'plan_pret': plan_pret, 'plan_mvts': plan_mvts, 'plan_evts': plan_evts, 'plan_lecture': plan_lecture, 'plan_investir': plan_investir, 'plan_effet': plan_effet, 'plan_toucher': plan_toucher, 'kpis_plan': kpis_plan, 'ciel_defaut': ciel_defaut, 'mouvements_logista': nb_logista,
                  'resultats_coca': nres, 'route_apres_recherche': route_apres, 'notifs': nb_notifs, 'xlsx': res, 'telecharge': telecharge,
                  'largeur_mobile': largeur, 'largeurs': largeurs, 'largeurs_bureau': largeurs_bureau, 'geste_fait': geste_fait, 'route_tuile': route_tuile,
                  'caisse': {'a_avoir': a_avoir, 'manque': msg_manque, 'juste': msg_juste, 'jour_z': jour_z},
                  'fdj': {'prochain': fdj_prochain, 'atterrissage': fdj_atterrissage, 'jour': fdj_jour, 'sem_prec': fdj_sem_prec,
                          'sem_ligne': fdj_sem_ligne, 'ops': nb_ops},
                  'assistant': reponses}, ensure_ascii=False, indent=1))
