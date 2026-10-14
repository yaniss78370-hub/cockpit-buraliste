/* Cockpit Buraliste, version test. Données d'exemple : tabac « Le Balto ». Montants en centimes. */
'use strict';
const D = JSON.parse(document.getElementById('donnees').textContent);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ------------------------------------------------------------------ formats */
const NB = ' ';
// séparateur de milliers : espace insécable ordinaire, plus lisible que l'espace fine dans le texte courant
const formatFr = (o) => { const f = new Intl.NumberFormat('fr-FR', o); return { format: (x) => f.format(x).replace(/[\u202f\u00a0]/g, NB) }; };
const F0 = formatFr({ maximumFractionDigits: 0 });
const F1 = formatFr({ minimumFractionDigits: 1, maximumFractionDigits: 1 });
const F2 = formatFr({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
function eur(c, dec = false, signe = false) {
  const v = c / 100;
  const neg = dec ? v < -0.004 : Math.round(v) < 0;
  const s = dec ? F2.format(Math.abs(v)) : F0.format(Math.abs(Math.round(v)));
  return (neg ? '−' : signe && (dec ? v > 0.004 : Math.round(v) > 0) ? '+' : '') + s + NB + '€';
}
const eur2 = (c, signe) => eur(c, true, signe);
const keur = (e) => (e < 0 ? '\u2212' : '') + (Math.abs(e) >= 1000 ? F0.format(Math.round(Math.abs(e) / 1000)) + NB + 'k€' : F0.format(Math.abs(e)) + NB + '€');
// graduations d'axe : 1 500 € s'écrit 1,5 k€ (jamais deux graduations identiques)
const keurT = (e) => (e < 0 ? '\u2212' : '') + (Math.abs(e) >= 1000 ? (Math.abs(e) % 1000 ? F1.format(Math.abs(e) / 1000) : F0.format(Math.abs(e) / 1000)) + NB + 'k€' : F0.format(Math.abs(e)) + NB + '€');
// téléphone : les graphiques sont dessinés plus étroits pour que leurs textes restent lisibles
const etroit = () => { try { return window.matchMedia('(max-width: 760px)').matches; } catch (e) { return false; } };
const LG = (w) => (etroit() ? Math.min(w, 360) : w);
const nb = (x) => F0.format(x);
const pct = (x, d = 1) => (x < 0 ? '−' : '') + (d ? F1 : F0).format(Math.abs(x)) + NB + '%';
const pctS = (x, d = 0) => (x > 0 ? '+' : x < 0 ? '−' : '') + (d ? F1 : F0).format(Math.abs(x)) + NB + '%';

const J = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const JL = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const M = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const ML = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const jour = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const dCourt = (iso) => { const x = jour(iso); return J[x.getDay()] + ' ' + x.getDate() + ' ' + M[x.getMonth()]; };
const dLong = (iso) => { const x = jour(iso); return JL[x.getDay()] + ' ' + x.getDate() + ' ' + ML[x.getMonth()]; };
const dNum = (iso) => iso.slice(8, 10) + '/' + iso.slice(5, 7);
const dNumA = (iso) => iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4);
const isoDe = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const ajoute = (iso, n) => { const d = jour(iso); d.setDate(d.getDate() + n); return isoDe(d); };
const AUJ = D.meta.aujourdhui;   // 2026-10-13
const HEURE = D.meta.heure;      // 21:04
const maj = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ------------------------------------------------------------------ icônes */
const ic = (n, cls = '') => '<svg class="ic ' + cls + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>';

/* ------------------------------------------------------------------ mémoire locale (confort, jamais indispensable) */
const CLE = 'cockpit-buraliste-test-v1';
function lire() { try { return JSON.parse(localStorage.getItem(CLE) || '{}'); } catch (e) { return {}; } }
function ecrire() { try { localStorage.setItem(CLE, JSON.stringify({ faits: ETAT.faits, traitees: ETAT.traitees, plan: ETAT.plan, commande: ETAT.commande })); } catch (e) { /* stockage indisponible */ } }
const MEM = lire();

/* ------------------------------------------------------------------ état */
// le plan de départ : chaque décision a sa date (mois 0 = octobre … 6 = avril) et son montant
function planDefaut() {
  return { embauche: true, embaucheMois: 1, credit: true, creditMois: 2, salaire: 2000, salaireMois: 3, cbd: false, cbdMois: 1, cbdStock: 6000,
    agencement: false, agencementMois: 4, agencementHT: 40000, agencementPret: false, aide: true, aideMois: 6, mouvements: [], lecture: 13 };
}
function nettoyerPlan(m) {
  const p = Object.assign(planDefaut(), m && typeof m === 'object' ? m : {});
  p.mouvements = Array.isArray(p.mouvements) ? p.mouvements.filter((x) => x && typeof x.montant === 'number' && isFinite(x.montant) && x.mois >= 0 && x.mois <= 6).slice(0, 8) : [];
  p.lecture = Math.max(0, Math.min(13, Math.round(+p.lecture || 0)));
  return p;
}
const PLAN_DEFAUT = planDefaut();
function lireSession() { try { return sessionStorage.getItem('cockpit-connecte') === '1'; } catch (e) { return false; } }
const ETAT = {
  route: 'cockpit',
  connecte: lireSession(),
  faits: MEM.faits || {},
  traitees: MEM.traitees || {},
  plan: nettoyerPlan(MEM.plan),
  planForm: { ouvert: false, lib: '', montant: '', sens: 'depense', mois: 3, freq: 'une' },
  commande: MEM.commande || {},
  tabTreso: 'semaine',
  mvt: { compte: 'tous', cat: 'toutes', statut: 'tous', q: '', n: 60, tri: 'date', sens: -1 },
  fact: { cat: 'toutes', statut: 'tous', q: '', choisie: null },
  resultat: { vue: 'mois', mois: 9 },
  caisse: { jour: AUJ, annules: 'jour' },
  jeux: { semaine: '2026-10-05' },
  stock: { onglet: 'vape', statut: 'tous', q: '', tri: 'statut', sens: 1 },
  alertes: 'a-traiter',
  detail: {},
  fdj: { semaine: null, jour: null, ops: false },
  compte: '',
  feuille: null,
};

/* ------------------------------------------------------------------ données dérivées */
const FACT = Object.fromEntries(D.factures.map((f) => [f.id, f]));
const FACT_METRO = D.factures.find((f) => f.fournisseur === 'Metro' && f.date === '2026-10-09');
const FACT_LIQUIDEO = D.factures.find((f) => f.fournisseur === 'Liquideo' && f.date === '2026-10-12');
ETAT.fact.choisie = FACT_METRO ? FACT_METRO.id : D.factures[0].id;
const Z = D.z;
const ZJ = Object.fromEntries(Z.map((z) => [z.date, z]));
const MVT = D.mouvements.map((m, i) => Object.assign({ i }, m));
const COMPTES = {
  bnp: { nom: 'BNP Paribas', role: 'Compte principal : cartes, espèces, charges', court: 'BNP' },
  bp: { nom: 'Banque Populaire', role: 'Compte tabac : Logista, recharges, timbres', court: 'BP' },
  fdj: { nom: 'Compte FDJ', role: 'Compte dédié aux prélèvements FDJ', court: 'FDJ' },
  caisse: { nom: 'Espèces au coffre', role: 'Depuis le dépôt de vendredi', court: 'Espèces' },
  cb: { nom: 'Cartes en attente', role: 'Ventes par carte de ce jour, créditées demain', court: 'CB' },
};
const ATT = { total: 4738000, net: 3752000, parts: [3564000, 983000, 147000, 44000] };
const PARTS_LIB = ['à vous, sur vos comptes', 'à reverser à la FDJ', 'à Logista, pour les recharges', 'à l’État, pour les timbres'];
const PARTS_COUL = ['#2bb673', '#f2a024', '#3d7bf2', '#8a63e8'];

// activités pour le compte de résultat
const ACTIVITES = [
  { id: 'tabac', lib: 'Tabac', cles: ['tabac'], coul: 'var(--s1)' },
  { id: 'jeux', lib: 'Jeux FDJ et PMU', cles: ['fdj', 'pmu'], coul: 'var(--s2)' },
  { id: 'services', lib: 'Timbres, recharges, presse', cles: ['timbres', 'recharges', 'presse'], coul: 'var(--s3)' },
  { id: 'vape', lib: 'Cigarette électronique', cles: ['vape'], coul: 'var(--s4)' },
  { id: 'cbd', lib: 'CBD', cles: ['cbd'], coul: 'var(--s5)' },
  { id: 'boutique', lib: 'Bar et boutique', cles: ['boissons', 'cafe', 'confiserie', 'accessoires', 'divers'], coul: 'var(--s6)' },
];
const LIB_FAM = { tabac: 'Tabac', fdj: 'Jeux FDJ', pmu: 'Jeux PMU', recharges: 'Recharges et cartes prépayées', timbres: 'Timbres', presse: 'Presse',
  vape: 'Cigarette électronique', cbd: 'CBD', boissons: 'Boissons', cafe: 'Café', confiserie: 'Confiserie et snacking', accessoires: 'Accessoires fumeurs', divers: 'Divers' };
const RUBRIQUES = ['Personnel', 'Cotisations du gérant', 'Loyer et charges', 'Énergie', 'Assurances', 'Honoraires', 'Banque et monétique',
  'Logiciels et télécoms', 'Entretien et fournitures', 'Impôts et taxes', 'Démarque et écarts', 'Cotisations professionnelles', 'Publicité et divers'];

function margeActivite(p, act) { return act.cles.reduce((s, k) => s + (p[k + '_marge'] || 0), 0); }
function margeTotale(p) { return ACTIVITES.reduce((s, a) => s + margeActivite(p, a), 0); }
function chargesHorsAmort(ch) { return RUBRIQUES.reduce((s, r) => s + (ch[r] || 0), 0); }
function chargesTotales(ch) { return Object.values(ch).reduce((s, v) => s + v, 0); }
function pnlDe(cle) {
  if (cle === 'att') return { produits: D.pnl_att.produits, charges: D.pnl_att.charges, lib: 'Octobre, atterrissage', court: 'oct. (att.)' };
  if (cle === 'oct') return { produits: D.pnl[9].produits, charges: D.pnl[9].charges, lib: 'Octobre, au 13', court: 'oct. au 13' };
  const p = D.pnl[cle - 1];
  return { produits: p.produits, charges: p.charges, lib: maj(ML[cle - 1]) + ' 2026', court: M[cle - 1] };
}
function n1Produits(m) {
  // même mois 2025 : coefficients par activité
  const p = D.pnl[m - 1].produits;
  const out = {};
  Object.keys(p).forEach((k) => {
    const fam = k.replace(/_(ventes|cout|marge)$/, '');
    if (fam === 'cbd') {
      const ht = (D.cbd_2025[m - 1] || 0) * 100;
      const v = k.endsWith('_ventes') ? ht : k.endsWith('_cout') ? Math.round(ht * D.cout.cbd) : Math.round(ht * (1 - D.cout.cbd));
      out[k] = v;
    } else out[k] = Math.round(p[k] / D.n1[fam]);
  });
  return out;
}
const resultatDe = (x) => margeTotale(x.produits) - chargesTotales(x.charges);

/* ------------------------------------------------------------------ plan de vol (même modèle que le site) */
const SIM = {
  base: [3800, 3900, 3400, 1250, 2950, 1640, 3640, 1640, 3640, 1640, 1940, 1640, 3640],
  cbd: [0, 0, 0, 300, 450, 600, 750, 900, 1000, 1100, 1100, 1100, 1100],
  depart: 47380, seuil: 29330, alerte: 5000,
  quand: ['mi-octobre', 'fin octobre', 'mi-novembre', 'fin novembre', 'mi-décembre', 'fin décembre', 'mi-janvier', 'fin janvier', 'mi-février', 'fin février', 'mi-mars', 'fin mars', 'mi-avril', 'fin avril'],
  mois: ['octobre', 'octobre', 'novembre', 'novembre', 'décembre', 'décembre', 'janvier', 'janvier', 'février', 'février', 'mars', 'mars', 'avril', 'avril'],
  dates: ['2026-10-19', '2026-10-31', '2026-11-15', '2026-11-30', '2026-12-15', '2026-12-31', '2027-01-15', '2027-01-31', '2027-02-15', '2027-02-28', '2027-03-15', '2027-03-31', '2027-04-15', '2027-04-30'],
  axe: ['oct.', 'nov.', 'déc.', 'janv.', 'févr.', 'mars', 'avr.'],
};
const LEVIERS = [
  { cle: 'embauche', titre: 'Embaucher pour fermer à 23\u00a0h' },
  { cle: 'credit', titre: 'Solder le crédit restant' },
  { cle: 'salaire', titre: 'Votre salaire de gérant' },
  { cle: 'cbd', titre: 'Agrandir le rayon CBD' },
  { cle: 'agencement', titre: 'Refaire l’agencement' },
];
const MOIS_PLAN = ['oct.', 'nov.', 'déc.', 'janv.', 'févr.', 'mars', 'avr.'];
const MOIS_PLAN_L = ['octobre', 'novembre', 'décembre', 'janvier', 'février', 'mars', 'avril'];
const kMi = (m) => Math.max(1, 2 * m);   // la quinzaine du 15 du mois
const kFin = (m) => 2 * m + 1;           // la quinzaine de fin de mois
const RAMPE_CBD = [0, 0, 300, 450, 600, 750, 900, 1000, 1100];
const FACTEUR_CBD = { 3000: 0.55, 6000: 1, 9000: 1.4 };
const capitalCredit = (m) => 7200 - 600 * (m - 2);          // reste dû à la fin du mois m (7 200 € fin décembre)
const tvaAgencement = (ht) => Math.round(ht * 0.2);
const aideAgencement = (ht) => Math.min(33000, Math.round(ht * 0.3));
const moisAide = (p) => Math.max(p.aideMois, p.agencementMois + 1);   // l'aide est versée après les travaux
function mensualitePret(capital, taux = 0.045, mois = 60) { const i = taux / 12; return capital * i / (1 - Math.pow(1 + i, -mois)); }
// ce que chaque décision ajoute ou retire à la quinzaine k : [famille, libellé, euros]
function contributionsPlan(p, k) {
  const L = [];
  if (p.embauche) { const k0 = kMi(p.embaucheMois); if (k === k0 || k === k0 + 1) L.push(['embauche', 'Embauche', -600]); else if (k > k0 + 1) L.push(['embauche', 'Embauche', -150]); }
  if (p.credit) { const kf = kFin(p.creditMois); if (k === kf) L.push(['credit', 'Crédit soldé', -capitalCredit(p.creditMois)]); else if (k > kf) L.push(['credit', 'Échéance de prêt en moins', 310]); }
  if (p.salaire && k >= kMi(p.salaireMois)) L.push(['salaire', 'Votre salaire', -p.salaire / 2]);
  if (p.cbd) {
    const j = k - kMi(p.cbdMois), f = FACTEUR_CBD[p.cbdStock] || p.cbdStock / 6000;
    if (j === 0) L.push(['cbd', 'Stock CBD', -p.cbdStock]);
    else if (j >= 2) L.push(['cbd', 'Marge CBD en plus', Math.round(RAMPE_CBD[Math.min(j, RAMPE_CBD.length - 1)] * f)]);
  }
  if (p.agencement) {
    const k0 = kMi(p.agencementMois), ht = p.agencementHT, tva = tvaAgencement(ht);
    if (p.agencementPret) {
      if (k === k0) L.push(['agencement', 'Agencement : apport et TVA', -(Math.round(ht * 0.2) + tva)]);
      if (k >= k0 + 2) L.push(['agencement', 'Échéance du prêt', -Math.round(mensualitePret(ht * 0.8) / 2)]);
    } else if (k === k0) L.push(['agencement', 'Agencement, TTC', -(ht + tva)]);
    if (k === k0 + 3) L.push(['agencement', 'TVA récupérée', tva]);
    if (k >= k0 + 2) L.push(['agencement', 'Ventes en plus après travaux', Math.round(200 * ht / 40000)]);
    const ma = moisAide(p);
    if (p.aide && ma <= 6 && k === kMi(ma)) L.push(['aide', 'Aide de la douane', aideAgencement(ht)]);
  }
  (p.mouvements || []).forEach((m) => {
    const k0 = kMi(m.mois);
    if (m.freq === 'mois' ? k >= k0 : k === k0) L.push(['mouvements', m.lib, m.freq === 'mois' ? m.montant / 2 : m.montant]);
  });
  return L;
}
function calculPlan(p = ETAT.plan) {
  const pts = [SIM.depart];
  const det = [];
  let v = SIM.depart;
  for (let k = 1; k <= 13; k++) {
    const lignes = contributionsPlan(p, k);
    const x = { base: SIM.base[k - 1], embauche: 0, credit: 0, salaire: 0, cbd: 0, agencement: 0, aide: 0, mouvements: 0, lignes };
    lignes.forEach((l) => { x[l[0]] += l[2]; });
    const d = x.base + lignes.reduce((t, l) => t + l[2], 0);
    v += d;
    pts.push(v);
    det.push(Object.assign(x, { total: d, solde: v }));
  }
  let bas = Infinity, kb = 0;
  pts.forEach((x, i) => { if (x < bas) { bas = x; kb = i; } });
  const niveau = bas >= SIM.seuil ? 'ok' : bas >= SIM.alerte ? 'moyen' : 'ko';
  const ciel = niveau === 'ok' ? 'Ciel dégagé jusqu’en avril' : (niveau === 'moyen' ? 'Turbulences en ' : 'Alerte en ') + SIM.mois[kb];
  const manque = Math.max(0, SIM.seuil - bas);
  return { pts, det, bas, kb, niveau, ciel, fin: pts[13], manque };
}
// la référence : sans rien changer (pas d'embauche, pas de salaire, crédit payé jusqu'au bout)
const PLAN_REF = calculPlan(Object.assign(planDefaut(), { embauche: false, credit: false, salaire: 0, cbd: false, agencement: false }));
// les événements posés sur la courbe, dans l'ordre du temps
function evenementsPlan(p = ETAT.plan) {
  const a = [];
  if (p.embauche) a.push({ i: kMi(p.embaucheMois), txt: 'Nouvelle recrue, on ferme à 23\u00a0h', sous: 'dès ' + MOIS_PLAN_L[p.embaucheMois] });
  if (p.cbd) a.push({ i: kMi(p.cbdMois), txt: 'Rayon CBD agrandi : ' + eur(p.cbdStock * 100) + ' de stock', sous: 'en ' + MOIS_PLAN_L[p.cbdMois] });
  if (p.credit) a.push({ i: kFin(p.creditMois), txt: 'Crédit soldé : ' + eur(capitalCredit(p.creditMois) * 100), sous: 'fin ' + MOIS_PLAN_L[p.creditMois] });
  if (p.salaire) a.push({ i: kMi(p.salaireMois), txt: 'Vous vous versez ' + eur(p.salaire * 100), sous: 'par mois, dès ' + MOIS_PLAN_L[p.salaireMois] });
  if (p.agencement) {
    const k0 = kMi(p.agencementMois), ht = p.agencementHT;
    a.push({ i: k0, txt: 'Agencement : ' + eur(ht * 100) + ' HT', sous: 'en ' + MOIS_PLAN_L[p.agencementMois] + (p.agencementPret ? ', prêt sur 5 ans' : ', payé comptant') });
    if (k0 + 3 <= 13) a.push({ i: k0 + 3, txt: 'TVA de l’agencement récupérée : ' + eur(tvaAgencement(ht) * 100), sous: 'fin ' + MOIS_PLAN_L[p.agencementMois + 1] });
    const ma = moisAide(p);
    if (p.aide && ma <= 6) a.push({ i: kMi(ma), txt: 'Aide de la douane reçue : ' + eur(aideAgencement(ht) * 100), sous: 'en ' + MOIS_PLAN_L[ma] });
  }
  (p.mouvements || []).forEach((m) => a.push({ i: kMi(m.mois), txt: m.lib + ' : ' + eur(m.montant * 100, false, true) + (m.freq === 'mois' ? ' par mois' : ''), sous: (m.freq === 'mois' ? 'dès ' : 'en ') + MOIS_PLAN_L[m.mois] }));
  return a.sort((u, v) => u.i - v.i);
}

/* ------------------------------------------------------------------ indicateurs */
const ZAUJ = ZJ[AUJ];
function margeJour(z) {
  const v = z.ventes, t = D.taux, tva = D.tva_vente, cout = D.cout;
  let m = Math.round(v.tabac * t.tabac) + Math.round(v.fdj * t.fdj) + Math.round(v.pmu * t.pmu) + Math.round(v.recharges * t.recharges) +
    Math.round(v.timbres * t.timbres) + Math.round(v.presse * t.presse);
  D.boutique.forEach((f) => { const ht = v[f] / (1 + tva[f]); m += Math.round(ht * (1 - cout[f])); });
  return m;
}
const MARGE_AUJ = margeJour(ZAUJ);
const DERNIERS = (n) => Z.slice(-n);
const ESPECES_COFFRE = D.comptes.caisse;
const STOCK_ECART = D.stock_tot.theo - D.stock_tot.strator;
const REF = (cle) => D.refs.find((r) => r.cle === cle);
const FRAISE = REF('fraise'), CLASSIC = REF('classic'), VANILLE = REF('vanille');
const SEMAINES_FDJ = D.releves.fdj.slice(-4).map((r) => r.du);

function fdjSemaine(lundi) {
  const lignes = [];
  for (let i = 0; i < 7; i++) {
    const iso = ajoute(lundi, i);
    const z = ZJ[iso];
    if (!z) continue;
    lignes.push({ iso, pj: z.ventes.fdj, st: z.fdj_strator, ecart: z.fdj_strator - z.ventes.fdj });
  }
  return lignes;
}
const ECART_FDJ = { iso: '2026-10-08', montant: -4500, heure: '14:31:08' };
// Parions Sport, jeudi 8 octobre de 14 h 25 à 14 h 40 : chaque pari sort du terminal FDJ avec son heure, face aux tickets scannés en caisse
const EXPORT_FDJ = [
  { h: '14:25:41', jeu: 'Combiné ×3', mt: 600, ok: true },
  { h: '14:28:17', jeu: 'Simple, foot', mt: 1000, ok: true },
  { h: '14:31:08', jeu: 'Combiné ×4', mt: 4500, ok: false },
  { h: '14:34:52', jeu: 'Simple, tennis', mt: 500, ok: true },
  { h: '14:38:20', jeu: 'Combiné ×2', mt: 800, ok: true },
];

/* ------------------------------------------------------------------ alertes */
function construireAlertes() {
  const plan = calculPlan();
  const r9 = D.ratios[8];
  const ach9 = D.vape_achats['9'] || 0, cout9 = D.pnl[8].produits.vape_cout;
  const att = (s) => s;
  const A = [
    { id: 'fdj-ecart', niv: 'att', module: 'fdj', date: '2026-10-08', titre: 'Contrôle FDJ, semaine 41 : ' + eur2(CTRL_FDJ.pari ? CTRL_FDJ.pari.ecart : 0, true) + ', hors de la zone normale',
      texte: 'Parions Sport isolé, ticket par ticket : un pari de ' + eur2(PARIONS.montant) + ' sorti du terminal jeudi 8 octobre à 14 h 31 min 08 s, absent de la caisse. Le ticket ajouté, la semaine revient à ' + eur2(CTRL_FDJ.apres || 0, true) + ', dans la zone.', action: 'Voir le contrôle' },
    { id: 'vir-bp', niv: 'info', module: 'tresorerie', date: AUJ, titre: 'Virer ' + eur(3240000) + ' de la BNP vers la Banque Populaire, avant jeudi',
      texte: 'Recharges de jeudi (3 470 €) et facture Logista de lundi (29 330 €), moins les 400 € déjà sur le compte.', action: 'Voir la semaine', tache: 'vir-bp', onglet: 'semaine' },
    { id: 'fdj-alim', niv: 'info', module: 'tresorerie', date: AUJ, titre: 'Alimenter le compte FDJ : ' + eur(554000) + ' avant mercredi',
      texte: 'Le relevé de la semaine 41 (5 900 €) est prélevé mercredi. Le compte FDJ a 360 €.', action: 'Voir la semaine', tache: 'fdj', onglet: 'semaine' },
    { id: 'especes', niv: 'info', module: 'caisse', date: AUJ, titre: 'Espèces en caisse : ' + eur(ESPECES_COFFRE) + ' depuis la collecte de vendredi',
      texte: 'Espèces encaissées depuis le vendredi 9 octobre à 20 h 30, gains de jeux payés au comptoir déduits. Prochaine collecte : vendredi 16 octobre à 20 h 30.', action: 'Voir la caisse', tache: 'especes' },
    { id: 'coca', niv: 'att', module: 'factures', date: '2026-10-09', titre: 'Coca-Cola 33 cl : ' + pctS(6.8, 1) + ' sur la facture Metro du 9 octobre',
      texte: '10,51 € HT le pack de 24, contre 9,84 € le 25 septembre. Prix de vente inchangé : la marge du produit baisse de 3 points.', action: 'Voir la facture', facture: FACT_METRO && FACT_METRO.id },
    { id: 'cafe', niv: 'att', module: 'rentabilite', date: '2026-10-01', titre: 'Café : ' + r9.tasses_kg + ' tasses par kilo en septembre, environ 138 attendues',
      texte: nb(r9.tasses) + ' cafés vendus pour ' + r9.cafe_kg + ' kg achetés. Cafés offerts, réglage du moulin ou ventes oubliées en caisse : à vérifier.', action: 'Voir les ratios' },
    { id: 'annul', niv: 'att', module: 'caisse', date: '2026-10-10', titre: 'Trois annulations après paiement, samedi 10 octobre entre 19 h 52 et 20 h 01',
      texte: 'Caisse 2, 64,80 € au total. Les autres annulations du mois ont lieu avant l’encaissement.', action: 'Voir la caisse', jour: '2026-10-10' },
    { id: 'fraise', niv: 'info', module: 'stock', date: AUJ, titre: 'Fraise glacée 10 ml : ' + FRAISE.stock + ' flacons, rupture dans ' + Math.round(FRAISE.stock / (FRAISE.v4 / 28)) + ' jours',
      texte: 'Ventes en hausse de ' + FRAISE.tendance + ' % sur quatre semaines. À ajouter à la commande de jeudi.', action: 'Voir la commande' },
    { id: 'vanille', niv: 'info', module: 'stock', date: AUJ, titre: 'Vanille caramel 50 ml : ' + VANILLE.tendance + ' % sur quatre semaines',
      texte: 'À arrêter : écouler les ' + VANILLE.stock + ' flacons restants. Classic blond 10 ml recule aussi (' + CLASSIC.tendance + ' %), à réduire.', action: 'Voir le stock' },
    { id: 'energie', niv: 'info', module: 'tresorerie', date: '2026-10-01', titre: 'Électricité : +18 % sur un an',
      texte: 'Contrat à remettre en concurrence avant le 31 décembre. Télésurveillance : contrat qui se renouvelle seul fin décembre.', action: 'Voir les charges fixes', onglet: 'fixes' },
    { id: 'efact', niv: 'info', module: 'rentabilite', date: '2026-09-01', titre: 'Facture électronique : vos ventes transmises à partir du 1er septembre 2027',
      texte: 'Réception obligatoire depuis le 1er septembre 2026 (vos factures arrivent déjà ici). Émission et e-reporting pour les PME au 1er septembre 2027.', action: 'Voir le calendrier' },
    { id: 'vape-sept', niv: 'ok', module: 'rentabilite', date: '2026-10-02', titre: 'Vape : achats de septembre supérieurs aux ventes de ' + eur(ach9 - cout9),
      texte: 'Écart expliqué : 14 nouvelles références mises en rayon en septembre (stock initial).', action: 'Voir les ratios', resolue: true },
    { id: 'aout', niv: 'ok', module: 'tresorerie', date: '2026-08-24', titre: 'Août : trésorerie passée sous une facture Logista d’avance',
      texte: 'Point bas de ' + eur(Math.min(...D.serie.map((x) => x.total))) + ' le 24 août, après le corner CBD et la facture Logista. Remonté au-dessus dès le 4 septembre.', action: 'Voir les 14 semaines', onglet: 'quatorze', resolue: true },
  ];
  if (plan.niveau !== 'ok') {
    A.unshift({ id: 'plan', niv: plan.niveau === 'ko' ? 'ko' : 'att', module: 'tresorerie', onglet: 'plan', date: AUJ, titre: maj(plan.ciel) + ' (simulation en cours)',
      texte: maj(SIM.quand[plan.kb]) + ', il reste ' + eur(plan.bas * 100) + '. Il manque ' + eur(plan.manque * 100) + ' pour garder une facture Logista d’avance.', action: 'Voir le plan de vol' });
  }
  return A.map((a) => Object.assign(a, { traitee: !!a.resolue || !!ETAT.traitees[a.id] || (a.tache && ETAT.faits[a.tache]) }));
}
const NIV_LIB = { ko: 'Alerte', att: 'À vérifier', info: 'À faire', ok: 'Résolu' };

/* ------------------------------------------------------------------ boîte vocale */
const VOCAUX = [
  { date: AUJ, h: '18:42', qui: 'Mme Lefèvre', num: '06 •• •• •• 48', txt: 'Bonjour, c’est Madame Lefèvre. Est-ce que vous pouvez me garder mon journal et un carnet de timbres pour demain matin, vers 9 heures ? Merci, bonne soirée !',
    resume: 'Son journal et un carnet de timbres à garder pour demain, 9 h.', envoye: 'Julien, 18 h 43' },
  { date: AUJ, h: '11:08', qui: 'Livreur Logista', num: '01 •• •• •• 20', txt: 'Bonjour, livraison cadencée confirmée mercredi 21, entre 7 h et 7 h 30. Merci de prévoir quelqu’un à l’ouverture.',
    resume: 'Livraison tabac confirmée mercredi 21 octobre, entre 7 h et 7 h 30.', envoye: 'Julien, 11 h 09' },
  { date: '2026-10-12', h: '16:25', qui: 'M. Bertin', num: '07 •• •• •• 12', txt: 'Oui bonjour, je voulais savoir si vous aviez des cartes cadeaux de 50 euros, c’est pour un anniversaire samedi.',
    resume: 'Cherche une carte cadeau de 50 € pour samedi. À rappeler.', envoye: 'Inès, 16 h 26' },
  { date: '2026-10-12', h: '09:51', qui: 'Cabinet comptable', num: '01 •• •• •• 77', txt: 'Bonjour Julien, c’est le cabinet. Il nous manquerait juste le relevé PMU de fin septembre pour boucler le mois. Merci !',
    resume: 'Il manque le relevé PMU de fin septembre. Ajouté au pack de septembre.', envoye: 'Julien, 09 h 52' },
  { date: '2026-10-10', h: '19:14', qui: 'Mme Garnier', num: '06 •• •• •• 03', txt: 'Bonsoir, j’ai oublié mon parapluie bleu ce midi au comptoir, je repasse lundi le chercher.',
    resume: 'Parapluie bleu oublié samedi midi, elle repasse lundi.', envoye: 'Mehdi, 19 h 15' },
  { date: '2026-10-09', h: '14:02', qui: 'Fournisseur CBD', num: '04 •• •• •• 61', txt: 'Bonjour, nouveau lot de Lemon Haze disponible, analyses reçues, je vous envoie la fiche par mail.',
    resume: 'Nouveau lot de Lemon Haze, fiche et analyses envoyées par mail.', envoye: 'Julien, 14 h 03' },
];

/* ------------------------------------------------------------------ calculs semaine */
const SEM = D.semaine;
const SORTIE_LIB = { Timbres: 'Timbres', PMU: 'PMU', FDJ: 'FDJ', Recharges: 'Recharges', URSSAF: 'URSSAF', Logista: 'Logista' };

/* ------------------------------------------------------------------ échelles et graphiques SVG
   Chaque graphique est dessiné à la largeur réelle de son cadre (1 unité = 1 pixel) :
   les textes gardent leur taille, du téléphone au grand écran. */
function pasJoli(brut) {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(brut, 1e-9))));
  const f = brut / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
function echelle(min, max, n = 4) {
  if (max === min) max = min + 1;
  const pas = pasJoli((max - min) / n);
  const a = Math.floor(min / pas) * pas, b = Math.ceil(max / pas) * pas;
  const t = [];
  for (let v = a; v <= b + pas / 2; v += pas) t.push(Math.round(v * 1000) / 1000);
  return { min: a, max: b, ticks: t };
}
const tip = (html) => ' data-tip="' + esc(html) + '"';
const ligneTip = (coul, lib, val) => '<div class="il"><span>' + (coul ? '<i style="background:' + coul + '"></i>' : '') + esc(lib) + '</span><span>' + esc(val) + '</span></div>';
let N_GRAPHE = 0;
const idG = (o) => o.id ? o.id + '-' + (++N_GRAPHE) : 'g' + (++N_GRAPHE);
const f1 = (x) => (Math.round(x * 10) / 10).toString();

// graphiques mesurés : le cadre est posé, puis dessiné à sa largeur
const GRAPHES = [];
function graphe(gen, cls = '') {
  GRAPHES.push(gen);
  return '<div class="graphe' + (cls ? ' ' + cls : '') + '" data-graphe="' + (GRAPHES.length - 1) + '"></div>';
}
function peindreGraphes(racine = document, force = false) {
  $$('[data-graphe]', racine).forEach((el) => {
    const gen = GRAPHES[+el.dataset.graphe];
    if (!gen) return;
    const w = Math.round(el.getBoundingClientRect().width);
    if (!w) return;
    if (!force && el._w === w && el.firstChild) return;
    el._w = w;
    el.innerHTML = gen(Math.max(200, w));
  });
}

// courbe lissée sans dépassement (monotone)
function tangentes(P) {
  const n = P.length, m = [], t = new Array(n).fill(0);
  if (n < 2) return t;
  for (let i = 0; i < n - 1; i++) m[i] = (P[i + 1][1] - P[i][1]) / ((P[i + 1][0] - P[i][0]) || 1);
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  return t;
}
function segment(P, T, a, b, lisse = true) {
  let d = 'M' + f1(P[a][0]) + ',' + f1(P[a][1]);
  for (let i = a; i < b; i++) {
    if (!lisse) { d += 'L' + f1(P[i + 1][0]) + ',' + f1(P[i + 1][1]); continue; }
    const dx = P[i + 1][0] - P[i][0];
    d += 'C' + f1(P[i][0] + dx / 3) + ',' + f1(P[i][1] + T[i] * dx / 3) + ' ' + f1(P[i + 1][0] - dx / 3) + ',' + f1(P[i + 1][1] - T[i + 1] * dx / 3) + ' ' + f1(P[i + 1][0]) + ',' + f1(P[i + 1][1]);
  }
  return d;
}

// courbe : points [{lib, v, note}] en euros ; seuils, prévision (indice où commencent les pointillés), marques, annotations
function svgCourbe(o) {
  const W = o.w || 760, H = o.h || 260;
  const mg = { g: o.margeG != null ? o.margeG : 54, d: o.margeD != null ? o.margeD : 74, h: o.margeH != null ? o.margeH : 20, b: o.margeB != null ? o.margeB : 30 };
  const vals = o.pts.map((p) => p.v);
  const extra = (o.seuils || []).map((s) => s.v).concat(o.fantome ? o.fantome.vals : []);
  const e = echelle(Math.min(o.min != null ? o.min : 0, ...vals, ...extra), Math.max(...vals, ...extra) * 1.06, o.nTicks || 4);
  const n = o.pts.length;
  const X = (i) => mg.g + (i / Math.max(1, n - 1)) * (W - mg.g - mg.d);
  const Y = (v) => mg.h + (1 - (v - e.min) / (e.max - e.min)) * (H - mg.h - mg.b);
  const id = idG(o);
  const coul = o.couleur || 'var(--bleu)';
  const P = o.pts.map((p, i) => [X(i), Y(p.v)]);
  const T = tangentes(P);
  const lisse = o.lisse !== false;
  const pf = o.prevision == null ? n - 1 : Math.min(o.prevision, n - 1);
  const base = Y(Math.max(e.min, 0));
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(o.titre || 'Graphique') + '">';
  s += '<defs><linearGradient id="ga-' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + coul + '" stop-opacity="' + (o.opaciteAire || 0.28) + '"/><stop offset="1" stop-color="' + coul + '" stop-opacity="0"/></linearGradient></defs>';
  s += '<g class="grille">' + e.ticks.map((t) => '<line x1="' + mg.g + '" x2="' + (W - mg.d) + '" y1="' + f1(Y(t)) + '" y2="' + f1(Y(t)) + '"' + (t === 0 ? ' class="zero"' : '') + '/>').join('') + '</g>';
  s += e.ticks.map((t) => '<text x="' + (mg.g - 10) + '" y="' + f1(Y(t) + 4) + '" text-anchor="end">' + (o.fmtAxe ? o.fmtAxe(t) : keurT(t)) + '</text>').join('');
  (o.seuils || []).forEach((sl) => {
    s += '<line class="' + (sl.cls || 'seuil') + '" x1="' + mg.g + '" x2="' + (W - mg.d) + '" y1="' + f1(Y(sl.v)) + '" y2="' + f1(Y(sl.v)) + '"/>';
    s += o.seuilsDedans || mg.d < 70
      ? '<text x="' + (o.seuilsFin ? W - mg.d - 6 : mg.g + 8) + '" y="' + f1(Y(sl.v) + (sl.dessous ? 15 : -6)) + '"' + (o.seuilsFin ? ' text-anchor="end"' : '') + ' class="' + (sl.txtCls || 'moyen') + '">' + esc(sl.lib) + '</text>'
      : '<text x="' + (W - mg.d + 8) + '" y="' + f1(Y(sl.v) + 4) + '" class="' + (sl.txtCls || 'moyen') + '">' + esc(sl.lib) + '</text>';
  });
  if (o.aire !== false) {
    s += '<path class="g-aire" d="' + segment(P, T, 0, pf, lisse) + 'L' + f1(P[pf][0]) + ',' + f1(base) + 'L' + f1(P[0][0]) + ',' + f1(base) + 'Z" fill="url(#ga-' + id + ')"/>';
    if (pf < n - 1) s += '<path class="g-aire" d="' + segment(P, T, pf, n - 1, lisse) + 'L' + f1(P[n - 1][0]) + ',' + f1(base) + 'L' + f1(P[pf][0]) + ',' + f1(base) + 'Z" fill="url(#ga-' + id + ')" opacity=".45"/>';
  }
  if (o.fantome) {
    const PF = o.fantome.vals.map((v, i) => [X(i), Y(v)]);
    s += '<path class="g-fondu fantome" d="' + segment(PF, tangentes(PF), 0, n - 1, lisse) + '" fill="none" stroke="var(--encre-4)" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round"/>';
  }
  s += '<path class="g-trace" pathLength="1" d="' + segment(P, T, 0, pf, lisse) + '" fill="none" stroke="' + coul + '" stroke-width="' + (o.epaisseur || 2.6) + '" stroke-linejoin="round" stroke-linecap="round"/>';
  if (pf < n - 1) s += '<path class="g-fondu" d="' + segment(P, T, pf, n - 1, lisse) + '" fill="none" stroke="' + coul + '" stroke-width="' + (o.epaisseur || 2.6) + '" stroke-dasharray="6 5" stroke-linecap="round"/>';
  (o.axeX || []).forEach((a) => { s += '<text x="' + f1(X(a.i)) + '" y="' + (H - 9) + '" text-anchor="' + (a.ancre || 'middle') + '">' + esc(a.lib) + '</text>'; });
  (o.marques || []).forEach((m, k) => {
    const ym = Y(o.pts[m.i].v);
    if (m.eviter) {   // un événement occupe le dessus du point : l'étiquette passe dessous, ou sur le côté
      if (ym + 24 < H - mg.b - 6) { m.dy = 20; m.dx = 0; m.ancre = m.i === 0 ? 'start' : m.i === n - 1 ? 'end' : 'middle'; }
      else { m.dy = 4; m.dx = m.i >= n - 2 ? -12 : 12; m.ancre = m.i >= n - 2 ? 'end' : 'start'; }
    }
    s += '<circle class="g-point" style="--d:' + (1.1 + k * 0.12) + 's" cx="' + f1(X(m.i)) + '" cy="' + f1(ym) + '" r="5" fill="' + (m.coul || coul) + '" stroke="var(--papier)" stroke-width="2.5"/>';
    if (m.lib) s += '<text class="g-fondu ' + (m.cls || 'fort') + '" x="' + f1(X(m.i) + (m.dx || 0)) + '" y="' + f1(ym + (m.dy || -12)) + '" text-anchor="' + (m.ancre || 'middle') + '">' + esc(m.lib) + '</text>';
  });
  const fin = n - 1;
  if (o.pointFinal !== false) {
    s += '<circle class="g-point" cx="' + f1(X(fin)) + '" cy="' + f1(Y(o.pts[fin].v)) + '" r="5.5" fill="' + coul + '" stroke="var(--papier)" stroke-width="2.5"/>';
    if (o.finLib !== false) s += '<text class="g-fondu fort grand" x="' + f1(X(fin) + 10) + '" y="' + f1(Y(o.pts[fin].v) + 4) + '">' + esc(o.finLib || keur(o.pts[fin].v)) + '</text>';
  }
  // événements : des pastilles numérotées sur un rail au-dessus de la courbe, reliées à leur quinzaine
  const evs = o.evenements || [];
  if (evs.length) {
    const R = 11, pasR = 2 * R + 3, yRail = Math.max(R + 2, mg.h - R - 5), maxX = W - mg.d + 6;
    const xs = [];
    evs.forEach((ev, k) => { let x = X(ev.i); if (k && x < xs[k - 1] + pasR) x = xs[k - 1] + pasR; xs.push(x); });
    if (xs[xs.length - 1] > maxX) { xs[xs.length - 1] = maxX; for (let k = xs.length - 2; k >= 0; k--) xs[k] = Math.min(xs[k], xs[k + 1] - pasR); }
    evs.forEach((ev, k) => {
      const x = X(ev.i), y = Y(o.pts[ev.i].v);
      s += '<g class="g-point evt" style="--d:' + (1.1 + k * 0.1) + 's"><path d="M' + f1(xs[k]) + ',' + f1(yRail + R) + 'L' + f1(x) + ',' + f1(y - 5) + '" stroke="#111a33" stroke-opacity=".35" stroke-width="1.3" stroke-dasharray="2 3" fill="none"/>' +
        '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="4.5" fill="#111a33" stroke="var(--papier)" stroke-width="2"/>' +
        '<circle cx="' + f1(xs[k]) + '" cy="' + f1(yRail) + '" r="' + R + '" fill="#111a33" stroke="var(--papier)" stroke-width="2"/><text class="evt-n" x="' + f1(xs[k]) + '" y="' + f1(yRail + 4) + '" text-anchor="middle">' + ev.n + '</text></g>';
    });
  }
  const bande = (W - mg.g - mg.d) / Math.max(1, n - 1);
  o.pts.forEach((p, i) => {
    s += '<g class="cible-g"><line class="viseur" x1="' + f1(X(i)) + '" x2="' + f1(X(i)) + '" y1="' + mg.h + '" y2="' + f1(H - mg.b) + '"/><circle class="viseur-pt" cx="' + f1(X(i)) + '" cy="' + f1(Y(p.v)) + '" r="5" fill="' + coul + '" stroke="var(--papier)" stroke-width="2.5"/>' +
      '<rect class="cible" data-i="' + i + '" x="' + f1(X(i) - bande / 2) + '" y="' + mg.h + '" width="' + f1(bande) + '" height="' + f1(H - mg.h - mg.b) + '" fill="transparent"' +
      tip('<b>' + esc(p.lib) + '</b>' + ligneTip(coul, o.serie || 'Trésorerie', eur(p.v * 100)) + (o.fantome ? ligneTip('var(--encre-4)', o.fantome.lib, eur(o.fantome.vals[i] * 100)) : '') + (p.note ? '<div>' + esc(p.note) + '</div>' : '')) + '/></g>';
  });
  if (o.curseur != null) {
    const c = Math.max(0, Math.min(n - 1, o.curseur));
    s += '<g class="curseur-g" data-xs="' + o.pts.map((p, i) => f1(X(i))).join(',') + '" data-ys="' + o.pts.map((p) => f1(Y(p.v))).join(',') + '"><line x1="' + f1(X(c)) + '" x2="' + f1(X(c)) + '" y1="' + (mg.h - 4) + '" y2="' + f1(H - mg.b) + '"/><circle cx="' + f1(X(c)) + '" cy="' + f1(Y(o.pts[c].v)) + '" r="7"/></g>';
  }
  s += '</svg>';
  (o.annotations || []).forEach((a, k) => {
    s += '<div class="annot' + (a.cote ? ' ' + a.cote : '') + '" style="left:' + f1(X(a.i)) + 'px;top:' + f1(Y(o.pts[a.i].v) - (a.dy || 0)) + 'px;--d:' + (1.2 + k * 0.25) + 's">' + (a.ic ? ic(a.ic) : '') + '<span>' + esc(a.txt) + (a.sous ? '<small>' + esc(a.sous) + '</small>' : '') + '</span></div>';
  });
  return s;
}

// colonnes empilées : labels, séries [{lib, coul, vals}]
function svgEmpile(o) {
  const W = o.w || 760, H = o.h || 270, mg = { g: o.margeG || 54, d: 10, h: o.margeH || 20, b: 30 };
  const tot = o.labels.map((_, i) => o.series.reduce((s, se) => s + Math.max(0, se.vals[i]), 0));
  const e = echelle(0, Math.max(...tot) * 1.06, 4);
  const n = o.labels.length;
  const bande = (W - mg.g - mg.d) / n;
  const lb = Math.min(o.largeur || 40, bande * 0.58);
  const Y = (v) => mg.h + (1 - (v - e.min) / (e.max - e.min)) * (H - mg.h - mg.b);
  const id = idG(o);
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(o.titre || '') + '">';
  s += '<defs><pattern id="hach-' + id + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#fff" stroke-width="2.2" stroke-opacity=".5"/></pattern></defs>';
  s += '<g class="grille">' + e.ticks.map((t) => '<line x1="' + mg.g + '" x2="' + (W - mg.d) + '" y1="' + f1(Y(t)) + '" y2="' + f1(Y(t)) + '"' + (t === 0 ? ' class="zero"' : '') + '/>').join('') + '</g>';
  s += e.ticks.map((t) => '<text x="' + (mg.g - 10) + '" y="' + f1(Y(t) + 4) + '" text-anchor="end">' + keurT(t) + '</text>').join('');
  o.labels.forEach((lab, i) => {
    const x = mg.g + i * bande + (bande - lb) / 2;
    let cumul = 0;
    const segs = [];
    const visibles = o.series.map((se) => Math.max(0, se.vals[i]));
    const dernier = visibles.reduce((k, v, j) => (v > 0 ? j : k), -1);
    o.series.forEach((se, j) => {
      const v = visibles[j];
      if (v <= 0) return;
      const y0 = Y(cumul), y1 = Y(cumul + v) + (j < dernier ? 2 : 0);
      if (y0 - y1 <= 0.5) { cumul += v; return; }
      const top = j === dernier ? Math.min(6, lb / 2, y0 - y1) : 0;
      const d = 'M' + f1(x) + ',' + f1(y0) + 'V' + f1(y1 + top) + (top ? 'Q' + f1(x) + ',' + f1(y1) + ' ' + f1(x + top) + ',' + f1(y1) + 'H' + f1(x + lb - top) + 'Q' + f1(x + lb) + ',' + f1(y1) + ' ' + f1(x + lb) + ',' + f1(y1 + top) : 'H' + f1(x + lb)) + 'V' + f1(y0) + 'Z';
      segs.push('<path d="' + d + '" fill="' + se.coul + '"/>' + (o.hachure && o.hachure(i) ? '<path d="' + d + '" fill="url(#hach-' + id + ')"/>' : ''));
      cumul += v;
    });
    s += '<g class="g-barre" style="--k:' + i + '">' + segs.join('') + '</g>';
    if (!o.pasLabels || i % o.pasLabels === 0 || i === n - 1) s += '<text x="' + f1(x + lb / 2) + '" y="' + (H - 9) + '" text-anchor="middle">' + esc(lab) + '</text>';
    if (o.etiquette && o.etiquette(i)) s += o.etiquetteNiveau
      ? '<text class="g-fondu ' + (o.etiquetteClasse || 'fort') + '" x="' + f1(x + lb / 2) + '" y="' + f1(Y(o.etiquetteNiveau(i)) + 16) + '" text-anchor="middle">' + esc(o.etiquette(i)) + '</text>'
      : '<text class="g-fondu fort" x="' + f1(x + lb / 2) + '" y="' + f1(Y(tot[i]) - 8) + '" text-anchor="middle">' + esc(o.etiquette(i)) + '</text>';
    const t = '<b>' + esc(o.titresX ? o.titresX[i] : lab) + '</b>' + o.series.slice().reverse().map((se) => ligneTip(se.coul, se.lib, eur(se.vals[i] * 100))).join('') + ligneTip('', o.libTotal || 'Total', eur(tot[i] * 100));
    s += '<g class="cible-g"><rect class="survol" x="' + f1(mg.g + i * bande + 2) + '" y="' + mg.h + '" width="' + f1(bande - 4) + '" height="' + f1(H - mg.h - mg.b) + '" rx="8" fill="rgba(20,26,46,.05)"/><rect class="cible" x="' + f1(mg.g + i * bande) + '" y="' + mg.h + '" width="' + f1(bande) + '" height="' + f1(H - mg.h - mg.b) + '" fill="transparent"' + tip(t) + '/></g>';
  });
  return s + '</svg>';
}

// colonnes simples : vals, labels ; prevu(i) hachuré ; couleurs ; étiquettes ; libellés sous l'axe
function svgColonnes(o) {
  const W = o.w || 760, H = o.h || 220;
  const mg = { g: o.margeG != null ? o.margeG : 50, d: o.margeD || 8, h: o.margeH != null ? o.margeH : 24, b: o.basAxe || 28 };
  const vals = o.vals;
  const e = echelle(Math.min(0, ...vals), o.max || Math.max(...vals) * 1.1, o.nTicks || 4);
  const n = vals.length;
  const bande = (W - mg.g - mg.d) / n;
  const lb = Math.min(o.largeur || 36, bande * (o.remplissage || 0.64));
  const Y = (v) => mg.h + (1 - (v - e.min) / (e.max - e.min)) * (H - mg.h - mg.b);
  const id = idG(o);
  const coulDe = (i) => (o.couleurs ? o.couleurs[i] : vals[i] < 0 ? 'var(--rouge)' : (o.couleur || 'var(--bleu)'));
  const prevus = vals.map((_, i) => !!(o.prevu && o.prevu(i)));
  const coulsPrev = Array.from(new Set(vals.map((_, i) => (prevus[i] ? coulDe(i) : null)).filter(Boolean)));
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(o.titre || '') + '">';
  s += '<defs><linearGradient id="rf-' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    coulsPrev.map((c, k) => '<pattern id="hp-' + id + '-' + k + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="' + c + '" fill-opacity=".14"/><line x1="0" y1="0" x2="0" y2="7" stroke="' + c + '" stroke-width="2.4" stroke-opacity=".75"/></pattern>').join('') + '</defs>';
  s += '<g class="grille">' + e.ticks.map((t) => '<line x1="' + mg.g + '" x2="' + (W - mg.d) + '" y1="' + f1(Y(t)) + '" y2="' + f1(Y(t)) + '"' + (t === 0 ? ' class="zero"' : '') + '/>').join('') + '</g>';
  if (o.axe !== false) s += e.ticks.map((t) => '<text x="' + (mg.g - 10) + '" y="' + f1(Y(t) + 4) + '" text-anchor="end">' + (o.fmtAxe ? o.fmtAxe(t) : keurT(t)) + '</text>').join('');
  vals.forEach((v, i) => {
    const x = mg.g + i * bande + (bande - lb) / 2;
    const y0 = Y(Math.max(0, e.min)), y1 = Y(v);
    const haut = Math.min(y0, y1), h = Math.max(1.5, Math.abs(y0 - y1));
    const r = Math.min(o.arrondi != null ? o.arrondi : 6, lb / 2, h);
    const neg = v < 0;
    const coul = coulDe(i);
    const d = neg
      ? 'M' + f1(x) + ',' + f1(haut) + 'h' + f1(lb) + 'v' + f1(h - r) + 'q0,' + f1(r) + ' -' + f1(r) + ',' + f1(r) + 'h-' + f1(lb - 2 * r) + 'q-' + f1(r) + ',0 -' + f1(r) + ',-' + f1(r) + 'z'
      : 'M' + f1(x) + ',' + f1(haut + h) + 'v-' + f1(h - r) + 'q0,-' + f1(r) + ' ' + f1(r) + ',-' + f1(r) + 'h' + f1(lb - 2 * r) + 'q' + f1(r) + ',0 ' + f1(r) + ',' + f1(r) + 'v' + f1(h - r) + 'z';
    const cls = 'g-barre' + (neg ? ' bas' : '');
    if (prevus[i]) s += '<path class="' + cls + '" style="--k:' + i + '" d="' + d + '" fill="url(#hp-' + id + '-' + coulsPrev.indexOf(coul) + ')" stroke="' + coul + '" stroke-width="1.4" stroke-opacity=".85"/>';
    else s += '<g class="' + cls + '" style="--k:' + i + '"><path d="' + d + '" fill="' + coul + '"/><path d="' + d + '" fill="url(#rf-' + id + ')"/></g>';
    if (o.labels && (!o.pasLabels || i % o.pasLabels === 0 || (o.dernierLabel && i === n - 1))) s += '<text x="' + f1(x + lb / 2) + '" y="' + f1(H - mg.b + 17) + '" text-anchor="middle"' + (o.labelClasse ? ' class="' + o.labelClasse(i) + '"' : '') + '>' + esc(o.labels[i]) + '</text>';
    if (o.etiquette && o.etiquette(i)) s += '<text class="g-fondu ' + (o.etiquetteClasse ? o.etiquetteClasse(i) : 'fort') + '" x="' + f1(x + lb / 2) + '" y="' + f1(neg ? y0 + h + 15 : haut - 8) + '" text-anchor="middle">' + esc(o.etiquette(i)) + '</text>';
    if (o.sous && o.sous(i)) {
      const so = [].concat(o.sous(i));
      s += '<text x="' + f1(x + lb / 2) + '" y="' + f1(H - mg.b + 34) + '" text-anchor="middle" class="moyen">' + so.map((t, k) => '<tspan x="' + f1(x + lb / 2) + '"' + (k ? ' dy="14"' : '') + (k ? ' class="ko"' : '') + '>' + esc(t) + '</tspan>').join('') + '</text>';
    }
    s += '<g class="cible-g"><rect class="survol" x="' + f1(mg.g + i * bande + 2) + '" y="' + f1(mg.h - 6) + '" width="' + f1(bande - 4) + '" height="' + f1(H - mg.h - mg.b + 6) + '" rx="9" fill="rgba(20,26,46,.05)"/><rect class="cible" x="' + f1(mg.g + i * bande) + '" y="' + f1(mg.h - 6) + '" width="' + f1(bande) + '" height="' + f1(H - mg.h - mg.b + 6) + '" fill="transparent"' + (o.tips ? tip(o.tips(i)) : '') + '/></g>';
  });
  if (e.min < 0) s += '<line x1="' + mg.g + '" x2="' + (W - mg.d) + '" y1="' + f1(Y(0)) + '" y2="' + f1(Y(0)) + '" stroke="var(--axe)"/>';
  return s + '</svg>';
}

function svgEtincelle(vals, coul = 'var(--bleu)', w = 160, h = 34) {
  const min = Math.min(...vals), max = Math.max(...vals);
  const X = (i) => 3 + (i / (vals.length - 1)) * (w - 8);
  const Y = (v) => 4 + (1 - (v - min) / (max - min || 1)) * (h - 9);
  const P = vals.map((v, i) => [X(i), Y(v)]);
  const d = segment(P, tangentes(P), 0, P.length - 1, true);
  const id = 'et' + (++N_GRAPHE);
  return '<svg class="etincelle" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + coul + '" stop-opacity=".3"/><stop offset="1" stop-color="' + coul + '" stop-opacity="0"/></linearGradient></defs>' +
    '<path class="g-aire" d="' + d + 'L' + f1(X(vals.length - 1)) + ',' + h + 'L3,' + h + 'Z" fill="url(#' + id + ')"/><path class="g-trace" pathLength="1" d="' + d + '" fill="none" stroke="' + coul + '" stroke-width="2.2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/></svg>';
}

// jauge : nombre de factures Logista d'avance au point bas (0 → 3)
function svgJauge(val, max = 3, surNuit = false) {
  const cx = 130, cy = 122, r = 98;
  const ang = (v) => Math.PI * (1 - Math.min(Math.max(v, 0), max) / max);
  const pt = (v, rr = r) => [cx + rr * Math.cos(ang(v)), cy - rr * Math.sin(ang(v))];
  const arc = (a, b, coul, ep = 15) => { const p0 = pt(a), p1 = pt(b); return '<path d="M' + f1(p0[0]) + ',' + f1(p0[1]) + ' A' + r + ',' + r + ' 0 0 1 ' + f1(p1[0]) + ',' + f1(p1[1]) + '" fill="none" stroke="' + coul + '" stroke-width="' + ep + '" stroke-linecap="round"/>'; };
  const z1 = SIM.alerte / SIM.seuil;
  let s = '<svg viewBox="0 0 260 150" role="img" aria-label="' + esc(F1.format(val) + ' facture Logista d’avance au point bas') + '">';
  s += arc(0.02, max - 0.02, surNuit ? 'rgba(255,255,255,.08)' : 'var(--papier-3)', 15);
  s += arc(0.02, z1 - 0.04, 'var(--rouge)') + arc(z1 + 0.06, 0.96, 'var(--ambre)') + arc(1.06, max - 0.02, 'var(--vert-vif)');
  [0, 1, 2, 3].forEach((t) => { const a = pt(t, r - 26); s += '<text x="' + f1(a[0]) + '" y="' + f1(a[1] + 4) + '" text-anchor="middle"' + (surNuit ? ' style="fill:var(--lune-3)"' : '') + '>' + t + '</text>'; });
  const pn = pt(val, r - 10);
  const deg = (Math.PI - ang(val)) * 180 / Math.PI;
  s += '<g class="g-aiguille" style="transform-box:view-box;transform-origin:' + cx + 'px ' + cy + 'px;--a0:-' + f1(deg) + 'deg"><line x1="' + cx + '" y1="' + cy + '" x2="' + f1(pn[0]) + '" y2="' + f1(pn[1]) + '" stroke="var(--rouge)" stroke-width="4.5" stroke-linecap="round"/></g>';
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="10" fill="' + (surNuit ? '#fff' : 'var(--encre)') + '"/><circle cx="' + cx + '" cy="' + cy + '" r="3.5" fill="' + (surNuit ? 'var(--nuit-2)' : 'var(--papier)') + '"/>';
  return s + '</svg>';
}

/* ------------------------------------------------------------------ chiffres qui s'animent */
const fin = (s) => s.replace(/ (?=\d)/g, ' ');
function grosMontant(c, centimes = true) {
  if (!centimes) return esc(fin(eur(c)));
  const s = fin(eur2(c));
  const i = s.lastIndexOf(',');
  return s.slice(0, i) + '<small>' + s.slice(i) + '</small>';
}
function fmtCompte(c, f) {
  if (f === 'eur2') return eur2(c);
  if (f === 'gros') return grosMontant(c, true);
  if (f === 'grosE') return grosMontant(c, false);
  if (f === 'nb') return nb(c);
  if (f === 'eurS') return eur(c, false, true);
  return eur(c);
}
function compte(c, f = 'eur') { return '<span class="chiffre-anim" data-v="' + Math.round(c) + '" data-f="' + f + '">' + fmtCompte(Math.round(c), f) + '</span>'; }
const mouvementReduit = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function lancerComptes(racine) {
  const els = $$('.chiffre-anim', racine);
  if (!els.length || mouvementReduit()) return;
  els.forEach((el) => { el._v = +el.dataset.v; el._f = el.dataset.f; });
  const t0 = performance.now() + 120, dur = 1300;
  const pas = (t) => {
    const k = Math.max(0, Math.min(1, (t - t0) / dur)), e = 1 - Math.pow(1 - k, 4);
    els.forEach((el) => { el.innerHTML = fmtCompte(Math.round(el._v * (0.62 + 0.38 * e)), el._f); });
    if (k < 1) requestAnimationFrame(pas);
    else els.forEach((el) => { el.innerHTML = fmtCompte(el._v, el._f); });
  };
  requestAnimationFrame(pas);
}

/* ------------------------------------------------------------------ petits composants */
function pastille(niv, txt) { return '<span class="pastille ' + niv + '">' + esc(txt) + '</span>'; }
function delta(v, inverse = false, suffixe = '') {
  if (v == null || !isFinite(v)) return '';
  const bon = inverse ? v < 0 : v > 0;
  const cls = Math.abs(v) < 0.05 ? 'neutre' : bon ? 'hausse' : 'baisse';
  return '<span class="delta ' + cls + '">' + pctS(v, Math.abs(v) < 10 ? 1 : 0) + suffixe + '</span>';
}
function carte(titre, corps, o = {}) {
  return '<section class="carte ' + (o.cls || '') + '"' + (o.id ? ' id="' + o.id + '"' : '') + '>' +
    (titre ? '<div class="carte-tete"><h2>' + titre + '</h2>' + (o.meta ? '<span class="meta">' + o.meta + '</span>' : '') + (o.actions ? '<div class="actions">' + o.actions + '</div>' : '') + '</div>' : '') +
    '<div class="carte-corps">' + corps + '</div>' + (o.pied ? '<div class="carte-pied">' + o.pied + '</div>' : '') + '</section>';
}
function seg(nom, options, valeur) {
  return '<div class="segments" role="group">' + options.map(([v, lib]) => '<button type="button" data-seg="' + nom + '" data-val="' + v + '" aria-pressed="' + (String(v) === String(valeur)) + '">' + lib + '</button>').join('') + '</div>';
}
function boutonsExport(cle, formats = ['xlsx', 'csv']) {
  return formats.map((f) => '<button class="bouton petit" type="button" data-action="export" data-cle="' + cle + '" data-format="' + f + '">' + ic(f === 'pdf' ? 'pdf' : 'export') + '<span>' + f.toUpperCase() + '</span></button>').join('');
}
function trier(liste, cle, sens, fn) {
  const v = fn || ((x) => x[cle]);
  return liste.slice().sort((a, b) => { const x = v(a), y = v(b); return (x > y ? 1 : x < y ? -1 : 0) * sens; });
}
function th(lib, cle, etatTri, n = false) {
  const actif = etatTri && etatTri.tri === cle;
  return '<th' + (n ? ' class="n"' : '') + (cle ? ' data-tri="' + cle + '"' : '') + (actif ? ' aria-sort="' + (etatTri.sens > 0 ? 'ascending' : 'descending') + '"' : '') + '>' + lib + (actif ? ' <span class="fleche">' + (etatTri.sens > 0 ? '▲' : '▼') + '</span>' : '') + '</th>';
}
