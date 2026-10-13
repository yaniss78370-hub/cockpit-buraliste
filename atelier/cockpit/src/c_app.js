/* ==================================================================
   Coque de l'application : barre latérale, barre du haut, onglets du téléphone,
   panneaux (recherche, notifications, sources, assistant), animations et événements.
   ================================================================== */
const NAV_BAS = ['cockpit', 'caisse', 'fdj', 'tresorerie'];
const LOGO = '<svg class="jauge-logo" viewBox="0 0 40 40" aria-hidden="true"><path class="arc-fond" d="M8.5 26.5a11.5 11.5 0 0 1 23 0"/><path class="arc-vert" d="M8.5 26.5a11.5 11.5 0 0 1 7.4-10.75"/><path class="aiguille" d="M20 12.2l2.5 9.3-2.5 5-2.5-5z"/><circle class="moyeu" cx="20" cy="26.5" r="2.4"/></svg>';
const PASTILLES_NAV = { fdj: ['att', '1'], factures: ['', '1'] };

/* ------------------------------------------------------------------ sources et notifications (données d'exemple) */
const SOURCES = [
  { k: 'strator', nom: 'Caisse Strator', det: 'Z, ventes par article, tickets annulés', h: '21:00', ic: 'caisse', coul: '#c2342f' },
  { k: 'bnp', nom: 'BNP Paribas', det: 'Compte principal, en lecture seule', h: '21:02', ini: 'BNP', coul: '#3a63d6' },
  { k: 'bp', nom: 'Banque Populaire', det: 'Compte tabac, en lecture seule', h: '21:02', ini: 'BP', coul: '#6b4fd1' },
  { k: 'fdj', nom: 'FDJ, Profession Jeux', det: 'Ventes du jour et relevé de la semaine 41', h: '20:58', ini: 'FDJ', coul: '#d0631f' },
  { k: 'pmu', nom: 'PMU', det: 'Relevé de la semaine 41, reçu lundi', h: 'lun.', ini: 'PMU', coul: '#2e8a64' },
  { k: 'logista', nom: 'Logista', det: 'Factures tabac et recharges', h: '18:10', ini: 'LOG', coul: '#1f2a4d' },
  { k: 'mail', nom: 'Boîte factures', det: D.factures.length + ' factures lues depuis juillet', h: '19:47', ic: 'mail', coul: '#9c5a00' },
  { k: 'tel', nom: 'Boîte vocale', det: '2 messages aujourd’hui, résumés envoyés', h: '18:42', ic: 'telephone', coul: '#16a596' },
];
function htmlSources(n = SOURCES.length) {
  return '<div class="sources-l">' + SOURCES.slice(0, n).map((s) => '<div class="src"><span class="src-ic" style="background:' + s.coul + '">' + (s.ic ? ic(s.ic) : s.ini) + '</span><b>' + esc(s.nom) + '</b><span class="src-d">' + esc(s.det) + '</span><span class="src-h">' + ic('coche') + s.h + '</span></div>').join('') + '</div>';
}
function notifications() {
  return [
    { h: '21:04', ic: 'coche-rond', niv: 'ok', t: 'Tout est à jour', s: 'Caisse, banques, FDJ et PMU lus ce soir.', route: 'cockpit' },
    { h: '21:00', ic: 'caisse', niv: '', t: 'Z de caisse reçu : ' + eur2(ZAUJ.total), s: eur2(ESPECES_COFFRE) + ' à avoir en caisse depuis la collecte de vendredi.', route: 'caisse' },
    { h: '18:42', ic: 'telephone', niv: '', t: 'Message de Mme Lefèvre', s: 'Son journal et un carnet de timbres pour demain, 9 h.', route: 'cockpit' },
    { h: 'lun. 12', ic: 'ticket', niv: 'att', t: 'Relevé FDJ S41 : ' + eur2(590000) + ' mercredi', s: eur(554000) + ' à virer sur le compte FDJ avant mercredi.', route: 'fdj' },
    { h: 'ven. 9', ic: 'facture', niv: 'att', t: 'Metro : Coca-Cola +6,8 %', s: 'Prix de rayon à revoir, la marge du produit baisse de 3 points.', facture: FACT_METRO && FACT_METRO.id },
    { h: 'jeu. 8', ic: 'alerte', niv: 'ko', t: 'Écart FDJ : ' + eur2(-4500) + ' à 14 h 31 min 08 s', s: 'Trois tickets à gratter passés au terminal, absents de la caisse.', route: 'fdj', ops: true },
  ];
}
const NB_NOTIFS = 5;

/* ------------------------------------------------------------------ coque */
function htmlCote() {
  const groupes = [];
  ROUTES.forEach((r) => {
    let g = groupes.find((x) => x.nom === r.groupe);
    if (!g) groupes.push(g = { nom: r.groupe, r: [] });
    g.r.push(r);
  });
  return '<a class="marque" href="#cockpit" data-action="aller" data-route="cockpit" aria-label="Cockpit Buraliste, accueil">' + LOGO + '<span><b>Cockpit</b> Buraliste</span></a>' +
    '<div class="tabac"><span class="tabac-av" aria-hidden="true">LB</span><span class="tabac-nom">' + esc(D.meta.tabac) + '</span><span class="tabac-sous">Tabac, presse, jeux · Julien, gérant</span><span class="tabac-test">' + ic('info') + 'Données d’exemple</span></div>' +
    '<nav class="nav" aria-label="Pages du cockpit">' + groupes.map((g) => '<div class="nav-groupe">' + (g.nom ? '<span class="nav-titre">' + g.nom + '</span>' : '') +
      g.r.map((r) => {
        const p = PASTILLES_NAV[r.id];
        return '<a href="#' + r.id + '" data-action="aller" data-route="' + r.id + '" title="' + r.titre + '"' + (ETAT.route === r.id ? ' aria-current="page"' : '') + '>' + ic(r.ic) + '<span>' + r.titre + '</span>' + (p ? '<b class="nav-pastille ' + p[0] + '">' + p[1] + '</b>' : '') + '</a>';
      }).join('') + '</div>').join('') + '</nav>' +
    '<div class="cote-pied">' +
    '<div class="lecture">' + ic('calendrier') + '<div><b>Lecture d’octobre</b><span>Jeudi 5 novembre, 10 h, avec votre contrôleur de gestion</span></div></div>' +
    '<div class="cote-boutons"><button class="bouton" type="button" data-action="menu-export" title="Exporter">' + ic('export') + '<span>Exporter</span></button><button class="bouton" type="button" data-action="deconnexion" title="Se déconnecter">' + ic('sortie') + '<span>Quitter</span></button></div>' +
    '<p class="cote-mention">Les chiffres, les noms et les situations présentés sont des exemples. <a href="https://cockpit-buraliste.fr" target="_blank" rel="noopener">cockpit-buraliste.fr</a></p></div>';
}
function htmlTete() {
  const r = ROUTE[ETAT.route];
  return '<div class="tete-gauche">' +
    '<a class="tete-marque marque" href="#cockpit" data-action="aller" data-route="cockpit" aria-label="Accueil">' + LOGO + '</a>' +
    '<span class="horloge" title="Données au mardi 13 octobre, 21 h 04"><i aria-hidden="true"></i>' + HEURE + '</span>' +
    '<span class="tete-titre">' + r.titre + '</span></div>' +
    '<div class="tete-droite">' +
    '<button class="chercher" type="button" data-action="palette" aria-label="Rechercher">' + ic('loupe') + '<span>Rechercher une facture, un produit…</span><kbd>⌘K</kbd></button>' +
    '<button class="etat-sources" type="button" data-action="sources" aria-label="État des sources"><span class="point-vif"></span><span class="es-txt">Tout est à jour</span></button>' +
    '<button class="btn-icone" type="button" data-action="notifs" aria-label="Notifications">' + ic('cloche') + (NB_NOTIFS ? '<span class="badge">' + NB_NOTIFS + '</span>' : '') + '</button>' +
    '<button class="btn-assistant" type="button" data-action="assistant" aria-label="Demander à l’assistant">' + ic('bulle') + '<span>Demander</span></button>' +
    '<button class="btn-icone btn-export-tete" type="button" data-action="menu-export" aria-label="Exporter">' + ic('export') + '</button></div>';
}
function htmlOngletsBas() {
  const plus = !NAV_BAS.includes(ETAT.route);
  return NAV_BAS.map((id) => ROUTE[id]).map((r) => '<button type="button" data-action="aller" data-route="' + r.id + '"' + (ETAT.route === r.id ? ' aria-current="page"' : '') + '>' + ic(r.ic) + '<span>' + r.titre + '</span>' + (PASTILLES_NAV[r.id] ? '<span class="badge">' + PASTILLES_NAV[r.id][1] + '</span>' : '') + '</button>').join('') +
    '<button type="button" data-action="plus"' + (plus ? ' aria-current="page"' : '') + '>' + ic('plus') + '<span>' + (plus ? ({ mise: 'Service' }[ETAT.route] || ROUTE[ETAT.route].titre) : 'Plus') + '</span></button>';
}

/* ------------------------------------------------------------------ connexion (démonstration) */
function htmlConnexion() {
  let etoiles = '';
  for (let k = 0; k < 46; k++) {
    const x = (k * 37.3) % 100, y = (k * 23.7 + (k % 7) * 9) % 62, d = (k % 9) * 0.45;
    etoiles += '<i style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%;animation-delay:' + d.toFixed(2) + 's;opacity:' + (0.25 + (k % 5) * 0.12).toFixed(2) + '"></i>';
  }
  return '<div class="cx-ciel" aria-hidden="true">' + etoiles + '<span class="cx-lune"></span></div><div class="cx-boite">' +
    '<a class="marque" href="https://cockpit-buraliste.fr" target="_blank" rel="noopener">' + LOGO + '<span><b>Cockpit</b> Buraliste</span></a>' +
    '<span class="horloge cx-heure"><i aria-hidden="true"></i>' + HEURE + '</span>' +
    '<h1 class="cx-titre">Bonsoir.<em>Votre cockpit vous attend.</em></h1>' +
    '<form class="cx-form" id="cx-form" novalidate><label for="cx-id">Identifiant</label><input class="champ" id="cx-id" type="text" value="demo@cockpit-buraliste.fr" readonly>' +
    '<label for="cx-mdp">Mot de passe</label><input class="champ" id="cx-mdp" type="password" value="demonstration" readonly>' +
    '<button class="bouton plein cx-bouton" type="submit" id="cx-entrer">' + ic('cadenas') + '<span>Se connecter</span></button></form>' +
    '<p class="cx-note">' + ic('info') + '<span>Compte de démonstration du tabac « Le Balto ». Les champs sont déjà remplis : vous ne saisissez rien, rien n’est envoyé. Les chiffres, les noms et les situations sont des exemples.</span></p>' +
    '<a class="cx-lien" href="https://cockpit-buraliste.fr/#demo" target="_blank" rel="noopener">Pas encore client ? Demander une démonstration</a></div>';
}
function seConnecter() {
  const b = $('#cx-entrer');
  if (b) { b.disabled = true; b.querySelector('span').textContent = 'Connexion…'; }
  document.body.classList.add('cx-depart');
  setTimeout(() => {
    ETAT.connecte = true;
    try { sessionStorage.setItem('cockpit-connecte', '1'); } catch (e) { /* session indisponible */ }
    document.body.classList.remove('cx-depart');
    ETAT.animer = true;
    afficher();
  }, 520);
}
function seDeconnecter() {
  ETAT.connecte = false;
  try { sessionStorage.removeItem('cockpit-connecte'); } catch (e) { /* session indisponible */ }
  fermerTout();
  afficher();
}

/* ------------------------------------------------------------------ rendu */
function afficher() {
  document.body.classList.toggle('non-connecte', !ETAT.connecte);
  $('#connexion').hidden = ETAT.connecte;
  $('#app').hidden = !ETAT.connecte;
  $('#onglets-bas').hidden = !ETAT.connecte;
  if (!ETAT.connecte) { $('#connexion').innerHTML = htmlConnexion(); return; }
  if (ETAT.animer == null) ETAT.animer = true;
  rendre();
}
let minuterieAnim = null;
function rendre(garderDefilement = false) {
  const y = window.scrollY;
  const vue = $('#vue');
  GRAPHES.length = 0;
  $('#cote').innerHTML = htmlCote();
  $('#tete').innerHTML = htmlTete();
  $('#onglets-bas').innerHTML = htmlOngletsBas();
  const animer = !!ETAT.animer && !garderDefilement;
  ETAT.animer = false;
  vue.classList.remove('anim');
  vue.innerHTML = VUES[ETAT.route]() + '<footer class="pied-page"><span>Cockpit Buraliste · version test · ' + esc(D.meta.tabac) + ' · données au mardi 13 octobre 2026, 21 h 04</span><span>Les chiffres, les noms et les situations présentés sont des exemples.</span></footer>';
  if (animer) {
    void vue.offsetWidth;
    vue.classList.add('anim');
    $$('.anime', vue).forEach((el, i) => el.style.setProperty('--i', Math.min(i, 14)));
  }
  peindreGraphes(vue);
  if (animer) {
    lancerComptes(vue);
    clearTimeout(minuterieAnim);
    minuterieAnim = setTimeout(() => vue.classList.remove('anim'), 2600);
  }
  document.title = ROUTE[ETAT.route].titre + ' · Cockpit Buraliste';
  if (garderDefilement) window.scrollTo(0, y);
  majDefile();
}
function aller(route, onglet) {
  if (!ROUTE[route]) route = 'cockpit';
  const change = route !== ETAT.route;
  ETAT.route = route;
  if (onglet && route === 'tresorerie') ETAT.tabTreso = onglet;
  if (onglet) ETAT.detail[route] = true;
  fermerTout();
  try { if (location.hash !== '#' + route) history.replaceState(null, '', '#' + route); } catch (e) { /* adresse figée */ }
  if (change) ETAT.animer = true;
  rendre();
  if (change || onglet) window.scrollTo(0, 0);
}
function majDefile() { document.body.classList.toggle('page-defilee', window.scrollY > 70); }
window.addEventListener('scroll', majDefile, { passive: true });
let minuterieTaille = null;
window.addEventListener('resize', () => { clearTimeout(minuterieTaille); minuterieTaille = setTimeout(() => peindreGraphes(document), 140); });

/* ------------------------------------------------------------------ tiroir, modale, feuille, message */
function fermerTout() {
  $$('.voile, .tiroir, .modale, .feuille, .palette, .panneau, .assistant').forEach((x) => x.remove());
  document.body.classList.remove('voile-ouvert');
}
function voile(clair = false) { return '<div class="voile' + (clair ? ' clair' : '') + '" data-action="fermer"></div>'; }
function ouvrirTiroir(titre, sous, corps) {
  fermerTout();
  document.body.insertAdjacentHTML('beforeend', voile() + '<aside class="tiroir" role="dialog" aria-modal="true" aria-label="' + esc(titre) + '"><div class="tiroir-tete"><div><h2>' + esc(titre) + '</h2>' + (sous ? '<p>' + sous + '</p>' : '') + '</div><button class="bouton petit" type="button" data-action="fermer" aria-label="Fermer">' + ic('croix') + '</button></div><div class="tiroir-corps">' + corps + '</div></aside>');
  peindreGraphes($('.tiroir'));
  const b = $('.tiroir .bouton');
  if (b) b.focus();
}
function ouvrirModale(html) {
  fermerTout();
  document.body.insertAdjacentHTML('beforeend', voile() + '<div class="modale" role="dialog" aria-modal="true">' + html + '</div>');
}
let minuterieToast = null;
function toast(txt) {
  $$('.toast').forEach((x) => x.remove());
  document.body.insertAdjacentHTML('beforeend', '<div class="toast" role="status">' + esc(txt) + '</div>');
  clearTimeout(minuterieToast);
  minuterieToast = setTimeout(() => $$('.toast').forEach((x) => x.remove()), 3400);
}
function menuExport() {
  const items = [
    ['classeur', 'xlsx', 'Tout le cockpit', 'Un classeur Excel : banques, factures et lignes, caisse depuis janvier, collectes, jeux, stock, compte de résultat, plan de vol, charges fixes.'],
    ['pack', 'pdf', 'Pack de septembre pour le comptable', 'L’essentiel du mois en PDF : résultat par rayon, trésorerie, contrôles et points d’attention.'],
    ['mouvements', 'csv', 'Mouvements bancaires', 'Les trois comptes, du 8 juillet au 13 octobre, et la semaine prévue.'],
    ['factures', 'xlsx', 'Factures, ligne par ligne', 'Chaque facture et chacune de ses lignes, rangées par famille.'],
  ];
  ouvrirModale('<h2>Exporter</h2><p class="discret">Les fichiers reprennent les données d’exemple du tabac « Le Balto ».</p><div class="liste-export">' +
    items.map(([cle, f, t, d]) => '<button type="button" class="export-l" data-action="export" data-cle="' + cle + '" data-format="' + f + '"><span class="ic-pastille ' + (f === 'pdf' ? 'rouge' : f === 'csv' ? 'bleu' : 'vert') + '">' + ic(f === 'pdf' ? 'pdf' : f === 'csv' ? 'csv' : 'xlsx') + '</span><span class="el-txt"><b>' + t + '</b><span>' + d + '</span></span><span class="el-f">' + f.toUpperCase() + '</span></button>').join('') +
    '</div><div class="pied"><button class="bouton" type="button" data-action="fermer">Fermer</button></div>');
}
function feuillePlus() {
  fermerTout();
  const autres = ROUTES.filter((r) => !NAV_BAS.includes(r.id));
  document.body.insertAdjacentHTML('beforeend', voile() + '<div class="feuille" role="dialog" aria-modal="true" aria-label="Plus"><span class="poignee"></span><span class="feuille-titre">Le Balto</span>' +
    autres.map((r) => '<button type="button" data-action="aller" data-route="' + r.id + '">' + ic(r.ic) + '<span>' + r.titre + '</span>' + ic('droite') + '</button>').join('') +
    '<button type="button" data-action="palette">' + ic('loupe') + '<span>Rechercher</span>' + ic('droite') + '</button>' +
    '<button type="button" data-action="sources">' + ic('source') + '<span>Vos sources, ce soir</span>' + ic('droite') + '</button>' +
    '<button type="button" data-action="menu-export">' + ic('export') + '<span>Exporter</span>' + ic('droite') + '</button>' +
    '<button type="button" data-action="deconnexion">' + ic('sortie') + '<span>Se déconnecter</span>' + ic('droite') + '</button></div>');
}
function ouvrirNotifs() {
  fermerTout();
  const N = notifications();
  document.body.insertAdjacentHTML('beforeend', voile(true) + '<div class="panneau" role="dialog" aria-label="Notifications"><div class="pan-tete"><h2>Ce soir</h2><span>' + NB_NOTIFS + ' nouvelles</span></div>' +
    N.map((n, i) => '<button type="button" class="notif" data-action="notif" data-i="' + i + '"><span class="n-ic ' + n.niv + '">' + ic(n.ic) + '</span><b>' + esc(n.t) + '</b><span><span class="n-h">' + n.h + '</span> · ' + esc(n.s) + '</span></button>').join('') + '</div>');
}
function ouvrirSources() {
  fermerTout();
  document.body.insertAdjacentHTML('beforeend', voile(true) + '<div class="panneau" role="dialog" aria-label="Vos sources"><div class="pan-tete"><h2>Vos sources</h2><span><span class="point-vif" style="display:inline-block;margin-right:6px"></span>tout est à jour</span></div><div class="pan-src">' + htmlSources() + '</div>' +
    '<p class="pan-note">Le cockpit ne se connecte ni à votre caisse ni à vos comptes de jeux : il reçoit les exports, avec votre mandat, et lit vos banques en lecture seule. Chaque accès se coupe en un clic.</p></div>');
}

/* ------------------------------------------------------------------ palette de recherche */
const ACTIONS_PAL = [
  { lib: 'Compter la caisse', ic: 'billet', go: () => { aller('caisse'); setTimeout(() => { const c = $('#compte-caisse'); if (c) { c.scrollIntoView({ block: 'center' }); c.focus(); } }, 60); } },
  { lib: 'Le plan de vol, à six mois', ic: 'courbe', go: () => { aller('tresorerie'); setTimeout(() => { const p = $('#plan'); if (p) p.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 60); } },
  { lib: 'Atterrissage FDJ de la semaine', ic: 'ticket', go: () => aller('fdj') },
  { lib: 'La commande de jeudi', ic: 'camion', go: () => aller('stock') },
  { lib: 'Demander à l’assistant', ic: 'bulle', go: () => ouvrirAssistant() },
  { lib: 'Exporter tout le cockpit (Excel)', ic: 'xlsx', go: () => exporter('classeur', 'xlsx') },
  { lib: 'Pack de septembre pour le comptable (PDF)', ic: 'pdf', go: () => exporter('pack', 'pdf') },
];
const INDEX = [].concat(
  D.factures.map((f) => ({ g: 'Factures', ic: 'facture', lib: f.fournisseur + ' · ' + f.objet, mt: f.ttc, cle: (f.fournisseur + ' ' + f.objet + ' ' + eur2(f.ttc) + ' ' + f.lignes.map((l) => l.d).join(' ')).toLowerCase(), go: () => ouvrirFacture(f.id) })),
  MVT.map((m) => ({ g: 'Banque', ic: 'banque', lib: dNum(m.date) + ' · ' + m.libelle, mt: m.montant, cle: (m.libelle + ' ' + m.contrepartie + ' ' + m.categorie + ' ' + eur2(m.montant)).toLowerCase(), go: () => { aller('tresorerie', 'mouvements'); detailMouvement(m.i); } })),
  D.refs.map((r) => ({ g: 'Produits', ic: 'vape', lib: r.designation + ' · stock ' + r.stock, mt: null, cle: (r.designation + ' ' + r.code).toLowerCase(), go: () => { ETAT.stock.onglet = 'vape'; ETAT.stock.q = r.designation; ETAT.stock.statut = 'tous'; ETAT.detail.stock = true; aller('stock'); } })),
  D.cbd_refs.map((r) => ({ g: 'Produits', ic: 'feuille', lib: r.designation + ' · lot ' + r.lot, mt: null, cle: (r.designation + ' ' + r.lot + ' cbd').toLowerCase(), go: () => { ETAT.stock.onglet = 'cbd'; ETAT.detail.stock = true; aller('stock'); } }))
);
let PAL = [], PAL_I = 0;
function resultatsPalette(q) {
  q = (q || '').trim().toLowerCase();
  const pages = ROUTES.map((r) => ({ g: 'Pages', ic: r.ic, lib: r.titre, mt: null, cle: (r.titre + ' ' + r.groupe).toLowerCase(), go: () => aller(r.id) }));
  const actions = ACTIONS_PAL.map((a) => ({ g: 'Actions', ic: a.ic, lib: a.lib, mt: null, cle: a.lib.toLowerCase(), go: a.go }));
  if (q.length < 2) return pages.concat(actions);
  const mots = q.split(/\s+/);
  const ok = (x) => mots.every((m) => x.cle.includes(m));
  return pages.filter(ok).concat(actions.filter(ok), INDEX.filter(ok).slice(0, 14));
}
function htmlResPalette() {
  if (!PAL.length) return '<div class="pal-vide">Rien trouvé. Essayez « Logista », « Coca », « Fraise » ou un montant.</div>';
  let g = '';
  return PAL.map((x, i) => (x.g !== g ? '<div class="pal-groupe">' + (g = x.g) + '</div>' : '') + '<button type="button" class="pal-item' + (i === PAL_I ? ' actif' : '') + '" data-pal="' + i + '">' + ic(x.ic) + '<span>' + esc(x.lib) + '</span>' + (x.mt != null ? '<small>' + eur2(x.mt) + '</small>' : '<small></small>') + '</button>').join('');
}
function ouvrirPalette() {
  fermerTout();
  PAL = resultatsPalette(''); PAL_I = 0;
  document.body.insertAdjacentHTML('beforeend', voile() + '<div class="palette" role="dialog" aria-modal="true" aria-label="Rechercher"><div class="pal-champ">' + ic('loupe') + '<input id="pal-q" type="search" placeholder="Une facture, un produit, un montant, une page…" autocomplete="off" aria-label="Rechercher"><kbd>Échap</kbd></div><div class="pal-res" id="pal-res">' + htmlResPalette() + '</div><div class="pal-pied"><span>↑ ↓ pour choisir</span><span>Entrée pour ouvrir</span></div></div>');
  const q = $('#pal-q');
  if (q) q.focus();
}
function majPalette(q) { PAL = resultatsPalette(q); PAL_I = 0; const r = $('#pal-res'); if (r) r.innerHTML = htmlResPalette(); }
function choisirPalette(i) { const x = PAL[i]; fermerTout(); if (x) x.go(); }

/* ------------------------------------------------------------------ détails */
function detailMouvement(i) {
  const m = MVT[i];
  const f = m.facture ? FACT[m.facture] : null;
  const corps = '<dl class="fiche"><div><dt>Date</dt><dd>' + maj(dLong(m.date)) + (m.statut === 'prévu' ? ' (prévu)' : '') + '</dd></div><div><dt>Montant</dt><dd class="' + (m.montant < 0 ? 'negatif' : 'positif') + '">' + eur2(m.montant, true) + '</dd></div>' +
    '<div><dt>Compte</dt><dd>' + COMPTES[m.compte].nom + '</dd></div><div><dt>Catégorie</dt><dd>' + esc(m.categorie) + '</dd></div><div><dt>Contrepartie</dt><dd>' + esc(m.contrepartie) + '</dd></div><div><dt>Libellé bancaire</dt><dd class="mono">' + esc(m.libelle) + '</dd></div></dl>' +
    (m.note ? '<div class="encart info">' + ic('info') + '<div>' + esc(m.note) + '</div></div>' : '') +
    (f ? '<div class="encart ok">' + ic('coche') + '<div><b>Rapproché avec la facture ' + f.id + '.</b> ' + esc(f.fournisseur) + ', ' + esc(f.objet) + '.</div></div><div class="papier serre">' + htmlLecteur(f.id) + '</div>'
      : m.categorie === 'Encaissements CB' ? '<div class="encart info">' + ic('info') + '<div>Remise des ventes par carte de la veille, rapprochée du Z de caisse.</div></div>'
        : m.categorie === 'Dépôt d’espèces' ? '<div class="encart info">' + ic('info') + '<div>Espèces de la semaine, comptées à la collecte du vendredi et rapprochées des Z de caisse, gains payés au comptoir déduits.</div></div>' : '');
  ouvrirTiroir(m.contrepartie, esc(m.categorie), corps);
}
function ouvrirFacture(id) {
  ETAT.fact.choisie = id;
  const f = FACT[id];
  if (!f) return;
  const large = !window.matchMedia('(max-width: 1120px)').matches;
  if (ETAT.route !== 'factures') {
    ETAT.route = 'factures';
    ETAT.animer = true;
    try { history.replaceState(null, '', '#factures'); } catch (e) { /* adresse figée */ }
    fermerTout();
    rendre();
    window.scrollTo(0, 0);
    if (!large) ouvrirTiroir(f.fournisseur, esc(f.objet), htmlLecteur(id));
    else { const l = $('#lecteur'); if (l) l.scrollIntoView({ block: 'nearest' }); }
    return;
  }
  $$('.facture-l').forEach((x) => x.classList.toggle('choisie', x.dataset.id === id));
  const l = $('#lecteur-corps');
  if (l) l.innerHTML = htmlLecteur(id);
  if (!large) ouvrirTiroir(f.fournisseur, esc(f.objet), htmlLecteur(id));
}

/* ------------------------------------------------------------------ infobulles */
const BULLE = document.createElement('div');
BULLE.className = 'infobulle';
BULLE.setAttribute('role', 'tooltip');
document.body.appendChild(BULLE);
function placerBulle(t, x0, y0) {
  BULLE.innerHTML = t.getAttribute('data-tip');
  const w = BULLE.offsetWidth, h = BULLE.offsetHeight;
  let x = x0 + 14, y = y0 - h - 14;
  if (x + w > window.innerWidth - 8) x = x0 - w - 14;
  if (x < 8) x = 8;
  if (y < 8) y = y0 + 18;
  BULLE.style.left = x + 'px';
  BULLE.style.top = y + 'px';
  BULLE.style.opacity = '1';
}
document.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  const t = e.target.closest && e.target.closest('[data-tip]');
  if (!t) { BULLE.style.opacity = '0'; return; }
  placerBulle(t, e.clientX, e.clientY);
}, { passive: true });
document.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch') return;
  const t = e.target.closest && e.target.closest('[data-tip]');
  if (!t) { BULLE.style.opacity = '0'; return; }
  placerBulle(t, e.clientX, e.clientY);
}, { passive: true });
document.addEventListener('pointerleave', () => { BULLE.style.opacity = '0'; });
window.addEventListener('scroll', () => { BULLE.style.opacity = '0'; }, { passive: true });

/* ------------------------------------------------------------------ événements */
function majPlan() {
  ecrire();
  if (!majZonesPlan()) rendre(true);
}
function lireMontant(txt) {
  const v = parseFloat(String(txt || '').replace(/[\s\u00a0\u202f€]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
  return isFinite(v) ? Math.round(Math.abs(v)) : 0;
}
function ajouterMouvementPlan() {
  const f = ETAT.planForm;
  const lib = $('#mp-lib'), mt = $('#mp-montant');
  if (lib) f.lib = lib.value;
  if (mt) f.montant = mt.value;
  const v = lireMontant(f.montant);
  if (!v) { const er = $('#mp-erreur'); if (er) er.hidden = false; if (mt) mt.focus(); return; }
  if (ETAT.plan.mouvements.length >= 8) return;
  const nom = (f.lib || '').trim().slice(0, 40) || (f.sens === 'rentree' ? 'Rentrée d’argent' : 'Dépense');
  ETAT.plan.mouvements.push({ id: 'm' + Date.now().toString(36), lib: nom, montant: f.sens === 'rentree' ? v : -v, mois: f.mois, freq: f.freq });
  Object.assign(ETAT.planForm, { ouvert: false, lib: '', montant: '' });
  majPlan();
  toast('Ajouté au plan : ' + nom + ', ' + eur((f.sens === 'rentree' ? v : -v) * 100, false, true) + (f.freq === 'mois' ? ' par mois' : '') + '.');
}
document.addEventListener('click', (e) => {
  const pal = e.target.closest('[data-pal]');
  if (pal) { choisirPalette(+pal.dataset.pal); return; }
  const triEl = e.target.closest('th[data-tri]');
  if (triEl) {
    const table = triEl.closest('#zone-mvt') ? ETAT.mvt : ETAT.stock;
    const cle = triEl.dataset.tri;
    table.sens = table.tri === cle ? -table.sens : (cle === 'designation' || cle === 'code' || cle === 'categorie' || cle === 'statut' ? 1 : -1);
    table.tri = cle;
    rendre(true);
    return;
  }
  const s = e.target.closest('[data-seg]');
  if (s) {
    const v = s.dataset.val;
    switch (s.dataset.seg) {
      case 'treso': ETAT.tabTreso = v; break;
      case 'fdjsem': ETAT.jeux.semaine = v; break;
      case 'annules': ETAT.caisse.annules = v; break;
      case 'factstatut': ETAT.fact.statut = v; break;
      case 'vapestatut': ETAT.stock.statut = v; break;
      case 'stockonglet': ETAT.stock.onglet = v; break;
      case 'resvue': ETAT.resultat.vue = v; break;
      case 'semvue': ETAT.semVue = v; break;
    }
    rendre(true);
    return;
  }
  const lev = e.target.closest('[data-levier]');
  if (lev) { const k = lev.dataset.levier; ETAT.plan[k] = !ETAT.plan[k]; majPlan(); return; }
  const ci = e.target.closest('#plan-graphe .cible');
  if (ci && ci.dataset.i != null) {
    ETAT.plan.lecture = +ci.dataset.i; ecrire();
    const r = $('#plan-date'); if (r) r.value = ETAT.plan.lecture;
    placerLecture(ETAT.plan.lecture);
    return;
  }
  const pl = e.target.closest('[data-plan]');
  if (pl) {
    const v = pl.dataset.v;
    ETAT.plan[pl.dataset.plan] = v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v;
    if (pl.dataset.plan === 'agencementMois' && ETAT.plan.aideMois <= ETAT.plan.agencementMois) ETAT.plan.aideMois = Math.min(6, ETAT.plan.agencementMois + 2);
    majPlan();
    return;
  }
  const pf = e.target.closest('[data-pf]');
  if (pf) {
    ETAT.planForm[pf.dataset.pf] = pf.dataset.pf === 'mois' ? +pf.dataset.v : pf.dataset.v;
    const m = $('#plan-mvts'); if (m) { m.innerHTML = htmlMvtsPlan(); const n = $('[data-pf="' + pf.dataset.pf + '"][data-v="' + pf.dataset.v + '"]'); if (n) n.focus({ preventScroll: true }); }
    return;
  }
  const a = e.target.closest('[data-action]');
  if (!a) return;
  const act = a.dataset.action;
  if (a.tagName === 'A') e.preventDefault();
  switch (act) {
    case 'aller': aller(a.dataset.route, a.dataset.onglet); break;
    case 'facture': ouvrirFacture(a.dataset.id); break;
    case 'mouvement': detailMouvement(+a.dataset.i); break;
    case 'fermer': fermerTout(); break;
    case 'menu-export': menuExport(); break;
    case 'plus': feuillePlus(); break;
    case 'palette': ouvrirPalette(); break;
    case 'notifs': ouvrirNotifs(); break;
    case 'sources': ouvrirSources(); break;
    case 'assistant': ouvrirAssistant(a.dataset.q); break;
    case 'as-q': poserQuestion(a.dataset.q); break;
    case 'notif': {
      const n = notifications()[+a.dataset.i];
      fermerTout();
      if (!n) break;
      if (n.facture) { ouvrirFacture(n.facture); break; }
      if (n.ops) { ETAT.fdj.semaine = '2026-10-05'; ETAT.fdj.ops = true; ETAT.fdj.jour = null; }
      aller(n.route);
      break;
    }
    case 'deconnexion': seDeconnecter(); break;
    case 'surveiller': if (a.dataset.ops) { ETAT.fdj.semaine = '2026-10-05'; ETAT.fdj.ops = true; ETAT.fdj.jour = null; } if (a.dataset.route === 'caisse') { ETAT.caisse.jour = '2026-10-10'; ETAT.caisse.annules = 'jour'; ETAT.detail.caisse = true; } aller(a.dataset.route); break;
    case 'plus-mvt': ETAT.mvt.n += 60; $('#zone-mvt').innerHTML = htmlTableMouvements(); break;
    case 'plan-scenario': {
      const sc = SCENARIOS_PLAN.find((x) => x.id === a.dataset.id);
      if (!sc) break;
      ETAT.plan = planDe(sc); ETAT.planForm.ouvert = false; ecrire();
      if (!majZonesPlan()) rendre(true);
      toast('Scénario « ' + sc.lib + ' » : fin avril ' + eur(calculPlan().fin * 100) + '.');
      break;
    }
    case 'plan-defaut': ETAT.plan = planDefaut(); ETAT.planForm.ouvert = false; ecrire(); if (!majZonesPlan()) rendre(true); toast('Plan de départ rétabli.'); break;
    case 'plan-ajout': {
      ETAT.planForm.ouvert = true;
      const m = $('#plan-mvts'); if (m) m.innerHTML = htmlMvtsPlan();
      const c = $('#mp-lib'); if (c) c.focus({ preventScroll: true });
      break;
    }
    case 'plan-ajout-annuler': { ETAT.planForm.ouvert = false; const m = $('#plan-mvts'); if (m) m.innerHTML = htmlMvtsPlan(); break; }
    case 'plan-idee': {
      const x = IDEES_MVT[+a.dataset.i];
      if (!x || ETAT.plan.mouvements.length >= 8) break;
      ETAT.plan.mouvements.push(Object.assign({ id: 'm' + Date.now().toString(36) }, x));
      majPlan();
      toast('Ajouté au plan : ' + x.lib + '.');
      break;
    }
    case 'plan-retirer': {
      const m = ETAT.plan.mouvements.find((x) => x.id === a.dataset.id);
      ETAT.plan.mouvements = ETAT.plan.mouvements.filter((x) => x.id !== a.dataset.id);
      majPlan();
      if (m) toast('Retiré du plan : ' + m.lib + '.');
      break;
    }
    case 'jour': {
      const i = Z.findIndex((z) => z.date === ETAT.caisse.jour);
      const p = +a.dataset.pas;
      ETAT.caisse.jour = p === 0 ? AUJ : Z[Math.min(Z.length - 1, Math.max(0, i + p))].date;
      rendre(true);
      break;
    }
    case 'alerte': {
      const al = construireAlertes().find((x) => x.id === a.dataset.id);
      if (!al) break;
      if (al.facture) { ouvrirFacture(al.facture); break; }
      if (al.jour) { ETAT.caisse.jour = al.jour; ETAT.caisse.annules = 'jour'; }
      if (al.id === 'fdj-ecart') { ETAT.jeux.semaine = '2026-10-05'; ETAT.fdj.semaine = '2026-10-05'; ETAT.fdj.ops = true; }
      if (al.id === 'fraise') ETAT.stock.onglet = 'commande';
      if (al.id === 'vanille') { ETAT.stock.onglet = 'vape'; ETAT.stock.statut = 'tous'; ETAT.stock.q = ''; }
      ETAT.detail[al.module] = true;
      aller(al.module, al.onglet);
      break;
    }
    case 'traiter': ETAT.traitees[a.dataset.id] = true; ecrire(); rendre(true); toast('Marqué comme traité.'); break;
    case 'export': fermerTout(); exporter(a.dataset.cle, a.dataset.format); break;
    case 'copier-commande': copierCommande(); break;
    case 'fdj-sem': ETAT.fdj.semaine = ajoute(ETAT.fdj.semaine || lundiDe(AUJ), 7 * +a.dataset.pas); ETAT.fdj.jour = null; rendre(true); break;
    case 'fdj-jour': ETAT.fdj.jour = a.dataset.jour || null; rendre(true); break;
    case 'fdj-ops': ETAT.fdj.ops = !ETAT.fdj.ops; rendre(true); break;
    case 'fdj-semaine': {
      ETAT.fdj.semaine = a.dataset.semaine; ETAT.fdj.jour = null; rendre(true);
      const b = $('#fdj-semaine');
      if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    }
    case 'vers-plan': { const c = $('#sec-plan'); if (c) c.scrollIntoView({ behavior: mouvementReduit() ? 'auto' : 'smooth', block: 'start' }); break; }
    case 'detail': {
      ETAT.detail[ETAT.route] = !ETAT.detail[ETAT.route];
      rendre(true);
      const d = $('#detail');
      if (d && ETAT.detail[ETAT.route]) d.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    }
  }
});
document.addEventListener('keydown', (e) => {
  const k = e.key;
  if ((e.metaKey || e.ctrlKey) && k.toLowerCase() === 'k' && ETAT.connecte) { e.preventDefault(); ouvrirPalette(); return; }
  if (k === 'Escape') { fermerTout(); return; }
  if (e.target.id === 'pal-q') {
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault();
      PAL_I = Math.max(0, Math.min(PAL.length - 1, PAL_I + (k === 'ArrowDown' ? 1 : -1)));
      $$('.pal-item').forEach((x, i) => x.classList.toggle('actif', i === PAL_I));
      const act = $('.pal-item.actif');
      if (act) act.scrollIntoView({ block: 'nearest' });
    }
    if (k === 'Enter') { e.preventDefault(); choisirPalette(PAL_I); }
    return;
  }
  if ((k === 'Enter' || k === ' ') && e.target.matches && e.target.matches('.facture-l, .papier.lien, tr[data-action]')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset.tache) {
    ETAT.faits[t.dataset.tache] = t.checked; ecrire();
    const g = t.closest('.geste, .tache');
    if (g) g.classList.toggle('faite', t.checked);
    const gp = $('#gestes-pied'); if (gp) gp.outerHTML = progresGestes();
    toast(t.checked ? 'C’est noté : ' + (TACHES.find((x) => x.id === t.dataset.tache) || {}).lib + '.' : 'Remis à faire.');
    return;
  }
  if (t.dataset.commande) { ETAT.commande[t.dataset.commande] = Math.max(0, Math.round(+t.value || 0)); ecrire(); rendre(true); return; }
  if (t.id === 'curseur-salaire') { ETAT.plan.salaire = +t.value; majPlan(); return; }
  if (t.id === 'curseur-agencement') { ETAT.plan.agencementHT = +t.value; majPlan(); return; }
  if (t.id === 'plan-date') { ETAT.plan.lecture = +t.value; ecrire(); return; }
  if (t.tagName === 'SELECT' && t.dataset.filtre) {
    const [o, k] = t.dataset.filtre.split('.');
    ETAT[o][k] = o === 'resultat' && k === 'mois' && /^\d+$/.test(t.value) ? +t.value : t.value;
    if (o === 'mvt') ETAT.mvt.n = 60;
    rendre(true);
  }
});
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'pal-q') { majPalette(t.value); return; }
  if (t.id === 'compte-caisse') { majComptage(t.value); return; }
  if (t.id === 'curseur-salaire') {
    ETAT.plan.salaire = +t.value;
    t.style.setProperty('--p', (ETAT.plan.salaire / 4000 * 100) + '%');
    const lib = $('#salaire-lib');
    if (lib) lib.textContent = ETAT.plan.salaire ? eur(ETAT.plan.salaire * 100) + ' par mois' : 'aucun salaire';
    majZonesPlan(false);
    return;
  }
  if (t.id === 'curseur-agencement') {
    ETAT.plan.agencementHT = +t.value;
    t.style.setProperty('--p', ((ETAT.plan.agencementHT - 20000) / 400) + '%');
    $$('.ag-ht').forEach((x) => { x.textContent = eur(ETAT.plan.agencementHT * 100); });
    const n = $('#note-agencement'); if (n) n.innerHTML = noteAgencement(ETAT.plan);
    majZonesPlan(false);
    return;
  }
  if (t.id === 'plan-date') { ETAT.plan.lecture = +t.value; placerLecture(ETAT.plan.lecture); return; }
  if (t.dataset && t.dataset.pfi) { ETAT.planForm[t.dataset.pfi] = t.value; const er = $('#mp-erreur'); if (er) er.hidden = true; return; }
  if (t.tagName === 'INPUT' && t.dataset.filtre) {
    const [o, k] = t.dataset.filtre.split('.');
    ETAT[o][k] = t.value;
    if (o === 'mvt') { ETAT.mvt.n = 60; $('#zone-mvt').innerHTML = htmlTableMouvements(); }
    if (o === 'fact') $('#zone-fact').innerHTML = htmlListeFactures();
    if (o === 'stock') { const pos = t.selectionStart; rendre(true); const n = $('#q-vape'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
  }
});
document.addEventListener('submit', (e) => {
  if (e.target.id === 'cx-form') { e.preventDefault(); seConnecter(); }
  if (e.target.id === 'form-compte') e.preventDefault();
  if (e.target.id === 'form-plan-mvt') { e.preventDefault(); ajouterMouvementPlan(); }
  if (e.target.id === 'as-form') { e.preventDefault(); const q = $('#as-q'); if (q && q.value.trim()) { poserQuestion(q.value); q.value = ''; } }
});
try {
  const mqTel = window.matchMedia('(max-width: 760px)');
  const auChangement = () => { if (ETAT.connecte) rendre(true); };
  if (mqTel.addEventListener) mqTel.addEventListener('change', auChangement); else if (mqTel.addListener) mqTel.addListener(auChangement);
} catch (e) { /* sans matchMedia */ }
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (ETAT.connecte && ROUTE[h] && h !== ETAT.route) aller(h); });

function copierCommande() {
  const l = D.refs.filter((r) => r.statut === 'À recommander');
  const txt = 'Commande de jeudi, ' + D.meta.tabac + '\n' + l.map((r) => {
    const q = ETAT.commande[r.code] != null ? ETAT.commande[r.code] : quantiteCommande(r);
    return q ? r.code + '\t' + r.designation + '\t' + q : null;
  }).filter(Boolean).join('\n');
  const repli = () => ouvrirModale('<h2>Commande de jeudi</h2><p class="discret">Sélectionnez le texte puis copiez-le.</p><textarea readonly>' + esc(txt) + '</textarea><div class="pied"><button class="bouton" type="button" data-action="fermer">Fermer</button></div>');
  try {
    navigator.clipboard.writeText(txt).then(() => toast('Commande copiée : collez-la dans votre mail ou sur le site Logista.'), repli);
  } catch (err) { repli(); }
}
