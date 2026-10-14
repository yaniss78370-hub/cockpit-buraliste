/* ==================================================================
   La visite guidée. À la connexion, la voix du film, avec ses sous-titres, prend la main une minute :
   l'accueil, la caisse, la FDJ, le plan de vol, l'assistant. Puis elle rend les commandes.
   Une seule piste de voix, chargée dès l'écran de connexion. Son horloge mène tout le reste :
   les pages changent dans les respirations, le projecteur arrive juste avant le mot, les sous-titres s'allument mot à mot.
   Pause, son, fermeture : à tout moment. Elle se revoit depuis le menu.
   ================================================================== */
const VOIX_SRC = /*VOIX*/'';   // la piste de la visite : fichier du site, ou données intégrées dans l'aperçu
const PISTE_VISITE = /*PISTE*/{ duree: 0, mots: [] };   // chaque mot dit dans la piste : [mot, début, fin] en secondes (voix_visite.py)
const SANS_VISITE = /[?&]sans-visite/.test(location.search);

// chaque étape : sa page, ce qu'on éclaire, ses sous-titres (une ligne par élément, calée sur les mots de la voix),
// « avance » : de combien la page et le projecteur précèdent le premier mot de l'étape (en s),
// ses gestes [mot de l'étape, écart en s par rapport au début de ce mot, action]
const ETAPES_VISITE = [
  { id: 1, chap: 0, route: 'cockpit', haut: true,
    st: ['Bonsoir, et bienvenue au Balto, notre tabac d’exemple.', 'En une minute, je vous montre ce que le cockpit fait pour vous.', 'Ensuite, c’est à vous.'] },
  { id: 2, chap: 0, route: 'cockpit', haut: true, cible: '.heros', avance: 0.65,
    st: ['Chaque soir, à 21 heures, il lit votre caisse,', 'vos banques, la FDJ et Logista.', 'Et il vous dit où vous atterrissez lundi, après la facture tabac :', '47 380 €.'],
    puis: [['47', -0.35, () => viserVisite('.heros .h-montant')]] },
  { id: 3, chap: 0, route: 'cockpit', cible: '.heros .vraiment', avance: 0.8,
    st: ['Dont 37 520 € vraiment à vous.', 'Le reste attend d’être reversé.'] },
  { id: 4, chap: 0, route: 'cockpit', cible: '.col-gestes .papier', avance: 1,
    st: ['Vos gestes de la semaine sont prêts :', 'le virement à faire, le compte FDJ à alimenter,', 'les espèces à verser.'] },
  { id: 5, chap: 1, route: 'caisse', haut: true, cible: '.heros', avance: 0.75,
    st: ['Côté caisse, vous savez au centime', 'ce qu’elle doit contenir depuis la dernière collecte.', 'Vous comptez, il vous dit si c’est juste.'],
    puis: [['Vous', -0.1, () => taperVisite('#compte-caisse', montantCaisseV())]] },
  { id: 6, chap: 2, route: 'fdj', haut: true, cible: '.heros', avance: 0.75,
    st: ['Côté jeux, le prélèvement FDJ de mercredi est connu d’avance.', 'Et celui de la semaine en cours se calcule chaque soir,', 'rubrique par rubrique.'],
    puis: [['Et', -0.45, () => viserVisite('#fdj-semaine', true)]] },
  { id: 7, chap: 3, route: 'tresorerie', defiler: '#sec-plan', cible: '#plan', defilerTel: '.plan-carte', cibleTel: '.plan-carte', avance: 0.7,
    st: ['Avant une décision, vous voyez son effet sur six mois.', 'Embaucher, agrandir le rayon CBD, refaire l’agencement :', 'vous choisissez le mois, la courbe se recalcule.'],
    puis: [['Embaucher,', -0.15, () => cliquerVisite('[data-action="plan-scenario"][data-id="investir"]')], ['mois,', -0.15, () => cliquerVisite('[data-plan="embaucheMois"][data-v="3"]')]] },
  { id: 8, chap: 4, avant: () => ouvrirAssistant(), cible: '.assistant', bas: 'gauche', avance: 0.75,
    st: ['Une question, à n’importe quelle heure ?', 'Posez-la.', 'Il vous répond avec vos chiffres.'],
    puis: [['Posez-la.', -0.05, () => poserQuestion('Combien on a fait aujourd’hui ?')]] },
  { id: 9, chap: 5, avant: () => fermerTout(), route: 'cockpit', haut: true, avance: 0.55,
    st: ['Voilà. Le cockpit est à vous : touchez ce que vous voulez.', 'Et pour votre tabac, demandez-nous une démonstration.'] },
];
const CHAPITRES_VISITE = ['Accueil', 'Caisse', 'FDJ', 'Plan de vol', 'Assistant'];

// horloge : « attente » (la voix va partir), « voix » (le temps de la piste), « mur » (sans le son : une horloge, au même rythme)
const VT = { actif: false, fini: false, i: -1, pause: false, muet: false, son: false, horloge: 'mur', lance: false, rejoindre: false,
  t0: 0, tPause: 0, tLance: 0, tAff: 0, ct: -1, ctMur: 0, avantImg: 0, faits: null, cible: null, geo: null, raf: 0, chunk: -1, avant: null,
  src: '', blob: '', charge: false, essai: 0, frappe: null, fin: 0, duree: 0, chaps: [], defil: 0, defilMain: false };
let VA = null;   // le lecteur, un seul : débloqué par le clic du visiteur
try { VT.muet = localStorage.getItem('cockpit-visite-muet') === '1'; } catch (e) { /* stockage indisponible */ }
const reduitV = () => mouvementReduit();
const telV = () => window.innerWidth < 761;
function sauverMuetV() { try { localStorage.setItem('cockpit-visite-muet', VT.muet ? '1' : '0'); } catch (e) { /* stockage indisponible */ } }

/* ------------------------------------------------------------------ le calage : chaque mot des sous-titres reçoit ses temps */
function calerVisite() {
  if (VT.fin) return;
  const M = PISTE_VISITE.mots || [];
  let k = 0, t = 0, ecarts = 0;
  ETAPES_VISITE.forEach((e) => {
    e.lignes = e.st.map((texte) => {
      const mots = texte.split(' ').map((m) => {
        const w = M[k++];
        if (w && w[0] === m) { t = w[2]; return { m, d: w[1], f: w[2] }; }
        ecarts++; const d = t + 0.05; t = d + 0.3; return { m, d, f: t };   // mot sans temps : à la suite du précédent
      });
      return { texte, mots, d: mots[0].d, f: mots[mots.length - 1].f };
    });
    e.parle = e.lignes[0].d;
    e.gestes = (e.puis || []).map(([mot, dt, fn]) => {
      let w = null;
      e.lignes.some((l) => (w = l.mots.find((x) => x.m === mot)));
      return { t: (w ? w.d : e.parle) + dt, fn };
    });
  });
  ETAPES_VISITE.forEach((e, n) => { e.t = n === 0 ? 0 : Math.max(ETAPES_VISITE[n - 1].lignes.slice(-1)[0].f - 0.25, e.parle - (e.avance || 0.5)); });
  VT.duree = Math.max(PISTE_VISITE.duree || 0, t);
  VT.fin = VT.duree + 0.25;   // une respiration après le dernier mot, puis la carte de fin
  // les chapitres : du début de leur première étape au début du suivant
  VT.chaps = CHAPITRES_VISITE.map((c, k2) => {
    const deb = ETAPES_VISITE.find((e) => e.chap === k2), suiv = ETAPES_VISITE.find((e) => e.chap > k2);
    return { d: deb ? deb.t : 0, f: suiv ? suiv.t : VT.fin };
  });
  if (ecarts) console.warn('Visite : ' + ecarts + ' mot(s) des sous-titres sans temps dans la piste');
}

/* ------------------------------------------------------------------ la voix */
function lecteurV() {
  if (VA) return VA;
  VA = new Audio();
  VA.preload = 'auto';
  VA.addEventListener('playing', () => {
    if (!VT.son) return;
    if (VT.rejoindre) {   // la voix rattrape la visite qui avançait en sous-titres
      VT.rejoindre = false;
      const t = tempsVisite();
      if (Math.abs(VA.currentTime - t) > 0.15) { try { VA.currentTime = t; } catch (e) { /* */ } }
    }
    if (VT.horloge !== 'voix') { VT.horloge = 'voix'; VT.ct = -1; }
    VT.ctMur = performance.now();
    if (VT.pause) VA.pause();
    majSonV();
  });
  VA.addEventListener('pause', () => {
    // le téléphone a coupé la voix (appel, écouteurs débranchés…) : la visite se met en pause avec elle
    if (VT.actif && !VT.fini && !VT.pause && VT.son && VT.horloge === 'voix' && !VA.ended) basculerPauseVisite();
  });
  // la piste est finie : l'horloge continue sans elle jusqu'à la carte de fin
  VA.addEventListener('ended', () => { if (VT.son && VT.horloge === 'voix') { VT.horloge = 'mur'; VT.t0 = performance.now() - VT.duree * 1000; } });
  VA.addEventListener('error', () => {
    if (!VT.son || !VT.src) return;
    if (VT.blob && VT.src === VT.blob && VT.horloge === 'attente') {   // le fichier gardé en mémoire ne passe pas : on prend celui du site
      VT.blob = ''; VT.src = VOIX_SRC; VA.src = VOIX_SRC; VT.tLance = performance.now();
      if (!VT.pause) jouerV();
      return;
    }
    sonRefuseV();
  });
  return VA;
}
function jouerV() {
  const n = ++VT.essai;
  const p = VA.play();
  // une pause demandée avant le départ interrompt la lecture (AbortError) : ce n'est pas un refus ; seul compte le dernier essai
  if (p && p.catch) p.catch((err) => { if (n === VT.essai && !(err && err.name === 'AbortError')) sonRefuseV(); });
}
// la piste se charge dès l'écran de connexion : au clic, la voix part sans attendre le réseau
function prechargerVisite() {
  if (SANS_VISITE || !VOIX_SRC || VT.charge) return;
  VT.charge = true;
  const a = lecteurV();
  if (/^data:/.test(VOIX_SRC)) { if (!VT.src) { VT.src = VOIX_SRC; a.src = VOIX_SRC; } return; }
  try {
    fetch(VOIX_SRC).then((r) => (r.ok ? r.blob() : null)).then((b) => {
      if (!b) return;
      VT.blob = URL.createObjectURL(b.type ? b : new Blob([b], { type: 'audio/mpeg' }));
      if (!VT.lance) { VT.src = VT.blob; a.src = VT.blob; }   // déjà partie du réseau : on ne coupe pas, le fichier servira à « Revoir »
    }).catch(() => { /* la voix viendra du réseau au clic */ });
  } catch (e) { /* sans préchargement */ }
}
// la voix démarre dans le geste du visiteur (son clic), sinon le navigateur la bloque
function lancerVoixV() {
  VT.tAff = 0; VT.rejoindre = false;
  if (!VOIX_SRC) { VT.son = false; VT.horloge = 'mur'; VT.t0 = performance.now(); return; }
  const a = lecteurV();
  try {
    if (a.error && VT.blob && VT.src === VT.blob) VT.blob = '';   // le fichier en mémoire n'a pas pu se lire : celui du site
    const src = VT.blob || VT.src || VOIX_SRC;
    if (VT.src !== src || a.error) { VT.src = src; a.src = src; }
    else if (a.currentTime > 0.05 || a.ended) a.currentTime = 0;
    a.muted = VT.muet;
    VT.son = true; VT.lance = true;
    VT.horloge = 'attente'; VT.tLance = performance.now();
    jouerV();
  } catch (e) { sonRefuseV(); }
}
// le navigateur a refusé le son, ou la voix ne vient pas : la visite continue en sous-titres, au même rythme
function sonRefuseV() {
  const t = VT.horloge === 'mur' ? tempsVisite() : VT.horloge === 'voix' ? VT.tAff : 0;
  VT.son = false; VT.rejoindre = false;
  if (VA) { try { VA.pause(); } catch (e) { /* */ } }
  if (VT.horloge !== 'mur') { VT.horloge = 'mur'; VT.t0 = performance.now() - t * 1000; if (VT.pause) VT.tPause = performance.now(); }
  majSonV();
}
// le visiteur rallume la voix : elle reprend là où en est la visite
function activerVoixV() {
  if (!VOIX_SRC) return;
  const a = lecteurV();
  if (a.error && VT.blob && VT.src === VT.blob) VT.blob = '';
  const src = VT.blob || VT.src || VOIX_SRC;
  if (VT.src !== src || a.error) { VT.src = src; a.src = src; }
  a.muted = false;
  VT.son = true; VT.rejoindre = true;
  try { a.currentTime = tempsVisite(); } catch (e) { /* réglé à la lecture */ }
  if (VT.pause) basculerPauseVisite();
  else jouerV();
  majSonV();
}
function preparerVisite() { if (!SANS_VISITE) { calerVisite(); lancerVoixV(); } }

// le temps de la visite, en secondes de piste
function tempsVisite(now = performance.now()) {
  if (VT.horloge === 'attente') return 0;
  if (VT.horloge === 'voix' && VA) {
    const ct = VA.currentTime || 0;
    let t;
    if (ct !== VT.ct || VA.paused || VT.pause) { VT.ct = ct; VT.ctMur = now; t = ct; }
    else t = ct + Math.min(0.25, (now - VT.ctMur) / 1000);   // même valeur qu'à l'image d'avant : on prolonge un peu
    if (t < VT.tAff && VT.tAff - t < 0.3) t = VT.tAff;     // jamais de retour en arrière de quelques millièmes
    return (VT.tAff = t);
  }
  return ((VT.pause ? VT.tPause : now) - VT.t0) / 1000;
}

/* ------------------------------------------------------------------ la visite */
function demarrerVisite(o = {}) {
  if (SANS_VISITE) return;
  calerVisite();
  if (VT.actif) fermerVisite();
  fermerTout();
  if (!o.depuisConnexion) lancerVoixV();   // relancée d'un clic : ce clic débloque aussi la voix
  VT.actif = true; VT.fini = false; VT.pause = false; VT.i = -1; VT.cible = null; VT.geo = null; VT.chunk = -1; VT.frappe = null;
  VT.avant = { plan: JSON.stringify(ETAT.plan), compte: ETAT.compte || '', fil: AS.fil.length };
  monterVisite();
  document.body.classList.add('en-visite');
  cancelAnimationFrame(VT.raf);
  VT.avantImg = 0;
  VT.raf = requestAnimationFrame(boucleVisite);
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

// une étape commence : sa page (avec le geste sur l'onglet), le défilement, la cible du projecteur
function entrerEtapeV(k) {
  const e = ETAPES_VISITE[k];
  VT.i = k; VT.faits = new Set(); VT.chunk = -1;
  const vis = $('#visite');
  if (vis) vis.classList.toggle('bas-gauche', e.bas === 'gauche');
  try { if (e.avant) e.avant(); } catch (err) { /* la visite continue */ }
  let change = false;
  if (e.route && ETAT.route !== e.route) {
    if (k > 0) montrerOngletV(e.route);
    aller(e.route);
    change = true;
  }
  const tel = telV();
  const sel = (tel && e.cibleTel) || e.cible, dsel = (tel && e.defilerTel) || e.defiler;
  if (e.haut) { if (window.scrollY > 4) defilerV(0, change ? 0 : 450); }
  else { const el = $(dsel || sel); if (el) amenerVisite(el, !!dsel, change); }
  VT.cible = sel ? $(sel) : null;
}
// le geste se voit aussi sur l'onglet de la page qui s'ouvre
function montrerOngletV(route) {
  const el = $$('#onglets-bas [data-route="' + route + '"], #cote .nav [data-route="' + route + '"]').find((x) => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
  if (el) montrerClicV(el);
}

// à chaque image : l'étape du moment, ses gestes, ses sous-titres, la progression, et le projecteur qui suit sa cible
function boucleVisite(now) {
  if (!VT.actif) return;
  const dt = VT.avantImg ? Math.min(0.1, Math.max(0, (now - VT.avantImg) / 1000)) : 1 / 60;
  VT.avantImg = now;
  let t = tempsVisite();
  if (!VT.pause) {
    const ici = performance.now();
    // la voix ne vient pas, ou elle a calé : la visite continue en sous-titres, là où elle en est
    if ((VT.horloge === 'attente' && ici - VT.tLance > 2500) || (VT.horloge === 'voix' && VA && !VA.paused && ici - VT.ctMur > 3000)) { sonRefuseV(); t = tempsVisite(); }
  }
  if (!VT.fini) {
    let k = VT.i;
    while (k + 1 < ETAPES_VISITE.length && t >= ETAPES_VISITE[k + 1].t) k++;
    if (k < 0) k = 0;
    if (k !== VT.i) entrerEtapeV(k);
    const e = ETAPES_VISITE[VT.i];
    e.gestes.forEach((g, n) => { if (!VT.faits.has(n) && t >= g.t) { VT.faits.add(n); try { g.fn(); } catch (err) { /* geste manqué : la visite continue */ } } });
    frappeV(t);
    sousTitresV(e, t);
    majChapitresV(t);
    if (VT.horloge === 'mur' && t >= VT.fin && !VT.pause) finVisite();
  }
  placerVoileV(dt);
  VT.raf = requestAnimationFrame(boucleVisite);
}

// la ligne en cours prend la place de la précédente quand celle-ci est dite, ou juste avant son premier mot ;
// chaque mot s'allume quand la voix le dit
function sousTitresV(e, t) {
  const st = $('#vi-st');
  if (!st) return;
  let k = 0;
  for (let n = 1; n < e.lignes.length; n++) { if (t >= Math.max(e.lignes[n - 1].f - 0.12, e.lignes[n].d - 0.3)) k = n; }
  const L = e.lignes[k];
  if (k !== VT.chunk) {
    VT.chunk = k;
    st.innerHTML = '<span class="vi-st-l">' + L.mots.map((m) => '<span class="vm">' + esc(m.m) + '</span>').join(' ') + '</span>';
  }
  const l = st.firstElementChild;
  if (!l) return;
  const mots = l.children;
  for (let m = 0; m < mots.length; m++) { const d = t >= L.mots[m].d - 0.04; if (mots[m].classList.contains('dit') !== d) mots[m].classList.toggle('dit', d); }
}

function majChapitresV(t) {
  $$('#visite .vi-chap').forEach((c) => {
    const k = +c.dataset.k, ch = VT.chaps[k];
    if (!ch) return;
    const part = Math.max(0, Math.min(1, (t - ch.d) / Math.max(0.1, ch.f - ch.d)));
    const on = t >= ch.d && t < ch.f, vu = t >= ch.f;
    if (c.classList.contains('on') !== on) c.classList.toggle('on', on);
    if (c.classList.contains('vu') !== vu) c.classList.toggle('vu', vu);
    const b = c.querySelector('i');
    const s = 'scaleX(' + part.toFixed(3) + ')';
    if (b && b.style.transform !== s) b.style.transform = s;
  });
}

function placerVoileV(dt) {
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
  const k = reduitV() ? 1 : 1 - Math.exp(-(dt || 1 / 60) / 0.085);   // même vitesse à 60 ou 120 images par seconde
  VT.geo = { x: g.x + (cible.x - g.x) * k, y: g.y + (cible.y - g.y) * k, w: g.w + (cible.w - g.w) * k, h: g.h + (cible.h - g.h) * k };
  if (Math.abs(VT.geo.w) < 0.5) VT.geo.w = 0;
  if (Math.abs(VT.geo.h) < 0.5) VT.geo.h = 0;
  v.style.transform = 'translate(' + VT.geo.x.toFixed(1) + 'px,' + VT.geo.y.toFixed(1) + 'px)';
  v.style.width = VT.geo.w.toFixed(1) + 'px';
  v.style.height = VT.geo.h.toFixed(1) + 'px';
  if (v.classList.contains('on') !== on) v.classList.toggle('on', on);
}

// amène un élément dans la partie libre de l'écran (sous l'en-tête, au-dessus des sous-titres) ; d'un coup si la page vient de s'ouvrir
function amenerVisite(el, debut, direct) {
  const r = el.getBoundingClientRect(), vh = window.innerHeight;
  const h0 = telV() ? 74 : 88, h1 = vh - (telV() ? 240 : 180);
  if (!debut && r.top >= h0 && r.bottom <= h1) return false;
  const y = (debut || r.height > h1 - h0) ? window.scrollY + r.top - h0 : window.scrollY + r.top - h0 - (h1 - h0 - r.height) / 2;
  const cible = Math.max(0, Math.round(y));
  if (Math.abs(cible - window.scrollY) < 4) return false;
  defilerV(cible, direct ? 0 : 520);
  return true;
}
// défilement à durée fixe, le même dans tous les navigateurs : le projecteur arrive à l'heure prévue.
// Le visiteur qui fait défiler lui-même reprend la main.
function defilerV(y, duree) {
  cancelAnimationFrame(VT.defil);
  const y0 = window.scrollY, dy = y - y0;
  if (reduitV() || !duree || Math.abs(dy) < 4) { window.scrollTo(0, y); return; }
  const t0 = performance.now();
  VT.defilMain = false;
  const pas = (now) => {
    if (VT.defilMain || !VT.actif) return;
    const u = Math.min(1, Math.max(0, (now - t0) / duree));
    const k = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(2 - 2 * u, 3) / 2;
    window.scrollTo(0, Math.round(y0 + dy * k));
    if (u < 1) VT.defil = requestAnimationFrame(pas);
  };
  VT.defil = requestAnimationFrame(pas);
}
['wheel', 'touchstart', 'keydown'].forEach((ev) => window.addEventListener(ev, () => { VT.defilMain = true; }, { passive: true }));
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
  if (!r.width || r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return;
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
// la saisie suit l'horloge de la visite : elle s'arrête avec la pause
function taperVisite(sel, texte) {
  const el = $(sel);
  if (!el) return;
  montrerClicV(el);
  el.value = '';
  VT.frappe = { el, texte, t: tempsVisite(), n: 0 };
}
function frappeV(t) {
  const f = VT.frappe;
  if (!f) return;
  if (!document.body.contains(f.el)) { VT.frappe = null; return; }
  const n = Math.max(0, Math.min(f.texte.length, Math.floor((t - f.t - 0.08) / 0.095) + 1));
  if (n === f.n) return;
  f.n = n;
  f.el.value = f.texte.slice(0, n);
  if (n === f.texte.length) { VT.frappe = null; f.el.dispatchEvent(new Event('input', { bubbles: true })); }
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
    if (VA && VT.son) VA.pause();
    if (vis && !$('.vi-reprise', vis)) vis.insertAdjacentHTML('beforeend', '<button class="vi-reprise" type="button" data-vi="pause">' + ic('lecture') + '<span>Reprendre la visite</span></button>');
  } else {
    VT.t0 += performance.now() - VT.tPause;
    VT.ctMur = performance.now();
    if (VT.horloge === 'attente') VT.tLance = performance.now();
    if (VA && VT.son && !VA.ended) jouerV();
    const r = vis && $('.vi-reprise', vis); if (r) r.remove();
  }
  if (vis) vis.classList.toggle('pause', VT.pause);
  const b = $('#vi-pause');
  if (b) { b.innerHTML = ic(VT.pause ? 'lecture' : 'pause'); b.setAttribute('aria-label', VT.pause ? 'Reprendre la visite' : 'Mettre en pause'); b.title = VT.pause ? 'Reprendre' : 'Pause'; }
}
function boutonSonV() {
  if (!VT.son) { VT.muet = false; sauverMuetV(); activerVoixV(); }
  else { VT.muet = !VT.muet; sauverMuetV(); if (VA) VA.muted = VT.muet; }
  majSonV();
}
function majSonV() {
  const vis = $('#visite');
  if (!vis) return;
  const coupe = VT.muet || !VT.son;
  vis.classList.toggle('muet', coupe);
  vis.classList.toggle('sans-son', !VT.son && !!VOIX_SRC);
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
// pour les essais (essai_visite.py) : l'état de la visite, lu de l'extérieur
if (/[?&]essai-visite/.test(location.search)) window.ESSAI_VISITE = { VT, ETAPES_VISITE, temps: () => tempsVisite(), lecteur: () => VA };

function finVisite() {
  VT.fini = true; VT.cible = null; VT.frappe = null;
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
  VT.actif = false; VT.fini = false; VT.pause = false; VT.cible = null; VT.geo = null; VT.frappe = null; VT.rejoindre = false;
  cancelAnimationFrame(VT.raf);
  if (VA) { try { VA.pause(); } catch (e) { /* */ } }
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
