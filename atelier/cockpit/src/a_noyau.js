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
const PLAN_DEFAUT = { embauche: true, credit: true, salaire: 2000, cbd: false, agencement: false };
function lireSession() { try { return sessionStorage.getItem('cockpit-connecte') === '1'; } catch (e) { return false; } }
const ETAT = {
  route: 'cockpit',
  connecte: lireSession(),
  faits: MEM.faits || {},
  traitees: MEM.traitees || {},
  plan: Object.assign({}, PLAN_DEFAUT, MEM.plan || {}),
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
  { cle: 'embauche', titre: 'Embaucher pour fermer à 23 h', sous: 'Dès novembre : salaire et charges, moins les ventes du soir' },
  { cle: 'credit', titre: 'Solder le crédit restant', sous: '7 200 €, fin décembre ; 620 € par mois en moins ensuite' },
  { cle: 'salaire', titre: 'Votre salaire de gérant', sous: 'Dès janvier' },
  { cle: 'cbd', titre: 'Agrandir le rayon CBD', sous: '6 000 € de stock en novembre, marge qui monte ensuite' },
  { cle: 'agencement', titre: 'Refaire l’agencement', sous: '40 000 € HT en février' },
];
function calculPlan(p = ETAT.plan) {
  const pts = [SIM.depart];
  const det = [];
  let v = SIM.depart;
  for (let k = 1; k <= 13; k++) {
    const x = { base: SIM.base[k - 1], embauche: 0, credit: 0, salaire: 0, cbd: 0, agencement: 0 };
    if (p.embauche) x.embauche = k === 2 || k === 3 ? -600 : k >= 4 ? -150 : 0;
    if (p.credit) x.credit = k === 5 ? -7200 : k >= 6 ? 310 : 0;
    if (k >= 6) x.salaire = -p.salaire / 2;
    if (p.cbd) x.cbd = (k === 2 ? -6000 : 0) + SIM.cbd[k - 1];
    if (p.agencement) x.agencement = k === 8 ? -40000 : k >= 10 ? 200 : 0;
    const d = x.base + x.embauche + x.credit + x.salaire + x.cbd + x.agencement;
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
const EXPORT_FDJ = [
  { h: '14:27:52', jeu: 'Loto', mt: 220, ok: true },
  { h: '14:29:10', jeu: 'Grattage', mt: 500, ok: true },
  { h: '14:31:08', jeu: 'Grattage ×3', mt: 4500, ok: false },
  { h: '14:33:45', jeu: 'Paris sportifs', mt: 1000, ok: true },
  { h: '14:36:20', jeu: 'Loto', mt: 440, ok: true },
];

/* ------------------------------------------------------------------ alertes */
function construireAlertes() {
  const plan = calculPlan();
  const r9 = D.ratios[8];
  const ach9 = D.vape_achats['9'] || 0, cout9 = D.pnl[8].produits.vape_cout;
  const att = (s) => s;
  const A = [
    { id: 'fdj-ecart', niv: 'att', module: 'fdj', date: '2026-10-08', titre: 'Écart FDJ de ' + eur2(-4500) + ', jeudi 8 octobre à 14 h 31 min 08 s',
      texte: 'Trois tickets à gratter passés au terminal FDJ, absents de la caisse Strator. Le reste de la semaine est juste.', action: 'Voir le contrôle' },
    { id: 'vir-bp', niv: 'info', module: 'tresorerie', date: AUJ, titre: 'Virer ' + eur(3240000) + ' de la BNP vers la Banque Populaire, avant jeudi',
      texte: 'Recharges de jeudi (3 470 €) et facture Logista de lundi (29 330 €), moins les 400 € déjà sur le compte.', action: 'Voir la semaine', tache: 'vir-bp', onglet: 'semaine' },
    { id: 'fdj-alim', niv: 'info', module: 'tresorerie', date: AUJ, titre: 'Alimenter le compte FDJ : ' + eur(554000) + ' avant mercredi',
      texte: 'Le relevé de la semaine 41 (5 900 €) est prélevé mercredi. Le compte FDJ a 360 €.', action: 'Voir la semaine', tache: 'fdj', onglet: 'semaine' },
    { id: 'especes', niv: 'att', module: 'caisse', date: AUJ, titre: 'Déposer les espèces : ' + eur(ESPECES_COFFRE) + ' au coffre depuis samedi',
      texte: 'Quatre jours d’espèces nettes, après les gains payés au comptoir. Dernier dépôt : vendredi 9 octobre.', action: 'Voir la caisse', tache: 'especes' },
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

/* ------------------------------------------------------------------ échelles et graphiques SVG */
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

// courbe : points [{lib, v}] (valeurs en euros), options seuils, prévision (indice de départ des pointillés)
function svgCourbe(o) {
  const W = o.w || 760, H = o.h || 260, mg = { g: 54, d: o.margeD || 74, h: 14, b: 30 };
  const vals = o.pts.map((p) => p.v);
  const extra = (o.seuils || []).map((s) => s.v);
  const e = echelle(Math.min(0, ...vals, ...extra), Math.max(...vals, ...extra) * 1.04, 4);
  const X = (i) => mg.g + (i / (o.pts.length - 1)) * (W - mg.g - mg.d);
  const Y = (v) => mg.h + (1 - (v - e.min) / (e.max - e.min)) * (H - mg.h - mg.b);
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.titre || 'Graphique') + '">';
  s += '<g class="grille">' + e.ticks.map((t) => '<line x1="' + mg.g + '" x2="' + (W - mg.d) + '" y1="' + Y(t) + '" y2="' + Y(t) + '"/>').join('') + '</g>';
  s += e.ticks.map((t) => '<text x="' + (mg.g - 8) + '" y="' + (Y(t) + 4) + '" text-anchor="end">' + keurT(t) + '</text>').join('');
  (o.seuils || []).forEach((sl) => {
    s += '<line class="' + (sl.cls || 'seuil') + '" x1="' + mg.g + '" x2="' + (W - mg.d) + '" y1="' + Y(sl.v) + '" y2="' + Y(sl.v) + '"/>';
    s += o.seuilsDedans
      ? '<text x="' + (mg.g + 6) + '" y="' + (Y(sl.v) + (sl.dessous ? 14 : -5)) + '" class="moyen">' + esc(sl.lib) + '</text>'
      : '<text x="' + (W - mg.d + 6) + '" y="' + (Y(sl.v) + 4) + '" class="moyen">' + esc(sl.lib) + '</text>';
  });
  const coul = o.couleur || 'var(--s1)';
  const pf = o.prevision == null ? o.pts.length : o.prevision;
  const chemin = (a, b) => o.pts.slice(a, b + 1).map((p, j) => (j ? 'L' : 'M') + X(a + j).toFixed(1) + ',' + Y(p.v).toFixed(1)).join('');
  const reel = chemin(0, Math.min(pf, o.pts.length - 1));
  s += '<path d="' + reel + 'L' + X(Math.min(pf, o.pts.length - 1)).toFixed(1) + ',' + Y(Math.max(e.min, 0)) + 'L' + X(0) + ',' + Y(Math.max(e.min, 0)) + 'Z" fill="' + coul + '" fill-opacity=".09" stroke="none"/>';
  s += '<path d="' + reel + '" fill="none" stroke="' + coul + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
  if (pf < o.pts.length - 1) s += '<path d="' + chemin(pf, o.pts.length - 1) + '" fill="none" stroke="' + coul + '" stroke-width="2" stroke-dasharray="5 4" stroke-linecap="round"/>';
  (o.axeX || []).forEach((a) => { s += '<text x="' + X(a.i) + '" y="' + (H - 8) + '" text-anchor="' + (a.ancre || 'middle') + '">' + esc(a.lib) + '</text>'; });
  (o.marques || []).forEach((m) => {
    s += '<circle cx="' + X(m.i) + '" cy="' + Y(o.pts[m.i].v) + '" r="4.5" fill="' + (m.coul || coul) + '" stroke="var(--surface)" stroke-width="2"/>';
    if (m.lib) s += '<text x="' + (X(m.i) + (m.dx || 0)) + '" y="' + (Y(o.pts[m.i].v) + (m.dy || -10)) + '" text-anchor="' + (m.ancre || 'middle') + '" class="fort">' + esc(m.lib) + '</text>';
  });
  const fin = o.pts.length - 1;
  s += '<circle cx="' + X(fin) + '" cy="' + Y(o.pts[fin].v) + '" r="4.5" fill="' + coul + '" stroke="var(--surface)" stroke-width="2"/>';
  if (o.finLib !== false) s += '<text x="' + (X(fin) + 8) + '" y="' + (Y(o.pts[fin].v) + 4) + '" class="fort">' + esc(o.finLib || keur(o.pts[fin].v)) + '</text>';
  // zones de survol
  const bande = (W - mg.g - mg.d) / (o.pts.length - 1);
  o.pts.forEach((p, i) => {
    s += '<rect class="cible" x="' + (X(i) - bande / 2).toFixed(1) + '" y="' + mg.h + '" width="' + bande.toFixed(1) + '" height="' + (H - mg.h - mg.b) + '" fill="transparent"' +
      tip('<b>' + esc(p.lib) + '</b>' + ligneTip(coul, o.serie || 'Trésorerie', eur(p.v * 100)) + (p.note ? '<div>' + esc(p.note) + '</div>' : '')) + '/>';
  });
  return s + '</svg>';
}

// colonnes empilées : labels, séries [{lib, coul, vals}], options
function svgEmpile(o) {
  const W = o.w || 760, H = o.h || 270, mg = { g: 54, d: 12, h: 12, b: 30 };
  const tot = o.labels.map((_, i) => o.series.reduce((s, se) => s + Math.max(0, se.vals[i]), 0));
  const e = echelle(0, Math.max(...tot) * 1.05, 4);
  const n = o.labels.length;
  const bande = (W - mg.g - mg.d) / n;
  const lb = Math.min(28, bande * 0.56);
  const Y = (v) => mg.h + (1 - (v - e.min) / (e.max - e.min)) * (H - mg.h - mg.b);
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.titre || '') + '">';
  if (o.hachure) s += '<defs><pattern id="hach-' + o.id + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--surface)" fill-opacity=".0"/><line x1="0" y1="0" x2="0" y2="6" stroke="var(--surface)" stroke-width="2.4" stroke-opacity=".55"/></pattern></defs>';
  s += '<g class="grille">' + e.ticks.map((t) => '<line x1="' + mg.g + '" x2="' + (W - mg.d) + '" y1="' + Y(t) + '" y2="' + Y(t) + '"/>').join('') + '</g>';
  s += e.ticks.map((t) => '<text x="' + (mg.g - 8) + '" y="' + (Y(t) + 4) + '" text-anchor="end">' + keurT(t) + '</text>').join('');
  o.labels.forEach((lab, i) => {
    const x = mg.g + i * bande + (bande - lb) / 2;
    let base = 0;
    const segs = [];
    o.series.forEach((se) => {
      const v = Math.max(0, se.vals[i]);
      const y1 = Y(base + v), y0 = Y(base);
      const h = Math.max(0, y0 - y1 - 2);
      if (h > 0) segs.push('<rect x="' + x.toFixed(1) + '" y="' + (y1 + 2).toFixed(1) + '" width="' + lb.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + se.coul + '"/>' +
        (o.hachure && o.hachure(i) ? '<rect x="' + x.toFixed(1) + '" y="' + (y1 + 2).toFixed(1) + '" width="' + lb.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="url(#hach-' + o.id + ')"/>' : ''));
      base += v;
    });
    // haut arrondi : un capuchon sur le dernier segment
    s += '<g>' + segs.join('') + '</g>';
    if (!o.pasLabels || i % o.pasLabels === 0 || i === n - 1) s += '<text x="' + (x + lb / 2) + '" y="' + (H - 9) + '" text-anchor="middle">' + esc(lab) + '</text>';
    const t = '<b>' + esc(o.titresX ? o.titresX[i] : lab) + '</b>' + o.series.slice().reverse().map((se) => ligneTip(se.coul, se.lib, eur(se.vals[i] * 100))).join('') + ligneTip('', o.libTotal || 'Total', eur(tot[i] * 100));
    s += '<rect class="cible" x="' + (mg.g + i * bande).toFixed(1) + '" y="' + mg.h + '" width="' + bande.toFixed(1) + '" height="' + (H - mg.h - mg.b) + '" fill="transparent"' + tip(t) + '/>';
    if (o.etiquette && o.etiquette(i)) s += o.etiquetteNiveau
      ? '<text x="' + (x + lb / 2) + '" y="' + (Y(o.etiquetteNiveau(i)) + 16) + '" text-anchor="middle" class="' + (o.etiquetteClasse || 'fort') + '">' + esc(o.etiquette(i)) + '</text>'
      : '<text x="' + (x + lb / 2) + '" y="' + (Y(tot[i]) - 6) + '" text-anchor="middle" class="fort">' + esc(o.etiquette(i)) + '</text>';
  });
  return s + '</svg>';
}

// colonnes simples
function svgColonnes(o) {
  const W = o.w || 760, H = o.h || 220, mg = { g: o.margeG || 50, d: 10, h: 16, b: o.basAxe || 28 };
  const vals = o.vals;
  const e = echelle(Math.min(0, ...vals), o.max || Math.max(...vals) * 1.08, o.nTicks || 4);
  const n = vals.length;
  const bande = (W - mg.g - mg.d) / n;
  const lb = Math.min(o.largeur || 24, bande * 0.62);
  const Y = (v) => mg.h + (1 - (v - e.min) / (e.max - e.min)) * (H - mg.h - mg.b);
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.titre || '') + '">';
  s += '<defs><pattern id="hp-' + (o.id || 'c') + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="' + (o.couleur || 'var(--s1)') + '" stroke-width="2.2"/></pattern></defs>';
  s += '<g class="grille">' + e.ticks.map((t) => '<line x1="' + mg.g + '" x2="' + (W - mg.d) + '" y1="' + Y(t) + '" y2="' + Y(t) + '"/>').join('') + '</g>';
  s += e.ticks.map((t) => '<text x="' + (mg.g - 8) + '" y="' + (Y(t) + 4) + '" text-anchor="end">' + (o.fmtAxe ? o.fmtAxe(t) : keurT(t)) + '</text>').join('');
  vals.forEach((v, i) => {
    const x = mg.g + i * bande + (bande - lb) / 2;
    const y0 = Y(Math.max(0, e.min)), y1 = Y(v);
    const haut = Math.min(y0, y1), h = Math.max(1, Math.abs(y0 - y1));
    const r = Math.min(4, lb / 2, h);
    const neg = v < 0;
    const coul = o.couleurs ? o.couleurs[i] : neg ? 'var(--ko-plein)' : (o.couleur || 'var(--s1)');
    const prevu = o.prevu && o.prevu(i);
    // haut arrondi, base droite
    const p = neg
      ? 'M' + x + ',' + haut + 'h' + lb + 'v' + (h - r) + 'q0,' + r + ' -' + r + ',' + r + 'h-' + (lb - 2 * r) + 'q-' + r + ',0 -' + r + ',-' + r + 'z'
      : 'M' + x + ',' + (haut + h) + 'v-' + (h - r) + 'q0,-' + r + ' ' + r + ',-' + r + 'h' + (lb - 2 * r) + 'q' + r + ',0 ' + r + ',' + r + 'v' + (h - r) + 'z';
    s += prevu ? '<path d="' + p + '" fill="url(#hp-' + (o.id || 'c') + ')" stroke="' + coul + '" stroke-width="1.2"/>' : '<path d="' + p + '" fill="' + coul + '"/>';
    if (o.labels && (!o.pasLabels || i % o.pasLabels === 0)) s += '<text x="' + (x + lb / 2) + '" y="' + (H - (o.basAxe ? o.basAxe - 16 : 10)) + '" text-anchor="middle">' + esc(o.labels[i]) + '</text>';
    if (o.etiquette && o.etiquette(i)) s += '<text x="' + (x + lb / 2) + '" y="' + (neg ? y0 + h + 13 : haut - 6) + '" text-anchor="middle" class="' + (o.etiquetteClasse ? o.etiquetteClasse(i) : 'fort') + '">' + esc(o.etiquette(i)) + '</text>';
    if (o.sous && o.sous(i)) {
      const so = [].concat(o.sous(i));
      s += '<text x="' + (x + lb / 2) + '" y="' + (H - 6 - (so.length - 1) * 13) + '" text-anchor="middle" class="moyen">' + so.map((t, k) => '<tspan x="' + (x + lb / 2) + '"' + (k ? ' dy="13"' : '') + (k ? ' class="fort"' : '') + '>' + esc(t) + '</tspan>').join('') + '</text>';
    }
    s += '<rect class="cible" x="' + (mg.g + i * bande).toFixed(1) + '" y="' + mg.h + '" width="' + bande.toFixed(1) + '" height="' + (H - mg.h - mg.b) + '" fill="transparent"' + (o.tips ? tip(o.tips(i)) : '') + '/>';
  });
  if (e.min < 0) s += '<line x1="' + mg.g + '" x2="' + (W - mg.d) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="var(--axe)"/>';
  return s + '</svg>';
}

function svgEtincelle(vals, coul = 'var(--s1)', w = 160, h = 34) {
  const min = Math.min(...vals), max = Math.max(...vals);
  const X = (i) => 2 + (i / (vals.length - 1)) * (w - 6);
  const Y = (v) => 3 + (1 - (v - min) / (max - min || 1)) * (h - 8);
  const d = vals.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1)).join('');
  return '<svg class="etincelle" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + 'L' + X(vals.length - 1) + ',' + h + 'L2,' + h + 'Z" fill="' + coul + '" fill-opacity=".1"/><path d="' + d + '" fill="none" stroke="' + coul + '" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/><circle cx="' + X(vals.length - 1) + '" cy="' + Y(vals[vals.length - 1]) + '" r="3" fill="' + coul + '"/></svg>';
}

// jauge : nombre de factures Logista d'avance (0 → 3)
function svgJauge(val, max = 3) {
  const cx = 120, cy = 112, r = 88;
  const ang = (v) => Math.PI * (1 - Math.min(Math.max(v, 0), max) / max);
  const pt = (v, rr = r) => [cx + rr * Math.cos(ang(v)), cy - rr * Math.sin(ang(v))];
  const arc = (a, b, coul, ep = 12) => { const p0 = pt(a), p1 = pt(b); return '<path d="M' + p0[0].toFixed(1) + ',' + p0[1].toFixed(1) + ' A' + r + ',' + r + ' 0 0 1 ' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1) + '" fill="none" stroke="' + coul + '" stroke-width="' + ep + '" stroke-linecap="butt"/>'; };
  const z1 = SIM.alerte / SIM.seuil;
  let s = '<svg viewBox="0 0 240 140" role="img" aria-label="' + esc(F1.format(val) + ' facture Logista d’avance au point bas') + '">';
  s += arc(0, z1, 'var(--ko-plein)') + arc(z1 + 0.03, 1, 'var(--att-plein)') + arc(1.03, max, 'var(--ok-plein)');
  [0, 1, 2, 3].forEach((t) => { const a = pt(t, r - 20); s += '<text x="' + a[0].toFixed(1) + '" y="' + (a[1] + 4).toFixed(1) + '" text-anchor="middle">' + t + '</text>'; });
  const pn = pt(val, r - 6);
  s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + pn[0].toFixed(1) + '" y2="' + pn[1].toFixed(1) + '" stroke="var(--ko-plein)" stroke-width="4" stroke-linecap="round"/>';
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="8" fill="var(--encre)"/><circle cx="' + cx + '" cy="' + cy + '" r="3" fill="var(--surface)"/>';
  return s + '</svg>';
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
