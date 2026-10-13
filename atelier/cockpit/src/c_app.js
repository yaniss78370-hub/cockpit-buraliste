/* ------------------------------------------------------------------ coque : rail, barre, onglets du bas */
const NAV_BAS = ['cockpit', 'caisse', 'fdj', 'tresorerie'];
function htmlRail() {
  return '<a class="marque" href="#cockpit" data-action="aller" data-route="cockpit" aria-label="Cockpit Buraliste, vue d’ensemble">' + LOGO + '<span><b>Cockpit</b> Buraliste</span></a>' +
    '<div class="tabac"><span class="tabac-nom">' + esc(D.meta.tabac) + '</span><span class="tabac-sous">Tabac, presse, jeux · Julien, gérant</span><span class="tabac-test">' + ic('info') + 'Données d’exemple</span></div>' +
    '<nav class="nav" aria-label="Pages du cockpit"><div class="nav-groupe">' + ROUTES.map((r, i) =>
      (i > 0 && r.groupe !== ROUTES[i - 1].groupe ? '</div><div class="nav-groupe"><span class="nav-titre">' + r.groupe + '</span>' : '') +
      '<a href="#' + r.id + '" data-action="aller" data-route="' + r.id + '"' + (ETAT.route === r.id ? ' aria-current="page"' : '') + '>' + ic(r.ic) + '<span>' + r.titre + '</span>' +
      '</a>').join('') + '</div></nav>' +
    '<div class="rail-pied"><button class="bouton" type="button" data-action="menu-export">' + ic('export') + '<span>Exporter</span></button>' +
    '<button class="bouton" type="button" data-action="deconnexion">' + ic('sortie') + '<span>Se déconnecter</span></button>' +
    '<p>Les chiffres, les noms et les situations présentés sont des exemples. <a href="https://cockpit-buraliste.fr" target="_blank" rel="noopener">cockpit-buraliste.fr</a></p></div>';
}
function htmlBarre() {
  const r = ROUTE[ETAT.route];
  const plan = calculPlan();
  return '<div class="barre-titre"><h1>' + r.titre + '</h1><p>' + r.sous() + '</p></div>' +
    '<div class="recherche" role="search"><svg class="ic" aria-hidden="true"><use href="#i-loupe"/></svg><input class="champ" type="search" id="recherche" placeholder="Facture, produit, montant…" autocomplete="off" aria-label="Rechercher dans le cockpit"><div class="resultats" id="resultats" hidden></div></div>' +
    '<span class="ciel ' + (plan.niveau === 'ok' ? '' : plan.niveau) + '" title="Plan de vol à six mois">' + ic(plan.niveau === 'ok' ? 'soleil' : 'nuage') + '<span class="ciel-txt">' + plan.ciel + '</span></span>' +
    '<button class="bouton plein" type="button" data-action="menu-export">' + ic('export') + '<span class="txt-export">Exporter</span></button>';
}
function htmlOngletsBas() {
  const tous = NAV_BAS.map((id) => ROUTE[id]);
  const plus = !NAV_BAS.includes(ETAT.route);
  return tous.map((r) => '<button type="button" data-action="aller" data-route="' + r.id + '"' + (ETAT.route === r.id ? ' aria-current="page"' : '') + '>' + ic(r.ic) + '<span>' + r.titre + '</span></button>').join('') +
    '<button type="button" data-action="plus"' + (plus ? ' aria-current="page"' : '') + '>' + ic('plus') + '<span>Plus</span></button>';
}
const LOGO = '<svg class="jauge-logo" viewBox="0 0 40 40" aria-hidden="true"><path class="arc-fond" d="M8.5 26.5a11.5 11.5 0 0 1 23 0"/><path class="arc-vert" d="M8.5 26.5a11.5 11.5 0 0 1 7.4-10.75"/><path class="aiguille" d="M20 12.2l2.5 9.3-2.5 5-2.5-5z" transform="rotate(36 20 26.5)"/><circle class="moyeu" cx="20" cy="26.5" r="2.4"/></svg>';

/* ------------------------------------------------------------------ connexion (démonstration) */
function htmlConnexion() {
  return '<div class="cx-ciel" aria-hidden="true"></div><div class="cx-boite">' +
    '<a class="marque" href="https://cockpit-buraliste.fr" target="_blank" rel="noopener">' + LOGO + '<span><b>Cockpit</b> Buraliste</span></a>' +
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
    afficher();
  }, 650);
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
  if (!ETAT.connecte) {
    $('#connexion').innerHTML = htmlConnexion();
    return;
  }
  rendre();
}
function rendre(garderDefilement = false) {
  const y = window.scrollY;
  $('#rail').innerHTML = htmlRail();
  $('#barre').innerHTML = htmlBarre();
  $('#onglets-bas').innerHTML = htmlOngletsBas();
  $('#vue').innerHTML = VUES[ETAT.route]() + '<footer class="pied-page"><span>Cockpit Buraliste · version test · ' + esc(D.meta.tabac) + ' · données au mardi 13 octobre 2026, 21 h 04</span><span>Les chiffres, les noms et les situations présentés sont des exemples.</span></footer>';
  document.title = ROUTE[ETAT.route].titre + ' · Cockpit Buraliste';
  if (garderDefilement) window.scrollTo(0, y);
}
function aller(route, onglet) {
  if (!ROUTE[route]) route = 'cockpit';
  const change = route !== ETAT.route;
  ETAT.route = route;
  if (onglet && route === 'tresorerie') ETAT.tabTreso = onglet;
  if (onglet) ETAT.detail[route] = true;
  fermerTout();
  try { if (location.hash !== '#' + route) history.replaceState(null, '', '#' + route); } catch (e) { /* adresse figée */ }
  rendre();
  if (change || onglet) window.scrollTo(0, 0);
}

/* ------------------------------------------------------------------ tiroir, modale, message */
function fermerTout() {
  $$('.voile, .tiroir, .modale, .feuille').forEach((x) => x.remove());
}
function ouvrirTiroir(titre, sous, corps) {
  fermerTout();
  document.body.insertAdjacentHTML('beforeend', '<div class="voile" data-action="fermer"></div><aside class="tiroir" role="dialog" aria-modal="true" aria-label="' + esc(titre) + '"><div class="tiroir-tete"><div><h2>' + esc(titre) + '</h2>' + (sous ? '<p>' + sous + '</p>' : '') + '</div><button class="bouton petit" type="button" data-action="fermer" aria-label="Fermer">' + ic('croix') + '</button></div><div class="tiroir-corps">' + corps + '</div></aside>');
  const b = $('.tiroir .bouton');
  if (b) b.focus();
}
function ouvrirModale(html) {
  fermerTout();
  document.body.insertAdjacentHTML('beforeend', '<div class="voile" data-action="fermer"></div><div class="modale" role="dialog" aria-modal="true">' + html + '</div>');
}
let minuterieToast = null;
function toast(txt) {
  $$('.toast').forEach((x) => x.remove());
  document.body.insertAdjacentHTML('beforeend', '<div class="toast" role="status">' + esc(txt) + '</div>');
  clearTimeout(minuterieToast);
  minuterieToast = setTimeout(() => $$('.toast').forEach((x) => x.remove()), 3600);
}
function menuExport() {
  const items = [
    ['classeur', 'xlsx', 'Tout le cockpit', 'Un classeur Excel : banques, factures et lignes, caisse depuis janvier, jeux, stock, compte de résultat, plan de vol, charges fixes.'],
    ['pack', 'pdf', 'Pack de septembre pour le comptable', 'L’essentiel du mois en PDF : résultat par rayon, trésorerie, contrôles et points d’attention.'],
    ['mouvements', 'csv', 'Mouvements bancaires', 'Les trois comptes, du 8 juillet au 13 octobre, et la semaine prévue.'],
    ['factures', 'xlsx', 'Factures, ligne par ligne', 'Chaque facture et chacune de ses lignes, rangées par famille.'],
  ];
  ouvrirModale('<h2>Exporter</h2><p class="discret">Les fichiers reprennent les données d’exemple du tabac « Le Balto ».</p><div class="liste-export">' +
    items.map(([cle, f, t, d]) => '<button type="button" class="export-l" data-action="export" data-cle="' + cle + '" data-format="' + f + '"><span class="puce-ic info">' + ic(f === 'pdf' ? 'pdf' : 'export') + '</span><span class="el-txt"><b>' + t + '</b><span>' + d + '</span></span><span class="el-f">' + f.toUpperCase() + '</span></button>').join('') +
    '</div><div class="pied"><button class="bouton" type="button" data-action="fermer">Fermer</button></div>');
}
function feuillePlus() {
  fermerTout();
  const autres = ROUTES.filter((r) => !NAV_BAS.includes(r.id));
  document.body.insertAdjacentHTML('beforeend', '<div class="voile" data-action="fermer"></div><div class="feuille" role="dialog" aria-modal="true" aria-label="Plus"><span class="poignee"></span>' +
    autres.map((r) => '<button type="button" data-action="aller" data-route="' + r.id + '">' + ic(r.ic) + '<span>' + r.titre + '</span>' + ic('fleche') + '</button>').join('') +
    '<button type="button" data-action="menu-export">' + ic('export') + '<span>Exporter</span>' + ic('fleche') + '</button>' +
    '<button type="button" data-action="deconnexion">' + ic('sortie') + '<span>Se déconnecter</span>' + ic('fleche') + '</button></div>');
}

/* ------------------------------------------------------------------ détails */
function detailMouvement(i) {
  const m = MVT[i];
  const f = m.facture ? FACT[m.facture] : null;
  const corps = '<dl class="fiche"><div><dt>Date</dt><dd>' + maj(dLong(m.date)) + (m.statut === 'prévu' ? ' (prévu)' : '') + '</dd></div><div><dt>Montant</dt><dd class="' + (m.montant < 0 ? 'negatif' : 'positif') + '">' + eur2(m.montant, true) + '</dd></div>' +
    '<div><dt>Compte</dt><dd>' + COMPTES[m.compte].nom + '</dd></div><div><dt>Catégorie</dt><dd>' + esc(m.categorie) + '</dd></div><div><dt>Contrepartie</dt><dd>' + esc(m.contrepartie) + '</dd></div><div><dt>Libellé bancaire</dt><dd class="mono">' + esc(m.libelle) + '</dd></div></dl>' +
    (m.note ? '<div class="encart info">' + ic('info') + '<div>' + esc(m.note) + '</div></div>' : '') +
    (f ? '<div class="encart ok">' + ic('coche') + '<div><b>Rapproché avec la facture ' + f.id + '.</b> ' + esc(f.fournisseur) + ', ' + esc(f.objet) + '.</div></div><div class="carte plate"><div class="carte-corps">' + htmlLecteur(f.id) + '</div></div>'
      : m.categorie === 'Encaissements CB' ? '<div class="encart info">' + ic('info') + '<div>Remise des ventes par carte de la veille, rapprochée du Z de caisse.</div></div>'
        : m.categorie === 'Dépôt d’espèces' ? '<div class="encart info">' + ic('info') + '<div>Espèces de la semaine, rapprochées des Z de caisse, gains payés au comptoir déduits.</div></div>' : '');
  ouvrirTiroir(m.contrepartie, esc(m.categorie), corps);
}
function ouvrirFacture(id) {
  ETAT.fact.choisie = id;
  const f = FACT[id];
  const versFactures = () => {
    ETAT.route = 'factures';
    try { history.replaceState(null, '', '#factures'); } catch (e) { /* adresse figée */ }
    rendre();
  };
  const majListe = () => {
    $$('.facture-l').forEach((x) => x.classList.toggle('choisie', x.dataset.id === id));
    const l = $('#lecteur .carte-corps');
    if (l) l.innerHTML = htmlLecteur(id);
  };
  if (!window.matchMedia('(max-width: 1240px)').matches) {
    // bureau : la facture s'ouvre dans le lecteur du détail
    if (ETAT.route === 'factures' && ETAT.detail.factures) { majListe(); return; }
    ETAT.detail.factures = true;
    versFactures();
    const d = $('#detail');
    if (d) d.scrollIntoView({ block: 'start' });
    return;
  }
  // tablette et téléphone : la facture s'ouvre dans un tiroir
  if (ETAT.route !== 'factures') { versFactures(); window.scrollTo(0, 0); } else majListe();
  ouvrirTiroir(f.fournisseur, esc(f.objet), htmlLecteur(id));
}

/* ------------------------------------------------------------------ recherche */
const INDEX = [].concat(
  D.factures.map((f) => ({ type: 'Facture', lib: f.fournisseur + ' · ' + f.objet, mt: f.ttc, cle: (f.fournisseur + ' ' + f.objet + ' ' + eur2(f.ttc) + ' ' + f.lignes.map((l) => l.d).join(' ')).toLowerCase(), go: () => ouvrirFacture(f.id) })),
  MVT.map((m) => ({ type: 'Banque', lib: dNum(m.date) + ' · ' + m.libelle, mt: m.montant, cle: (m.libelle + ' ' + m.contrepartie + ' ' + m.categorie + ' ' + eur2(m.montant)).toLowerCase(), go: () => { aller('tresorerie', 'mouvements'); detailMouvement(m.i); } })),
  D.refs.map((r) => ({ type: 'Vape', lib: r.designation + ' · stock ' + r.stock, mt: null, cle: (r.designation + ' ' + r.code).toLowerCase(), go: () => { ETAT.stock.onglet = 'vape'; ETAT.stock.q = r.designation; ETAT.stock.statut = 'tous'; ETAT.detail.stock = true; aller('stock'); } })),
  D.cbd_refs.map((r) => ({ type: 'CBD', lib: r.designation + ' · lot ' + r.lot, mt: null, cle: (r.designation + ' ' + r.lot).toLowerCase(), go: () => { ETAT.stock.onglet = 'cbd'; ETAT.detail.stock = true; aller('stock'); } })),
  ROUTES.map((r) => ({ type: 'Page', lib: r.titre, mt: null, cle: r.titre.toLowerCase(), go: () => aller(r.id) }))
);
let RES = [];
function chercher(q) {
  const box = $('#resultats');
  if (!box) return;
  q = q.trim().toLowerCase();
  if (q.length < 2) { box.hidden = true; return; }
  const mots = q.split(/\s+/);
  RES = INDEX.filter((x) => mots.every((m) => x.cle.includes(m))).slice(0, 12);
  box.innerHTML = RES.length ? RES.map((x, i) => '<button type="button" data-res="' + i + '"' + (i === 0 ? ' class="actif"' : '') + '><span class="r-type">' + x.type + '</span><span class="r-lib">' + esc(x.lib) + '</span>' + (x.mt != null ? '<span class="r-mt">' + eur2(x.mt) + '</span>' : '') + '</button>').join('') : '<div class="vide">Aucun résultat pour « ' + esc(q) + ' ».</div>';
  box.hidden = false;
}

/* ------------------------------------------------------------------ infobulles */
const BULLE = document.createElement('div');
BULLE.className = 'infobulle';
BULLE.setAttribute('role', 'tooltip');
document.body.appendChild(BULLE);
document.addEventListener('pointermove', (e) => {
  const t = e.target.closest && e.target.closest('[data-tip]');
  if (!t) { BULLE.style.opacity = '0'; return; }
  BULLE.innerHTML = t.getAttribute('data-tip');
  const w = BULLE.offsetWidth, h = BULLE.offsetHeight;
  let x = e.clientX + 14, y = e.clientY - h - 12;
  if (x + w > window.innerWidth - 8) x = e.clientX - w - 14;
  if (y < 8) y = e.clientY + 16;
  BULLE.style.left = x + 'px';
  BULLE.style.top = y + 'px';
  BULLE.style.opacity = '1';
}, { passive: true });
document.addEventListener('pointerleave', () => { BULLE.style.opacity = '0'; });

/* ------------------------------------------------------------------ événements */
function majPlan() {
  ecrire();
  $('#rail').innerHTML = htmlRail();
  if (!(ETAT.route === 'tresorerie' && ETAT.tabTreso === 'plan' && majZonesPlan())) rendre(true);
  $('#barre').innerHTML = htmlBarre();
}
document.addEventListener('click', (e) => {
  const res = e.target.closest('[data-res]');
  if (res) { const x = RES[+res.dataset.res]; $('#resultats').hidden = true; $('#recherche').value = ''; if (x) x.go(); return; }
  if (!e.target.closest('.recherche')) { const b = $('#resultats'); if (b) b.hidden = true; }
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
    }
    rendre(true);
    return;
  }
  const lev = e.target.closest('[data-levier]');
  if (lev) { const k = lev.dataset.levier; ETAT.plan[k] = !ETAT.plan[k]; lev.setAttribute('aria-checked', String(ETAT.plan[k])); majPlan(); return; }
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
    case 'deconnexion': seDeconnecter(); break;
    case 'plus-mvt': ETAT.mvt.n += 60; $('#zone-mvt').innerHTML = htmlTableMouvements(); break;
    case 'plan-defaut': ETAT.plan = Object.assign({}, PLAN_DEFAUT); ecrire(); rendre(true); break;
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
  if (e.key === 'Escape') { fermerTout(); const b = $('#resultats'); if (b) b.hidden = true; }
  if (e.key === 'Enter' && e.target.id === 'recherche' && RES[0]) { e.preventDefault(); $('#resultats').hidden = true; RES[0].go(); e.target.value = ''; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.facture-l')) { e.preventDefault(); ouvrirFacture(e.target.dataset.id); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('tr[data-action]')) { e.preventDefault(); e.target.click(); }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { const r = $('#recherche'); if (r) { e.preventDefault(); r.focus(); } }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset.tache) { ETAT.faits[t.dataset.tache] = t.checked; ecrire(); rendre(true); toast(t.checked ? 'C’est noté.' : 'Remis à faire.'); return; }
  if (t.dataset.commande) { ETAT.commande[t.dataset.commande] = Math.max(0, Math.round(+t.value || 0)); ecrire(); rendre(true); return; }
  if (t.id === 'curseur-salaire') { ETAT.plan.salaire = +t.value; majPlan(); return; }
  if (t.tagName === 'SELECT' && t.dataset.filtre) {
    const [o, k] = t.dataset.filtre.split('.');
    ETAT[o][k] = o === 'resultat' && k === 'mois' && /^\d+$/.test(t.value) ? +t.value : t.value;
    if (o === 'mvt') ETAT.mvt.n = 60;
    rendre(true);
  }
});
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'recherche') { chercher(t.value); return; }
  if (t.id === 'compte-caisse') { majComptage(t.value); return; }
  if (t.id === 'curseur-salaire') {
    ETAT.plan.salaire = +t.value;
    const lib = $('#salaire-lib');
    if (lib) lib.textContent = ETAT.plan.salaire ? eur(ETAT.plan.salaire * 100) + ' par mois' : 'aucun salaire';
    majZonesPlan();
    $('#barre').innerHTML = htmlBarre();
    return;
  }
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
});
try {
  const mqTel = window.matchMedia('(max-width: 760px)');
  const auChangement = () => { if (ETAT.connecte) rendre(true); };
  if (mqTel.addEventListener) mqTel.addEventListener('change', auChangement); else if (mqTel.addListener) mqTel.addListener(auChangement);
} catch (e) { /* sans matchMedia : graphiques à la largeur du bureau */ }
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
