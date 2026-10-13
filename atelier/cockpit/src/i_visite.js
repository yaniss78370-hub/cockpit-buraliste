/* ==================================================================
   La visite guidée. À la connexion, la voix du film, avec ses sous-titres, prend la main une minute :
   l'accueil, la caisse, la FDJ, le plan de vol, l'assistant. Puis elle rend les commandes.
   Pause, son, fermeture : à tout moment. Elle se revoit depuis le menu.
   ================================================================== */
const VOIX_SRC = /*VOIX*/{};   // le son de chaque étape, ajouté à la construction (fichiers du site ou données intégrées)
const SANS_VISITE = /[?&]sans-visite/.test(location.search);

// chaque étape : sa page, ce qu'on éclaire, ses sous-titres [début en s, texte], ses gestes [moment en s, action]
const ETAPES_VISITE = [
  { id: 1, chap: 0, route: 'cockpit', haut: true, d: 8.93,
    st: [[0.08, 'Bonsoir, et bienvenue au Balto, notre tabac d’exemple.'], [3.8, 'En une minute, je vous montre ce que le cockpit fait pour vous.'], [7.04, 'Ensuite, c’est à vous.']] },
  { id: 2, chap: 0, route: 'cockpit', haut: true, cible: '.heros', d: 12.33,
    st: [[0.78, 'Chaque soir, à 21 heures, il lit votre caisse,'], [3.74, 'vos banques, la FDJ et Logista.'], [6.5, 'Et il vous dit où vous atterrissez lundi, après la facture tabac :'], [10.02, '47 380 €.']],
    puis: [[9.85, () => viserVisite('.heros .h-montant')]] },
  { id: 3, chap: 0, route: 'cockpit', cible: '.heros .vraiment', d: 5.64,
    st: [[0.48, 'Dont 37 520 € vraiment à vous.'], [3.44, 'Le reste attend d’être reversé.']] },
  { id: 4, chap: 0, route: 'cockpit', cible: '.col-gestes .papier', d: 6.9,
    st: [[0.56, 'Vos gestes de la semaine sont prêts :'], [2.29, 'le virement à faire, le compte FDJ à alimenter,'], [5.36, 'les espèces à verser.']] },
  { id: 5, chap: 1, route: 'caisse', haut: true, cible: '.heros', d: 7.24,
    st: [[0.47, 'Côté caisse, vous savez au centime'], [2.37, 'ce qu’elle doit contenir depuis la dernière collecte.'], [4.73, 'Vous comptez, il vous dit si c’est juste.']],
    puis: [[4.2, () => taperVisite('#compte-caisse', montantCaisseV())]] },
  { id: 6, chap: 2, route: 'fdj', haut: true, cible: '.heros', d: 8.46,
    st: [[0.47, 'Côté jeux, le prélèvement FDJ de mercredi est connu d’avance.'], [4.33, 'Et celui de la semaine en cours se calcule chaque soir,'], [6.89, 'rubrique par rubrique.']],
    puis: [[4.1, () => viserVisite('#fdj-semaine', true)]] },
  { id: 7, chap: 3, route: 'tresorerie', defiler: '#sec-plan', cible: '#plan', defilerTel: '.plan-carte', cibleTel: '.plan-carte', d: 10.27,
    st: [[0.51, 'Avant une décision, vous voyez son effet sur six mois.'], [3.42, 'Embaucher, agrandir le rayon CBD, refaire l’agencement :'], [7.15, 'vous choisissez le mois, la courbe se recalcule.']],
    puis: [[3.3, () => cliquerVisite('[data-action="plan-scenario"][data-id="investir"]')], [7.35, () => cliquerVisite('[data-plan="embaucheMois"][data-v="3"]')]] },
  { id: 8, chap: 4, avant: () => ouvrirAssistant(), cible: '.assistant', bas: 'gauche', d: 5.2,
    st: [[0.29, 'Une question, à n’importe quelle heure ?'], [2.16, 'Posez-la.'], [2.88, 'Il vous répond avec vos chiffres.']],
    puis: [[1.6, () => poserQuestion('Combien on a fait aujourd’hui ?')]] },
  { id: 9, chap: 5, avant: () => fermerTout(), route: 'cockpit', haut: true, d: 6.48,
    st: [[0.25, 'Voilà. Le cockpit est à vous : touchez ce que vous voulez.'], [3.95, 'Et pour votre tabac, demandez-nous une démonstration.']] },
];
const CHAPITRES_VISITE = ['Accueil', 'Caisse', 'FDJ', 'Plan de vol', 'Assistant'];

const VT = { actif: false, fini: false, i: -1, jeton: 0, pret: false, pause: false, muet: false, son: false, prelance: false, minuterie: true,
  t0: 0, tPause: 0, faits: null, cible: null, geo: null, raf: 0, chunk: -1, avant: null, cache: [] };
let VA = null;   // le lecteur, un seul : débloqué par le clic du visiteur, il enchaîne ensuite les étapes
try { VT.muet = localStorage.getItem('cockpit-visite-muet') === '1'; } catch (e) { /* stockage indisponible */ }
const reduitV = () => mouvementReduit();
const telV = () => window.innerWidth < 761;
const dormirV = (ms) => new Promise((r) => setTimeout(r, ms));
function sauverMuetV() { try { localStorage.setItem('cockpit-visite-muet', VT.muet ? '1' : '0'); } catch (e) { /* stockage indisponible */ } }

/* ------------------------------------------------------------------ la voix */
// elle démarre dans le geste du visiteur (son clic), sinon le navigateur la bloque
function lancerVoixV(id) {
  if (!VOIX_SRC[id]) { VT.son = false; VT.prelance = false; return; }
  try {
    if (!VA) { VA = new Audio(); VA.preload = 'auto'; }
    VA.onended = null;
    VA.muted = VT.muet;
    VA.src = VOIX_SRC[id];
    VT.son = true; VT.prelance = true;
    const p = VA.play();
    if (p && p.catch) p.catch(() => sonRefuseV());
  } catch (e) { sonRefuseV(); }
}
// le navigateur a refusé le son : la visite continue en sous-titres, au même rythme
function sonRefuseV() {
  VT.son = false; VT.prelance = false;
  if (VT.actif && !VT.minuterie) {
    VT.minuterie = true;
    VT.t0 = performance.now() - ((VA && VA.currentTime) || 0) * 1000;
    if (VT.pause) VT.tPause = performance.now();
  }
  majSonV();
}
function activerVoixV() {
  const e = ETAPES_VISITE[VT.i];
  if (!e || !VOIX_SRC[e.id]) return;
  if (!VA) { VA = new Audio(); VA.preload = 'auto'; }
  const t = tempsVisite(), j = VT.jeton;
  VA.onended = () => { if (j === VT.jeton && !VT.pause) finEtapeVisite(j); };
  VA.muted = false;
  VA.src = VOIX_SRC[e.id];
  const ok = () => {
    if (j !== VT.jeton || !VT.actif) { try { VA.pause(); } catch (err) { /* */ } return; }
    try { VA.currentTime = Math.min(t, e.d - 0.2); } catch (err) { /* pas encore prêt */ }
    VT.son = true; VT.minuterie = false;
    if (VT.pause) VA.pause();
    majSonV();
  };
  const p = VA.play();
  if (p && p.then) p.then(ok, () => {}); else ok();
}
function prechargerV() {
  if (VT.cache.length) return;
  Object.keys(VOIX_SRC).forEach((id) => {
    const s = VOIX_SRC[id];
    if (!s || /^data:/.test(s)) return;
    try { const a = new Audio(); a.preload = 'auto'; a.src = s; VT.cache.push(a); } catch (e) { /* sans préchargement */ }
  });
}
function preparerVisite() { if (!SANS_VISITE) lancerVoixV(1); }

/* ------------------------------------------------------------------ la visite */
function demarrerVisite(o = {}) {
  if (SANS_VISITE) return;
  if (VT.actif) fermerVisite();
  fermerTout();
  if (!o.depuisConnexion) lancerVoixV(1);   // relancée d'un clic : ce clic débloque aussi la voix
  VT.actif = true; VT.fini = false; VT.pause = false; VT.i = -1; VT.cible = null; VT.geo = null;
  VT.avant = { plan: JSON.stringify(ETAT.plan), compte: ETAT.compte || '', fil: AS.fil.length };
  prechargerV();
  monterVisite();
  document.body.classList.add('en-visite');
  cancelAnimationFrame(VT.raf);
  VT.raf = requestAnimationFrame(boucleVisite);
  allerEtape(0);
}

function monterVisite() {
  const ancien = $('#visite'); if (ancien) ancien.remove();
  const chaps = CHAPITRES_VISITE.map((c, k) => '<span class="vi-chap" data-k="' + k + '"><span>' + c + '</span><b><i></i></b></span>').join('');
  document.body.insertAdjacentHTML('beforeend', '<div class="visite" id="visite" role="region" aria-label="Visite guidée du cockpit">' +
    '<div class="vi-capte" data-vi="pause" aria-hidden="true"></div><div class="vi-voile" id="vi-voile" aria-hidden="true"></div>' +
    '<div class="vi-bas"><p class="vi-st" id="vi-st"></p>' +
    '<div class="vi-barre"><span class="vi-nom"><span class="vi-onde" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="vi-nom-txt">Visite guidée</span></span>' +
    '<button class="vi-btn" type="button" data-vi="pause" id="vi-pause" aria-label="Mettre en pause" title="Pause">' + ic('pause') + '</button>' +
    '<button class="vi-btn vi-son" type="button" data-vi="son" id="vi-son"></button>' +
    '<span class="vi-chaps" aria-hidden="true">' + chaps + '</span>' +
    '<button class="vi-fermer" type="button" data-vi="fermer"><span>Fermer</span>' + ic('croix') + '</button></div></div></div>');
  $('#visite').addEventListener('click', clicVisite);
  majSonV();
}

function clicVisite(e) {
  const b = e.target.closest('[data-vi]');
  if (!b) return;
  e.preventDefault(); e.stopPropagation();
  const a = b.dataset.vi;
  if (a === 'fermer' || a === 'explorer' || (a === 'pause' && VT.fini)) fermerVisite();
  else if (a === 'pause') basculerPauseVisite();
  else if (a === 'son') boutonSonV();
  else if (a === 'revoir') demarrerVisite();
}

// le temps de l'étape : celui de la voix quand elle parle, sinon une horloge (sans le son, ou son refusé)
function tempsVisite() {
  if (!VT.minuterie && VT.son && VA) return VA.currentTime || 0;
  return murVisite();
}
function murVisite() { return ((VT.pause ? VT.tPause : performance.now()) - VT.t0) / 1000; }

async function allerEtape(i) {
  const j = ++VT.jeton;
  const e = ETAPES_VISITE[i];
  if (!e) { finVisite(); return; }
  VT.i = i; VT.faits = new Set(); VT.chunk = -1; VT.pret = false;
  const vis = $('#visite');
  if (vis) vis.classList.toggle('bas-gauche', e.bas === 'gauche');
  majChapitresV(0);
  if (i > 0) { const st = $('#vi-st'); if (st) st.innerHTML = ''; }
  if (e.avant) e.avant();
  if (e.route && ETAT.route !== e.route) { aller(e.route); await dormirV(reduitV() ? 120 : 450); if (j !== VT.jeton) return; }
  else if (i > 0) { await dormirV(120); if (j !== VT.jeton) return; }
  const tel = telV();
  const sel = (tel && e.cibleTel) || e.cible, dsel = (tel && e.defilerTel) || e.defiler;
  let bouge = false;
  if (e.haut) { if (window.scrollY > 4) { window.scrollTo({ top: 0, behavior: reduitV() ? 'auto' : 'smooth' }); bouge = true; } }
  else { const el = $(dsel || sel); if (el) bouge = amenerVisite(el, !!dsel); }
  if (bouge) { await dormirV(reduitV() ? 60 : 380); if (j !== VT.jeton) return; }
  while (VT.pause) { await dormirV(120); if (j !== VT.jeton) return; }
  VT.cible = sel ? $(sel) : null;
  lancerSonEtape(i, j);
}

function lancerSonEtape(i, j) {
  const e = ETAPES_VISITE[i];
  VT.t0 = performance.now(); VT.tPause = VT.t0;
  VT.minuterie = !(VA && VT.son && VOIX_SRC[e.id]);
  if (!VT.minuterie) {
    VA.onended = () => { if (j === VT.jeton && !VT.pause) finEtapeVisite(j); };
    VA.muted = VT.muet;
    if (!(i === 0 && VT.prelance)) {
      VA.src = VOIX_SRC[e.id];
      const p = VA.play();
      if (p && p.catch) p.catch(() => { if (j === VT.jeton) sonRefuseV(); });
    }
  }
  VT.prelance = false;
  VT.pret = true;
  majSonV();
}

async function finEtapeVisite(j) {
  if (j !== VT.jeton || !VT.actif || !VT.pret) return;
  VT.pret = false;
  await dormirV(240);
  while (VT.pause && j === VT.jeton) await dormirV(120);
  if (j === VT.jeton && VT.actif) allerEtape(VT.i + 1);
}

// à chaque image : sous-titres, gestes, progression, et le projecteur qui suit sa cible
function boucleVisite() {
  if (!VT.actif) return;
  const e = ETAPES_VISITE[VT.i];
  if (e && VT.pret) {
    const t = tempsVisite();
    sousTitresV(e, t);
    (e.puis || []).forEach((p, n) => { if (!VT.faits.has(n) && t >= p[0]) { VT.faits.add(n); try { p[1](); } catch (err) { /* geste manqué : la visite continue */ } } });
    majChapitresV(Math.min(1, t / e.d));
    if (!VT.pause) {
      if (VT.minuterie) { if (t >= e.d) finEtapeVisite(VT.jeton); }
      else if (murVisite() > e.d + 4) finEtapeVisite(VT.jeton);   // la voix a calé : on n'attend pas plus
    }
  }
  placerVoileV();
  VT.raf = requestAnimationFrame(boucleVisite);
}

function sousTitresV(e, t) {
  const st = $('#vi-st');
  if (!st) return;
  let k = 0;
  e.st.forEach((c, n) => { if (t >= c[0] - 0.05) k = n; });
  if (k !== VT.chunk) {
    VT.chunk = k;
    st.innerHTML = '<span class="vi-st-l">' + e.st[k][1].split(' ').map((m) => '<span class="vm">' + esc(m) + '</span>').join(' ') + '</span>';
  }
  const l = st.firstElementChild;
  if (!l) return;
  const debut = e.st[k][0], fin = k + 1 < e.st.length ? e.st[k + 1][0] : e.d - 0.3;
  const mots = l.children, n = mots.length;
  const f = Math.max(0, Math.min(1, (t - debut) / Math.max(0.3, (fin - debut) * 0.88)));
  const dits = f >= 1 ? n : Math.ceil(f * n);
  for (let m = 0; m < n; m++) { const d = m < dits; if (mots[m].classList.contains('dit') !== d) mots[m].classList.toggle('dit', d); }
}

function majChapitresV(f) {
  const e = ETAPES_VISITE[VT.i];
  if (!e) return;
  const meme = ETAPES_VISITE.filter((x) => x.chap === e.chap);
  const total = meme.reduce((s, x) => s + x.d, 0) || 1;
  const avant = meme.slice(0, meme.indexOf(e)).reduce((s, x) => s + x.d, 0);
  const part = (avant + f * e.d) / total;
  $$('#visite .vi-chap').forEach((c) => {
    const k = +c.dataset.k;
    c.classList.toggle('on', k === e.chap);
    c.classList.toggle('vu', k < e.chap);
    const b = c.querySelector('i');
    if (b) b.style.transform = 'scaleX(' + (k < e.chap ? 1 : k === e.chap ? part : 0).toFixed(3) + ')';
  });
}

function placerVoileV() {
  const v = $('#vi-voile');
  if (!v) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  let cible = null;
  if (VT.cible && document.body.contains(VT.cible)) {
    const r = VT.cible.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      const m = 10, haut = telV() ? 68 : 80;
      const ob = telV() ? $('#onglets-bas') : null, bas = ob && !ob.hidden ? ob.getBoundingClientRect().top - 8 : vh - 6;
      const x = Math.max(6, r.left - m), y = Math.max(haut, r.top - m);
      const x2 = Math.min(vw - 6, r.right + m), y2 = Math.min(bas, r.bottom + m);
      if (x2 - x > 24 && y2 - y > 24) cible = { x, y, w: x2 - x, h: y2 - y };
    }
  }
  const on = !!cible;
  if (!cible) cible = VT.geo && VT.geo.w > 0 ? { x: VT.geo.x + VT.geo.w / 2, y: VT.geo.y + VT.geo.h / 2, w: 0, h: 0 } : { x: vw / 2, y: vh * 0.42, w: 0, h: 0 };
  const g = VT.geo || cible;
  const k = reduitV() ? 1 : 0.18;
  VT.geo = { x: g.x + (cible.x - g.x) * k, y: g.y + (cible.y - g.y) * k, w: g.w + (cible.w - g.w) * k, h: g.h + (cible.h - g.h) * k };
  if (Math.abs(VT.geo.w) < 0.5) VT.geo.w = 0;
  if (Math.abs(VT.geo.h) < 0.5) VT.geo.h = 0;
  v.style.transform = 'translate(' + VT.geo.x.toFixed(1) + 'px,' + VT.geo.y.toFixed(1) + 'px)';
  v.style.width = VT.geo.w.toFixed(1) + 'px';
  v.style.height = VT.geo.h.toFixed(1) + 'px';
  if (v.classList.contains('on') !== on) v.classList.toggle('on', on);
}

// amène un élément dans la partie libre de l'écran (sous l'en-tête, au-dessus des sous-titres)
function amenerVisite(el, debut) {
  const r = el.getBoundingClientRect(), vh = window.innerHeight;
  const h0 = telV() ? 74 : 88, h1 = vh - (telV() ? 240 : 180);
  if (!debut && r.top >= h0 && r.bottom <= h1) return false;
  const y = (debut || r.height > h1 - h0) ? window.scrollY + r.top - h0 : window.scrollY + r.top - h0 - (h1 - h0 - r.height) / 2;
  const cible = Math.max(0, Math.round(y));
  if (Math.abs(cible - window.scrollY) < 4) return false;
  window.scrollTo({ top: cible, behavior: reduitV() ? 'auto' : 'smooth' });
  return true;
}
function viserVisite(sel, defiler) {
  const el = $(sel);
  if (!el) return;
  VT.cible = el;
  if (defiler) amenerVisite(el);
}
// le geste se voit : un rond ambré à l'endroit du clic
function montrerClicV(el) {
  const vis = $('#visite');
  if (!vis || reduitV()) return;
  const r = el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) return;
  const d = document.createElement('span');
  d.className = 'vi-clic';
  d.style.left = (r.left + r.width / 2).toFixed(0) + 'px';
  d.style.top = (r.top + r.height / 2).toFixed(0) + 'px';
  vis.appendChild(d);
  setTimeout(() => d.remove(), 900);
}
function cliquerVisite(sel) {
  const el = $(sel);
  if (!el) return;
  const c = VT.cible && document.body.contains(VT.cible) ? VT.cible : null, avant = c ? c.getBoundingClientRect().top : null;
  montrerClicV(el);
  el.click();
  // le contenu au-dessus a pu grandir : ce qu'on regarde reste à sa place à l'écran
  if (c && document.body.contains(c)) { const d = c.getBoundingClientRect().top - avant; if (Math.abs(d) > 2) window.scrollBy(0, d); }
}
function taperVisite(sel, texte) {
  const el = $(sel);
  if (!el) return;
  montrerClicV(el);
  el.value = '';
  const j = VT.jeton;
  [...texte].forEach((ch, n) => setTimeout(() => {
    if (j !== VT.jeton || !document.body.contains(el)) return;
    el.value += ch;
    if (n === texte.length - 1) el.dispatchEvent(new Event('input', { bubbles: true }));
  }, 80 + n * 95));
}
// le montant exact de la caisse ce soir : le comptage tombe juste
function montantCaisseV() {
  const a = Math.round(joursDepuisCollecte().reduce((s, x) => s + x.net, 0));
  return String(Math.floor(a / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + String(a % 100).padStart(2, '0');
}

/* ------------------------------------------------------------------ commandes */
function basculerPauseVisite() {
  if (!VT.actif || VT.fini) return;
  const vis = $('#visite');
  VT.pause = !VT.pause;
  if (VT.pause) {
    VT.tPause = performance.now();
    if (VA && !VT.minuterie) VA.pause();
    if (vis && !$('.vi-reprise', vis)) vis.insertAdjacentHTML('beforeend', '<button class="vi-reprise" type="button" data-vi="pause">' + ic('lecture') + '<span>Reprendre la visite</span></button>');
  } else {
    VT.t0 += performance.now() - VT.tPause;
    if (VA && !VT.minuterie && VT.pret && !VA.ended) { const p = VA.play(); if (p && p.catch) p.catch(() => sonRefuseV()); }
    const r = vis && $('.vi-reprise', vis); if (r) r.remove();
  }
  if (vis) vis.classList.toggle('pause', VT.pause);
  const b = $('#vi-pause');
  if (b) { b.innerHTML = ic(VT.pause ? 'lecture' : 'pause'); b.setAttribute('aria-label', VT.pause ? 'Reprendre la visite' : 'Mettre en pause'); b.title = VT.pause ? 'Reprendre' : 'Pause'; }
}
function boutonSonV() {
  if (!VT.son) { VT.muet = false; sauverMuetV(); if (VT.pret) activerVoixV(); else VT.son = !!VOIX_SRC[1]; }
  else { VT.muet = !VT.muet; sauverMuetV(); if (VA) VA.muted = VT.muet; }
  majSonV();
}
function majSonV() {
  const vis = $('#visite');
  if (!vis) return;
  const coupe = VT.muet || !VT.son;
  vis.classList.toggle('muet', coupe);
  vis.classList.toggle('sans-son', !VT.son && !!VOIX_SRC[1]);
  const b = $('#vi-son');
  if (!b) return;
  const lib = coupe ? 'Activer la voix' : 'Couper la voix';
  b.innerHTML = ic(coupe ? 'muet' : 'haut-parleur') + '<span class="vi-son-txt">Activer la voix</span>';
  b.setAttribute('aria-label', lib);
  b.title = lib;
}
// au clavier : Échap ferme, Espace met en pause ; pas de recherche pendant la visite
function toucheVisite(e) {
  if (!VT.actif) return false;
  const k = e.key;
  if (k === 'Escape') { e.preventDefault(); fermerVisite(); return true; }
  if (k === ' ' && !(e.target.closest && e.target.closest('button, a, input, textarea, select, [contenteditable]'))) { e.preventDefault(); if (VT.fini) fermerVisite(); else basculerPauseVisite(); return true; }
  if ((e.metaKey || e.ctrlKey) && k.toLowerCase() === 'k') { e.preventDefault(); return true; }
  return false;
}
document.addEventListener('visibilitychange', () => { if (document.hidden && VT.actif && !VT.pause && !VT.fini) basculerPauseVisite(); });

function finVisite() {
  VT.fini = true; VT.pret = false; VT.cible = null;
  const vis = $('#visite');
  if (!vis) return;
  vis.classList.add('finie');
  vis.classList.remove('bas-gauche');
  vis.insertAdjacentHTML('beforeend', '<div class="vi-fin" role="dialog" aria-modal="true" aria-labelledby="vi-fin-t"><span class="vi-fin-ic">' + ic('coche') + '</span>' +
    '<h2 id="vi-fin-t">À vous de jouer.</h2><p>Le cockpit du Balto est ouvert&nbsp;: touchez ce que vous voulez. Tout est cliquable, et rien n’est envoyé.</p>' +
    '<div class="vi-fin-actions"><button class="bouton plein" type="button" data-vi="explorer"><span>Explorer le cockpit</span>' + ic('fleche') + '</button>' +
    '<button class="bouton" type="button" data-vi="revoir">' + ic('retour') + '<span>Revoir la visite</span></button></div>' +
    '<a class="vi-lien" href="https://cockpit-buraliste.fr/#demo" target="_blank" rel="noopener">Pour votre tabac, demandez une démonstration</a></div>');
  const b = $('.vi-fin [data-vi="explorer"]'); if (b) b.focus({ preventScroll: true });
}

function fermerVisite() {
  if (!VT.actif) return;
  VT.actif = false; VT.fini = false; VT.jeton++; VT.pret = false; VT.pause = false; VT.prelance = false; VT.cible = null; VT.geo = null;
  cancelAnimationFrame(VT.raf);
  if (VA) { VA.onended = null; try { VA.pause(); } catch (e) { /* */ } }
  clearTimeout(minuterieAs);
  const vis = $('#visite'); if (vis) vis.remove();
  document.body.classList.remove('en-visite');
  fermerTout();
  // ce que la visite a touché revient comme avant : le plan de vol, le comptage, l'assistant
  const av = VT.avant || {};
  VT.avant = null;
  if (av.fil != null && AS.fil.length > av.fil) AS.fil.length = av.fil;
  let rendu = false;
  if (av.plan && JSON.stringify(ETAT.plan) !== av.plan) { ETAT.plan = nettoyerPlan(JSON.parse(av.plan)); ecrire(); rendu = true; }
  if ((ETAT.compte || '') !== (av.compte || '')) { ETAT.compte = av.compte; rendu = true; }
  if (rendu && ETAT.connecte) rendre(true);
}
