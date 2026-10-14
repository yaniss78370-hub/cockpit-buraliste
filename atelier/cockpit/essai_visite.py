#!/usr/bin/env python3
"""Essai de la visite guidée (Playwright, Chromium) : la voix part-elle tout de suite, et l'écran suit-il la voix ?

Le site est servi en local comme sur cockpit-buraliste.fr (la piste voix/visite.mp3 vient du réseau, lue par morceaux),
avec un réseau bridé au choix. On relève à chaque image l'horloge de la visite, le temps de la voix, l'étape,
les sous-titres et le projecteur, puis on vérifie :
- le délai entre le clic sur « Se connecter » et la voix ;
- chaque mot des sous-titres s'allume quand la voix le dit ;
- chaque page s'ouvre, et le projecteur se pose, avant le premier mot de son étape ;
- la visite dure le temps de la piste (aucun blanc ajouté entre les étapes) ;
- pause, reprise, son coupé, son refusé par le navigateur, « Activer la voix », « Revoir la visite ».
Le bilan final liste ce qui ne passe pas (code de sortie 1).

Usage : python3 essai_visite.py [bureau|tel] [rapide|4g|3g] [lecture_s]
        lecture_s : temps passé sur l'écran de connexion avant le clic (2,5 s par défaut ; 0,4 s : clic avant la fin du chargement)
        DETAIL=1 : les mots allumés le plus en retard"""
import functools, http.server, os, sys, threading
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(ICI, '..', '..'))
FORME = sys.argv[1] if len(sys.argv) > 1 else 'bureau'
RESEAU = sys.argv[2] if len(sys.argv) > 2 else '4g'
LECTURE = float(sys.argv[3]) if len(sys.argv) > 3 else 2.5
RESEAUX = {
    'rapide': None,
    '4g': dict(offline=False, latency=70, downloadThroughput=9e6 / 8, uploadThroughput=3e6 / 8),
    '3g': dict(offline=False, latency=150, downloadThroughput=1.6e6 / 8, uploadThroughput=0.75e6 / 8),
}
ECHECS = []


def verifier(ok, quoi):
    if not ok:
        ECHECS.append(quoi)
    return ok


RELEVE = r"""
window.__ev = []; window.__img = [];
const EV = (k, v) => window.__ev.push([performance.now(), k, v]);
window.__EV = EV;
let avant = {};
function image() {
  const E = window.ESSAI_VISITE;
  if (E) {
    const VT = E.VT, a = E.lecteur();
    if (a && !a.__suivi) {
      a.__suivi = true;
      ['playing', 'pause', 'ended', 'waiting', 'seeked'].forEach((ev) => a.addEventListener(ev, () => EV('a:' + ev, +a.currentTime.toFixed(3))));
    }
    if (VT.actif) {
      const t = E.temps();
      const v = document.querySelector('#vi-voile'), r = v ? v.getBoundingClientRect() : null;
      const st = document.querySelector('#vi-st .vi-st-l');
      const c = VT.cible && document.body.contains(VT.cible) ? VT.cible.getBoundingClientRect() : null;
      window.__img.push([performance.now(), VT.horloge, +t.toFixed(4), a ? +a.currentTime.toFixed(4) : null, a ? a.paused : null, VT.i, VT.chunk,
        st ? st.querySelectorAll('.dit').length : null, r ? [r.x, r.y, r.width, r.height].map((x) => Math.round(x)) : null,
        c ? [c.x, c.y, c.width, c.height].map((x) => Math.round(x)) : null, location.hash, VT.fini, VT.pause, VT.son]);
      if (VT.i !== avant.i) EV('etape', [VT.i, +t.toFixed(3)]);
      avant.i = VT.i;
      document.querySelectorAll('#visite .vi-clic').forEach((c) => { if (!c.__vu) { c.__vu = true; EV('geste', [+t.toFixed(3), c.style.left, c.style.top]); } });
    }
  }
  requestAnimationFrame(image);
}
requestAnimationFrame(image);
"""


def servir():
    class Discret(http.server.SimpleHTTPRequestHandler):
        """Serveur local qui, comme GitHub Pages, accepte les demandes partielles (Range) : la voix se lit en flux et se cherche."""
        def log_message(self, *a):
            pass

        def send_head(self):
            plage = self.headers.get('Range')
            chemin = self.translate_path(self.path)
            if not plage or not os.path.isfile(chemin):
                return super().send_head()
            taille = os.path.getsize(chemin)
            a, _, b = plage.replace('bytes=', '').partition('-')
            a = int(a or 0)
            b = min(int(b) if b else taille - 1, taille - 1)
            f = open(chemin, 'rb')
            f.seek(a)
            self.send_response(206)
            self.send_header('Content-Type', self.guess_type(chemin))
            self.send_header('Accept-Ranges', 'bytes')
            self.send_header('Content-Range', 'bytes %d-%d/%d' % (a, b, taille))
            self.send_header('Content-Length', str(b - a + 1))
            self.end_headers()
            self.reste = b - a + 1
            return f

        def copyfile(self, source, sortie):
            n = getattr(self, 'reste', None)
            if n is None:
                return super().copyfile(source, sortie)
            while n > 0:
                bloc = source.read(min(65536, n))
                if not bloc:
                    break
                sortie.write(bloc)
                n -= len(bloc)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Discret, directory=SITE))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def page(b, refuser_son=False):
    tel = FORME == 'tel'
    ctx = b.new_context(viewport={'width': 390, 'height': 844} if tel else {'width': 1440, 'height': 900},
                        device_scale_factor=2 if tel else 1, is_mobile=tel, has_touch=tel, reduced_motion='no-preference')
    p = ctx.new_page()
    erreurs = []
    p.on('pageerror', lambda e: erreurs.append(str(e)))
    p.on('console', lambda m: erreurs.append(m.text) if m.type in ('error', 'warning') else None)
    if RESEAUX[RESEAU]:
        cdp = ctx.new_cdp_session(p)
        cdp.send('Network.enable')
        cdp.send('Network.setCacheDisabled', {'cacheDisabled': True})
        cdp.send('Network.emulateNetworkConditions', RESEAUX[RESEAU])
    p.add_init_script(RELEVE)
    if refuser_son:   # le navigateur refuse la lecture (navigateur strict, réglage du téléphone)
        p.add_init_script("HTMLMediaElement.prototype.play = function () { return Promise.reject(new DOMException('refus', 'NotAllowedError')); };")
    return ctx, p, erreurs


def connexion(p, url):
    p.goto(url, wait_until='load')
    p.wait_for_timeout(int(LECTURE * 1000))
    p.evaluate("window.__EV('clic', null)")
    p.click('#cx-entrer')


def sans_refus(err):
    return [e for e in err if 'refus' not in e]


def analyser(p, err):
    ev = p.evaluate('window.__ev')
    img = p.evaluate('window.__img')
    etapes = p.evaluate("window.ESSAI_VISITE.ETAPES_VISITE.map((e) => ({ id: e.id, t: e.t, parle: e.parle, cible: !!(e.cible || e.cibleTel), "
                        "lignes: e.lignes.map((l) => l.mots.map((m) => m.d)), textes: e.lignes.map((l) => l.mots.map((m) => m.m)) }))")
    duree = p.evaluate('window.ESSAI_VISITE.VT.duree')
    t_clic = next(t for t, k, v in ev if k == 'clic')
    jouee = [t for t, k, v in ev if k == 'a:playing']
    print('\n==== visite complète (%s, réseau %s, écran de connexion lu %.1f s)' % (FORME, RESEAU, LECTURE))
    if verifier(bool(jouee), 'la voix n’a jamais démarré'):
        d = jouee[0] - t_clic
        print('clic -> voix : %.0f ms (dont le temps du clic simulé, ~150 ms)' % d)
        if LECTURE >= 1.5 and RESEAU != '3g':
            verifier(d < 450, 'voix lente à partir : %.0f ms' % d)
    # mots : moment où chaque mot s'allume (temps de la visite) face à son début dans la piste
    mots = []
    for k in range(1, len(img)):
        a, b = img[k - 1], img[k]
        if b[5] is None or b[5] < 0 or b[5] != a[5] or b[6] != a[6] or a[7] is None or b[7] is None or b[7] <= a[7]:
            continue
        e = etapes[b[5]]
        for m in range(a[7], b[7]):
            mots.append((b[2] - e['lignes'][b[6]][m], e['textes'][b[6]][m], b[2] - a[2]))
    nb_mots = sum(len(l) for e in etapes for l in e['lignes'])
    if verifier(len(mots) > nb_mots * 0.9, 'mots allumés : %d sur %d' % (len(mots), nb_mots)):
        mots.sort()
        med = mots[len(mots) // 2][0]
        print('mots allumés : %d sur %d, écart au mot dit : médiane %+.0f ms, de %+.0f à %+.0f ms' % (
            len(mots), nb_mots, med * 1000, mots[0][0] * 1000, mots[-1][0] * 1000))
        verifier(abs(med) < 0.05, 'mots allumés à contretemps (médiane %+.0f ms)' % (med * 1000))
        verifier(mots[0][0] > -0.08, 'mot allumé trop tôt (%+.0f ms)' % (mots[0][0] * 1000))
        if os.environ.get('DETAIL'):
            print('  les plus en retard :', ', '.join('%s %+.0f ms (image de %.0f ms)' % (m, e * 1000, d * 1000) for e, m, d in mots[-6:]))
    # étapes : entrée, projecteur posé, premier mot
    entrees = {}
    for t, k, v in ev:
        if k == 'etape' and v[0] >= 0 and v[0] not in entrees:
            entrees[v[0]] = v[1]
    for n, e in enumerate(etapes):
        if not verifier(n in entrees, 'étape %d jamais atteinte' % e['id']):
            continue
        pose = None   # le projecteur est posé quand il reste immobile 4 images de suite
        fr = [f for f in img if f[5] == n and f[8] and f[9]]
        for j in range(3, len(fr)):
            if all(abs(fr[j - q][8][0] - fr[j - q - 1][8][0]) <= 1 and abs(fr[j - q][8][1] - fr[j - q - 1][8][1]) <= 1 and fr[j - q][8][2] > 0 for q in range(3)):
                pose = fr[j - 3][2]
                break
        print('étape %d : page à %6.2f s (prévue %6.2f), premier mot %6.2f s%s' % (
            e['id'], entrees[n], e['t'], e['parle'], (', projecteur posé à %6.2f s (%+.2f s avant le mot)' % (pose, e['parle'] - pose)) if pose is not None else ''))
        if n > 0:
            verifier(entrees[n] < e['parle'], 'étape %d : la page arrive après la voix' % e['id'])
        if e['cible'] and verifier(pose is not None, 'étape %d : projecteur jamais posé' % e['id']):
            verifier(pose < e['parle'] + 0.12, 'étape %d : projecteur posé %.2f s après le premier mot' % (e['id'], pose - e['parle']))
    gestes = [v for t, k, v in ev if k == 'geste']
    print('gestes visibles (rond ambré) : ' + ', '.join('%.2f s' % g[0] for g in gestes))
    fin = [f for f in img if f[11]]
    if verifier(bool(fin), 'pas de carte de fin'):
        print('carte de fin : %.2f s après le clic, pour une piste de %.2f s' % ((fin[0][0] - t_clic) / 1000, duree))
        verifier((fin[0][0] - t_clic) / 1000 < duree + 1.6, 'la visite dure plus que la piste : blancs ajoutés ?')
    verifier(not err, 'erreurs : %s' % err[:3])


with sync_playwright() as pw:
    srv = servir()
    url = 'http://127.0.0.1:%d/cockpit.html?essai-visite' % srv.server_address[1]
    b = pw.chromium.launch()
    # 1. la visite complète, sans toucher à rien
    ctx, p, err = page(b)
    connexion(p, url)
    p.wait_for_selector('.vi-fin', timeout=110000)
    p.wait_for_timeout(300)
    analyser(p, err)
    ctx.close()

    # 2. pause et reprise au milieu de la caisse, puis couper et remettre le son
    ctx, p, err = page(b)
    connexion(p, url)
    p.wait_for_function('window.ESSAI_VISITE && window.ESSAI_VISITE.VT.i === 4 && window.ESSAI_VISITE.temps() > 36', timeout=60000)
    p.click('#vi-pause')
    p.wait_for_timeout(200)
    t_pause = p.evaluate('window.ESSAI_VISITE.temps()')
    p.wait_for_timeout(1500)
    t_pause2, en_pause = p.evaluate('[window.ESSAI_VISITE.temps(), window.ESSAI_VISITE.lecteur().paused]')
    p.click('.vi-reprise')
    p.wait_for_timeout(1000)
    t_apres = p.evaluate('window.ESSAI_VISITE.temps()')
    print('\n==== pause : la visite reste à %.2f s pendant 1,5 s (voix arrêtée : %s), %.2f s une seconde après la reprise' % (t_pause, en_pause, t_apres))
    verifier(abs(t_pause2 - t_pause) < 0.02 and en_pause, 'la pause n’arrête pas tout')
    verifier(0.8 < t_apres - t_pause2 < 1.2, 'la reprise ne repart pas au bon endroit')
    p.click('#vi-son')
    p.wait_for_timeout(600)
    muet, t1 = p.evaluate('[window.ESSAI_VISITE.lecteur().muted, window.ESSAI_VISITE.temps()]')
    p.wait_for_timeout(1000)
    t2 = p.evaluate('window.ESSAI_VISITE.temps()')
    p.click('#vi-son')
    print('son coupé : %s, la visite avance quand même (%.2f s -> %.2f s)' % (muet, t1, t2))
    verifier(muet and 0.8 < t2 - t1 < 1.2, 'son coupé : la visite ne suit plus')
    verifier(not err, 'erreurs (pause) : %s' % err[:3])
    ctx.close()

    # 3. le navigateur refuse le son : sous-titres au même rythme, puis « Activer la voix »
    ctx, p, err = page(b, refuser_son=True)
    connexion(p, url)
    p.wait_for_timeout(4000)
    etat = p.evaluate("({ h: window.ESSAI_VISITE.VT.horloge, t: window.ESSAI_VISITE.temps(), sansSon: document.querySelector('#visite').classList.contains('sans-son') })")
    print('\n==== son refusé : horloge %s, visite à %.2f s 4 s après le clic, bouton « Activer la voix » : %s' % (etat['h'], etat['t'], etat['sansSon']))
    verifier(etat['h'] == 'mur' and 3.6 < etat['t'] < 4.4 and etat['sansSon'], 'son refusé : la visite ne continue pas en sous-titres')
    verifier(not sans_refus(err), 'erreurs (son refusé) : %s' % sans_refus(err)[:3])
    ctx.close()

    ctx, p, err = page(b)
    p.goto(url, wait_until='load')
    p.wait_for_timeout(int(LECTURE * 1000))
    p.evaluate("HTMLMediaElement.prototype.__jouer = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { return Promise.reject(new DOMException('refus', 'NotAllowedError')); }; 0")
    p.click('#cx-entrer')
    p.wait_for_timeout(5000)
    p.evaluate("HTMLMediaElement.prototype.play = HTMLMediaElement.prototype.__jouer; 0")
    t_mur = p.evaluate('window.ESSAI_VISITE.temps()')
    p.click('#vi-son')
    p.wait_for_timeout(1500)
    r = p.evaluate("({ h: window.ESSAI_VISITE.VT.horloge, t: window.ESSAI_VISITE.temps(), ct: window.ESSAI_VISITE.lecteur().currentTime, paused: window.ESSAI_VISITE.lecteur().paused })")
    print('« Activer la voix » à %.2f s : 1,5 s plus tard horloge %s, visite %.2f s, voix %.2f s, voix en lecture : %s' % (t_mur, r['h'], r['t'], r['ct'], not r['paused']))
    verifier(r['h'] == 'voix' and not r['paused'] and abs(r['t'] - r['ct']) < 0.05 and 1.2 < r['t'] - t_mur < 1.8, '« Activer la voix » ne reprend pas au bon endroit')
    verifier(not sans_refus(err), 'erreurs (activer la voix) : %s' % sans_refus(err)[:3])
    ctx.close()

    # 4. revoir la visite depuis la carte de fin : elle repart du début, avec la voix
    ctx, p, err = page(b)
    connexion(p, url)
    p.wait_for_timeout(2000)
    p.evaluate("window.ESSAI_VISITE.lecteur().currentTime = 70.5")
    p.wait_for_selector('.vi-fin', timeout=40000)
    p.click('.vi-fin [data-vi="revoir"]')
    p.wait_for_timeout(1500)
    r = p.evaluate("({ h: window.ESSAI_VISITE.VT.horloge, t: window.ESSAI_VISITE.temps(), i: window.ESSAI_VISITE.VT.i, fin: !!document.querySelector('.vi-fin') })")
    print('\n==== revoir : horloge %s, %.2f s, étape %d, carte de fin encore là : %s' % (r['h'], r['t'], r['i'] + 1, r['fin']))
    verifier(r['h'] == 'voix' and 0.8 < r['t'] < 1.6 and r['i'] == 0 and not r['fin'], '« Revoir la visite » ne repart pas du début')
    verifier(not err, 'erreurs (revoir) : %s' % err[:3])
    ctx.close()
    b.close()
    srv.shutdown()

print('\nBILAN : ' + ('tout passe' if not ECHECS else '%d problème(s)\n- ' % len(ECHECS) + '\n- '.join(ECHECS)))
sys.exit(1 if ECHECS else 0)
