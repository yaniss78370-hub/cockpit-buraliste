/* ------------------------------------------------------------------ pages */
const ROUTES = [
  { id: 'cockpit', titre: 'Accueil', ic: 'jauge', groupe: '', sous: () => 'Mardi 13 octobre · relevé de ' + HEURE.replace(':', ' h ') },
  { id: 'caisse', titre: 'Caisse', ic: 'billet', groupe: 'Chaque soir', sous: () => 'Ce que la caisse doit contenir depuis la dernière collecte' },
  { id: 'fdj', titre: 'FDJ', ic: 'ticket', groupe: 'Chaque soir', sous: () => 'Le prélèvement de mercredi, puis l’atterrissage de la semaine en cours' },
  { id: 'tresorerie', titre: 'Trésorerie', ic: 'banque', groupe: 'Chaque soir', sous: () => 'Banques lues ce soir à 21 h 02 · plan de vol à six mois' },
  { id: 'rentabilite', titre: 'Résultat', ic: 'resultat', groupe: 'Chaque mois', sous: () => 'Ce que vous gagnez chaque mois, sans attendre le bilan' },
  { id: 'factures', titre: 'Factures', ic: 'facture', groupe: 'Chaque mois', sous: () => D.factures.length + ' factures depuis juillet, lues et rangées sans saisie' },
  { id: 'stock', titre: 'Stock', ic: 'stock', groupe: 'Chaque mois', sous: () => 'Stock théorique comparé à Strator chaque soir' },
  { id: 'mise', titre: 'Mise en place', ic: 'source', groupe: 'Le service', sous: () => 'Sans aucun mot de passe · opérationnel en quatre semaines' },
];
const ROUTE = Object.fromEntries(ROUTES.map((r) => [r.id, r]));

function bandeau() { return ''; }
function bandeauComplet(probleme, fait, change) {
  return '<section class="bandeau" aria-label="La problématique">' +
    '<div><span class="etiquette">Le problème</span><p>' + probleme + '</p></div>' +
    '<div><span class="etiquette">Ce que fait le cockpit</span><p>' + fait + '</p></div>' +
    '<div class="gain"><span class="etiquette">Ce que ça change</span><p>' + change + '</p></div></section>';
}
function lienPage(route, lib, extra = '') {
  return '<button class="lien-bouton" type="button" data-action="aller" data-route="' + route + '"' + extra + '>' + lib + ' ' + ic('fleche') + '</button>';
}

/* ================================================================== COCKPIT (vue d'ensemble) */
const TACHES = [
  { id: 'vir-bp', lib: 'Virer de la BNP vers la Banque Populaire', mt: 3240000, quand: 'Avant jeudi 15 octobre', coul: '#e0312b',
    pourquoi: 'Recharges prélevées jeudi (3 470 €) et facture Logista lundi (29 330 €), moins les 400 € déjà sur le compte.' },
  { id: 'fdj', lib: 'Alimenter le compte FDJ', mt: 554000, quand: 'Mercredi 14 octobre', coul: '#f2a024',
    pourquoi: 'Relevé FDJ de la semaine 41 : 5 900 € prélevés mercredi. Le compte FDJ a 360 €.' },
  { id: 'especes', lib: 'Déposer les espèces de la caisse', mt: 502000, quand: 'Dès que possible', coul: '#2bb673',
    pourquoi: 'Espèces nettes de samedi à mardi, une fois les gains payés au comptoir.' },
];
function htmlTaches(details = true) {
  return '<div class="taches">' + TACHES.map((t) => {
    const fait = !!ETAT.faits[t.id];
    return '<label class="tache' + (fait ? ' faite' : '') + '"><input type="checkbox" data-tache="' + t.id + '"' + (fait ? ' checked' : '') + '>' +
      '<span class="t-lib">' + t.lib + '</span><span class="t-mt">' + (t.environ ? '≈ ' : '') + eur(t.mt) + '</span>' +
      '<span class="t-quand">' + t.quand + (fait ? ' · fait' : '') + '</span>' + (details ? '<span class="t-pourquoi">' + t.pourquoi + '</span>' : '') + '</label>';
  }).join('') + '</div>';
}
function htmlTrajectoire() {
  const v = SEM.map((x) => x.solde / 100);
  const iA = SEM.findIndex((x) => x.date === AUJ);
  const W = 400, H = 60, min = Math.min(...v) * 0.94, max = Math.max(...v) * 1.02;
  const X = (i) => 6 + (i / (v.length - 1)) * (W - 12);
  const Y = (x) => 6 + (1 - (x - min) / (max - min)) * (H - 12);
  const pts = v.map((x, i) => X(i).toFixed(1) + ',' + Y(x).toFixed(1));
  const point = (i, cls) => '<i class="t-pt ' + cls + '" style="left:' + (X(i) / W * 100).toFixed(2) + '%;top:' + (Y(v[i]) / H * 100).toFixed(2) + '%"></i>';
  return '<div class="trajectoire" role="img" aria-label="Trésorerie de dimanche 11 à lundi 19 : ' + keur(v[0]) + ', ' + keur(v[iA]) + ' ce soir, ' + keur(v[v.length - 1]) + ' lundi après Logista">' +
    '<div class="t-zone"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
    '<polyline points="' + pts.slice(0, iA + 1).join(' ') + '" class="t-reel"/><polyline points="' + pts.slice(iA).join(' ') + '" class="t-prevu"/></svg>' +
    point(iA, 'soir') + point(v.length - 1, 'fin') + '</div>' +
    '<div class="t-libs"><span>dim. 11</span><span class="t-soir" style="left:' + (X(iA) / W * 100).toFixed(2) + '%">ce soir, ' + keur(v[iA]) + '</span><span>lun. 19, après Logista</span></div></div>';
}
function htmlHeros() {
  return '<section class="heros">' +
    '<span class="kick">Lundi 19 octobre à 21 h, après la facture tabac</span>' +
    '<span class="gros">' + eur(ATT.total) + '</span>' +
    '<span class="sous">dont <b>' + eur(ATT.net) + '</b> vraiment à vous, avec le tabac en stock déjà payé</span>' +
    htmlTrajectoire() +
    '<div class="heros-bas"><div class="repart" role="img" aria-label="Répartition des 47 380 €">' + ATT.parts.map((p, i) => '<i style="flex-grow:' + p + ';background:' + PARTS_COUL[i] + '"></i>').join('') + '</div>' +
    '<div class="legende-repart">' + ATT.parts.map((p, i) => '<div><b><i style="background:' + PARTS_COUL[i] + '"></i>' + eur(p) + '</b><span>' + PARTS_LIB[i] + '</span></div>').join('') + '</div></div>' +
    '</section>';
}
function htmlCiel(plan) {
  const avance = plan.bas / SIM.seuil;
  return carte('Le ciel à six mois',
    '<div class="jauge-carte">' + svgJauge(avance) +
    '<span class="jv">' + F1.format(avance) + '</span><span class="jl">facture Logista d’avance au point bas (' + eur(plan.bas * 100) + ', ' + SIM.quand[plan.kb] + ')</span>' +
    '<span class="ciel ' + (plan.niveau === 'ok' ? '' : plan.niveau) + '" style="margin-top:8px">' + ic(plan.niveau === 'ok' ? 'soleil' : 'nuage') + plan.ciel + '</span>' +
    '</div>' +
    '<div class="dans6"><span>Dans six mois</span><b>' + eur(plan.fin * 100) + '</b>' + svgEtincelle(plan.pts, 'var(--s1)', 220, 38) + '</div>',
    { actions: lienPage('tresorerie', 'Plan de vol', ' data-onglet="plan"') });
}
function htmlProblematiques(plan) {
  const nbRecommander = D.refs.filter((r) => r.statut === 'À recommander').length;
  const nbArret = D.refs.filter((r) => r.statut === 'À arrêter' || r.statut === 'À réduire').length;
  const att = D.pnl_att;
  const resOct = margeTotale(att.produits) - chargesTotales(att.charges);
  const cbdAvr = D.pnl[3].produits.cbd_ventes, cbdOct = D.pnl_att.produits.cbd_ventes;
  const items = [
    { route: 'tresorerie', ic: 'banque', titre: 'Trésorerie', chiffre: eur(ATT.total), txt: 'lundi après la facture tabac', p: plan.niveau === 'ok' ? ['ok', 'Ciel dégagé'] : ['att', 'Turbulences'] },
    { route: 'caisse', ic: 'ticket', titre: 'Caisse et jeux', chiffre: eur2(-4500), txt: 'jeudi 8 octobre à 14 h 31 min 08 s', p: ['att', 'À vérifier'] },
    { route: 'factures', ic: 'facture', titre: 'Factures', chiffre: nb(D.factures.length), txt: 'lues ligne par ligne depuis juillet, zéro saisie', p: ['att', '1 hausse de prix'] },
    { route: 'stock', ic: 'stock', titre: 'Stock', chiffre: eur(STOCK_ECART), txt: 'd’écart avec Strator, soit ' + pct(STOCK_ECART / D.stock_tot.theo * 100), p: ['ok', 'Sous 0,5 %'] },
    { route: 'rentabilite', ic: 'resultat', titre: 'Rentabilité', chiffre: eur(resOct), txt: 'de résultat attendu en octobre', p: ['info', 'CBD ×' + F0.format(cbdOct / cbdAvr) + ' depuis avril'] },
    { route: 'rentabilite', ic: 'efact', titre: 'Facture électronique', chiffre: '1er sept. 2027', txt: 'vos ventes transmises : ratios propres dès maintenant', p: ['info', 'En préparation'] },
  ];
  return '<section class="problematiques" aria-label="Ce que le cockpit a trouvé">' + items.map((x) =>
    '<button type="button" class="pb carte" data-action="aller" data-route="' + x.route + '">' +
    '<span class="pb-tete">' + ic(x.ic) + '<span>' + x.titre + '</span>' + pastille(x.p[0], x.p[1]) + '</span>' +
    '<span class="pb-corps"><span class="pb-chiffre">' + x.chiffre + '</span><span class="pb-txt">' + x.txt + '</span></span>' +
    '<span class="pb-voir">Ouvrir ' + ic('fleche') + '</span></button>').join('') + '</section>' +
    '<p class="pb-note">' + nbRecommander + ' référence' + (nbRecommander > 1 ? 's' : '') + ' vape à recommander, ' + nbArret + ' à réduire ou arrêter · café sous le rendement attendu en septembre · espèces à déposer : ' + eur(ESPECES_COFFRE) + '</p>';
}
function htmlSemaine(h = 250, simple = false, large = 760) {
  const vals = SEM.map((x) => x.solde / 100);
  const tel = etroit();
  return '<div class="graphe">' + svgColonnes({
    id: 'sem', titre: 'Trésorerie chaque soir à 21 h, du dimanche 11 au lundi 19 octobre', w: LG(large), h: tel ? h - 20 : h, vals, largeur: tel ? 22 : Math.round(38 * large / 760), basAxe: tel ? 44 : 56, margeG: tel ? 40 : 50,
    labels: SEM.map((x) => (tel ? J[jour(x.date).getDay()].charAt(0).toUpperCase() + ' ' + jour(x.date).getDate() : x.jour)), prevu: (i) => SEM[i].statut === 'prévu',
    etiquette: (i) => (i === 0 || i === 2 || i === 7 || i === 8 ? keur(vals[i]) : ''),
    sous: (i) => SEM[i].sorties.length ? (tel ? keur(-SEM[i].sorties[0][1] / 100) : [SEM[i].sorties[0][0], keur(-SEM[i].sorties[0][1] / 100)]) : '',
    tips: (i) => '<b>' + dLong(SEM[i].date) + (SEM[i].statut === 'prévu' ? ' (prévu)' : i === 2 ? ' (ce soir)' : '') + '</b>' +
      ligneTip('', 'Solde à 21 h', eur(SEM[i].solde)) + (SEM[i].entrees ? ligneTip('', 'Encaissements nets', '+' + eur(SEM[i].entrees)) : '') +
      SEM[i].sorties.map((s) => ligneTip('', s[0], eur(-s[1]))).join(''),
  }) + '</div><div class="legende"><span><i style="background:var(--s1)"></i>Réel</span><span><i style="background:repeating-linear-gradient(45deg,var(--s1) 0 2px,transparent 2px 5px);border:1px solid var(--s1)"></i>Prévu</span>' + (simple ? '' : '<span class="discret">Encaissements prévus : 5 090 € par jour, moyenne prudente des quatre dernières semaines</span>') + '</div>';
}
function htmlAlertesCourtes(n = 5) {
  const A = construireAlertes().filter((a) => !a.traitee);
  return '<div class="liste">' + A.slice(0, n).map((a) => ligneAlerte(a, true)).join('') + '</div>';
}
function ligneAlerte(a, court = false) {
  const icn = { ko: 'alerte', att: 'alerte', info: 'cloche', ok: 'coche' }[a.niv];
  return '<div class="alerte-l' + (a.traitee ? ' traitee' : '') + '">' +
    '<span class="puce-ic ' + a.niv + '">' + ic(icn) + '</span>' +
    '<div class="al-txt"><b>' + esc(a.titre) + '</b>' + (court ? '' : '<span>' + esc(a.texte) + '</span>') +
    '<span class="al-meta">' + pastille(a.niv, a.traitee ? 'Traité' : NIV_LIB[a.niv]) + '<span>' + dCourt(a.date) + '</span>' +
    '<button class="lien-bouton" type="button" data-action="alerte" data-id="' + a.id + '">' + esc(a.action) + '</button>' +
    (!court && !a.traitee && !a.resolue ? '<button class="lien-bouton discret-l" type="button" data-action="traiter" data-id="' + a.id + '">Marquer comme traité</button>' : '') +
    '</span></div></div>';
}
function ancienCockpit() {
  const plan = calculPlan();
  const att = D.pnl_att;
  const margeAtt = margeTotale(att.produits), resAtt = margeAtt - chargesTotales(att.charges);
  const sep = pnlDe(9), margeSep = margeTotale(sep.produits), resSep = resultatDe(sep);
  const z14 = DERNIERS(14).map((z) => z.total / 100);
  const marges10 = D.pnl.slice(0, 9).map((p) => margeTotale(p.produits) / 100).concat([margeAtt / 100]);
  const res10 = D.pnl.slice(0, 9).map((p) => resultatDe(p) / 100).concat([resAtt / 100]);
  const vocaux = VOCAUX.slice(0, 3).map((v) => '<div class="ligne longue">' + '<span class="puce-ic">' + ic('micro') + '</span><div class="l-txt"><b>' + esc(v.qui) + ' · ' + v.h.replace(':', ' h ') + (v.date === AUJ ? '' : ', ' + dCourt(v.date)) + '</b><span>' + esc(v.resume) + '</span></div></div>').join('');
  const dernieres = D.factures.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1)).slice(0, 6).map((f) => {
    const fams = Array.from(new Set(f.lignes.map((l) => l.fam)));
    const etat = f.alerte ? pastille('att', 'Hausse de prix') : f.statut === 'À payer' ? pastille('info', 'À payer le ' + dNum(f.echeance)) : pastille('ok', 'Payée');
    return '<tr class="cliquable" data-action="facture" data-id="' + f.id + '"><td class="lib"><b>' + esc(f.fournisseur) + '</b><span class="sec">' + esc(f.objet) + '<span class="seul-etroit"> · ' + dCourt(f.date) + '</span></span></td>' +
      '<td class="cache-etroit nw">' + maj(dCourt(f.date)) + '</td><td class="n cache-etroit">' + f.lignes.length + '</td>' +
      '<td class="cache-etroit">' + fams.slice(0, 2).map((x) => '<span class="fam" style="--c:' + coulFam(x) + '">' + esc(x) + '</span>').join(' ') + (fams.length > 2 ? ' <span class="discret">+' + (fams.length - 2) + '</span>' : '') + '</td>' +
      '<td class="cache-etroit">' + etat + '</td><td class="n"><b>' + eur2(f.ttc) + '</b></td></tr>';
  }).join('');
  const tableDernieres = '<div class="defile"><table class="tableau compact"><thead><tr><th>Fournisseur</th><th class="cache-etroit">Reçue</th><th class="n cache-etroit">Lignes lues</th><th class="cache-etroit">Rangée dans</th><th class="cache-etroit">État</th><th class="n">Montant TTC</th></tr></thead><tbody>' + dernieres + '</tbody></table></div>';
  const aVenir = SEM.filter((x) => x.date > AUJ && x.sorties.length);
  const totAVenir = aVenir.reduce((s, x) => s + x.sorties.reduce((t, y) => t + y[1], 0), 0);
  const nomCommun = (l) => (/^(Recharges|Timbres)$/.test(l) ? l.toLowerCase() : l);
  const piedTaches = '<p class="pied-note">' + ic('calendrier') + '<span><b>D’ici lundi : ' + eur(totAVenir) + ' de prélèvements.</b> ' +
    aVenir.map((x) => x.sorties.map((y) => nomCommun(y[0]) + ' ' + eur(y[1]) + ' ' + JL[jour(x.date).getDay()]).join(', ')).join(', ') + '.</span></p>';
  return '<div class="g etire">' +
    '<div class="c5">' + htmlHeros() + '</div>' +
    '<div class="c4">' + carte('À faire cette semaine', htmlTaches(false), { meta: '3 actions', actions: lienPage('tresorerie', 'Pourquoi', ' data-onglet="semaine"'), pied: piedTaches }) + '</div>' +
    '<div class="c3">' + htmlCiel(plan) + '</div></div>' +
    '<div class="tuiles">' +
    '<section class="carte tuile"><span class="lib">Encaissé aujourd’hui</span><span class="val">' + eur(ZAUJ.total) + '</span><span class="sous">Marge du jour : <b>' + eur(MARGE_AUJ) + '</b></span>' + svgEtincelle(z14, 'var(--s1)') + '</section>' +
    '<section class="carte tuile"><span class="lib">Marge d’octobre, atterrissage</span><span class="val">' + eur(margeAtt) + '</span><span class="sous">' + delta((margeAtt - margeSep) / margeSep * 100) + 'par rapport à septembre</span>' + svgEtincelle(marges10, 'var(--s3)') + '</section>' +
    '<section class="carte tuile"><span class="lib">Résultat d’octobre, atterrissage</span><span class="val">' + eur(resAtt) + '</span><span class="sous">' + delta((resAtt - resSep) / Math.abs(resSep) * 100) + 'avant votre rémunération</span>' + svgEtincelle(res10, 'var(--s3)') + '</section>' +
    '<section class="carte tuile"><span class="lib">Stock : théorique et Strator</span><span class="val">' + eur(STOCK_ECART) + ' d’écart</span><span class="sous">' + eur(D.stock_tot.theo) + ' théoriques, ' + eur(D.stock_tot.strator) + ' dans Strator</span><div class="mesure"><i style="width:' + Math.min(100, STOCK_ECART / D.stock_tot.theo * 100 / 2 * 100) + '%"></i><span>' + pct(STOCK_ECART / D.stock_tot.theo * 100) + ' sur une tolérance de 2 %</span></div></section>' +
    '</div>' +
    '<div class="titre-section"><h2>Ce que le cockpit a trouvé</h2><span>Une carte par problématique. Touchez pour le détail.</span></div>' +
    htmlProblematiques(plan) +
    '<div class="g">' +
    '<div class="c8">' + carte('Votre semaine, soir après soir', htmlSemaine(), { meta: 'Réel jusqu’à ce soir, puis prévu', actions: lienPage('tresorerie', 'Trésorerie', ' data-onglet="semaine"') }) +
    carte('Boîte vocale', '<div class="liste">' + vocaux + '</div>', { meta: 'Résumés envoyés sur WhatsApp' }) + '</div>' +
    '<div class="c4">' + carte('À vérifier', htmlAlertesCourtes(6), { meta: construireAlertes().filter((a) => !a.traitee).length + ' points ouverts' }) + '</div>' +
    '<div class="c12">' + carte('Dernières factures rangées', tableDernieres, { meta: 'Lues ligne par ligne, sans saisie', actions: lienPage('factures', 'Toutes les factures') }) + '</div>' +
    '</div>';
}

/* ================================================================== TRÉSORERIE */
function htmlComptes() {
  const c = D.comptes;
  const items = [['bnp', 'banque'], ['bp', 'banque'], ['fdj', 'ticket'], ['caisse', 'billet'], ['cb', 'carte']];
  return '<div class="comptes">' + items.map(([k, i]) =>
    '<section class="carte compte"><span class="cpt-tete">' + ic(i) + '<span>' + COMPTES[k].nom + '</span></span><b>' + eur(c[k]) + '</b><small>' + COMPTES[k].role + '</small></section>').join('') +
    '<section class="carte compte total"><span class="cpt-tete">' + ic('jauge') + '<span>Disponible ce soir</span></span><b>' + eur(c.total) + '</b><small>Lundi après Logista : ' + eur(ATT.total) + '</small></section></div>';
}
function detailTresorerie() {
  const onglets = [['semaine', 'La semaine'], ['plan', 'Plan de vol, 6 mois'], ['quatorze', '14 semaines'], ['mouvements', 'Mouvements bancaires'], ['fixes', 'Charges fixes']];
  let corps = '';
  if (ETAT.tabTreso === 'semaine') corps = ongletSemaine();
  if (ETAT.tabTreso === 'plan') corps = ongletPlan();
  if (ETAT.tabTreso === 'quatorze') corps = ongletQuatorze();
  if (ETAT.tabTreso === 'mouvements') corps = ongletMouvements();
  if (ETAT.tabTreso === 'fixes') corps = ongletFixes();
  return bandeau('Chaque lundi, la facture Logista tombe. Est-ce que ça passe ? On le découvre souvent sur le relevé.',
    'Il lit vos banques en lecture seule chaque soir, place chaque prélèvement connu et calcule l’atterrissage du lundi, puis les six prochains mois.',
    '<b>' + eur(ATT.total) + '</b> lundi après la facture tabac, <b>' + eur(3240000) + '</b> à virer avant jeudi, et aucun compte à découvert depuis juillet.') +
    htmlComptes() +
    '<div class="onglets">' + seg('treso', onglets, ETAT.tabTreso) + '</div>' + corps;
}
function htmlEquationSemaine() {
  const iA = SEM.findIndex((x) => x.date === AUJ);
  const fut = SEM.slice(iA + 1);
  const ent = fut.reduce((s, x) => s + x.entrees, 0);
  const prel = fut.flatMap((x) => x.sorties);
  const sor = prel.reduce((s, y) => s + y[1], 0);
  return '<div class="equation" role="group" aria-label="De ce soir à lundi">' +
    '<div><span>Ce soir</span><b>' + eur(SEM[iA].solde) + '</b><small>banques, espèces et cartes</small></div><i aria-hidden="true">+</i>' +
    '<div><span>Encaissements prévus</span><b class="positif">' + eur(ent, false, true) + '</b><small>' + fut.length + ' jours à ' + eur(fut[0].entrees) + '</small></div><i aria-hidden="true">−</i>' +
    '<div><span>Prélèvements connus</span><b class="negatif">' + eur(-sor) + '</b><small>' + prel.length + ' d’ici lundi, Logista compris</small></div><i aria-hidden="true">=</i>' +
    '<div class="fin"><span>Lundi soir</span><b>' + eur(SEM[SEM.length - 1].solde) + '</b><small>après la facture tabac</small></div></div>';
}
function ongletSemaine() {
  const lignes = SEM.map((x, i) => '<tr class="' + (x.statut === 'prévu' ? 'prevu' : '') + '"><td><b>' + maj(dLong(x.date)) + '</b>' + (i === 2 ? ' ' + pastille('info sans', 'Ce soir') : '') + '</td><td class="n">' + (x.entrees ? '+' + eur(x.entrees) : '—') + '</td><td>' + (x.sorties.length ? x.sorties.map((s) => s[0] + ' <span class="negatif num">' + eur(-s[1]) + '</span>').join(', ') : '—') + '</td><td class="n"><b>' + eur(x.solde) + '</b></td><td>' + (x.statut === 'prévu' ? 'Prévu' : 'Réel') + '</td></tr>').join('');
  return '<div class="g etire">' +
    '<div class="c8">' + carte('Votre semaine, soir après soir', htmlSemaine(280), { meta: 'Départ dimanche 49 120 €, atterrissage lundi 47 380 €', pied: htmlEquationSemaine() }) + '</div>' +
    '<div class="c4">' + carte('À faire cette semaine', htmlTaches(true)) + '</div></div>' +
    '<div class="g"><div class="c12">' + carte('Jour par jour', '<div class="defile"><table class="tableau"><thead><tr><th>Jour</th><th class="n">Encaissements nets</th><th>Prélèvements</th><th class="n">Solde à 21 h</th><th>État</th></tr></thead><tbody>' + lignes + '</tbody></table></div>', { actions: boutonsExport('semaine') }) + '</div></div>';
}
function htmlGraphePlan(plan, h = 290) {
  const pts = plan.pts.map((v, i) => ({ v, lib: maj(SIM.quand[i]) + ' (' + dCourt(SIM.dates[i]) + ')' }));
  return '<div class="graphe">' + svgCourbe({
    titre: 'Trésorerie prévue de mi-octobre à fin avril', w: LG(760), h, pts, margeD: etroit() ? 44 : 96, seuilsDedans: etroit(), serie: 'Trésorerie prévue',
    seuils: [{ v: SIM.seuil, lib: '1 facture Logista', cls: 'seuil-att' }, { v: SIM.alerte, lib: 'Alerte 5 000 €' }],
    axeX: SIM.axe.map((l, k) => ({ i: k * 2, lib: l, ancre: k === 0 ? 'start' : 'middle' })),
    marques: [{ i: plan.kb, lib: 'Point bas ' + keur(plan.bas), dy: plan.kb === 0 ? 22 : -12, ancre: plan.kb === 0 ? 'start' : 'middle', coul: plan.niveau === 'ok' ? 'var(--s1)' : 'var(--ko-plein)' }],
  }) + '</div>';
}
function htmlPlanGauche(plan) {
  const phrase = plan.niveau === 'ok' ? 'Toujours au moins une facture Logista d’avance.' :
    maj(SIM.quand[plan.kb]) + ', il vous reste ' + eur(plan.bas * 100) + ' : il manque ' + eur(plan.manque * 100) + ' pour garder une facture Logista d’avance. Le cockpit vous prévient des semaines avant, le temps de décaler ou de financer.';
  return '<div class="plan-tete"><span class="ciel ' + (plan.niveau === 'ok' ? '' : plan.niveau) + '">' + ic(plan.niveau === 'ok' ? 'soleil' : 'nuage') + plan.ciel + '</span><span class="discret">' + phrase + '</span></div>' + htmlGraphePlan(plan) +
    '<dl class="chiffres-plan"><div><dt>Fin avril</dt><dd>' + eur(plan.fin * 100) + '</dd></div><div><dt>Point bas</dt><dd>' + eur(plan.bas * 100) + '</dd><small>' + SIM.quand[plan.kb] + '</small></div><div><dt>Factures Logista d’avance au point bas</dt><dd>' + F1.format(plan.bas / SIM.seuil) + '</dd></div></dl>';
}
function htmlPlanAide(plan) {
  if (!ETAT.plan.agencement) return '';
  return '<div class="encart ' + (plan.niveau === 'ok' ? 'info' : 'att') + '">' + ic('info') + '<div><b>Aide à la transformation des débits de tabac : 12 000 € pour cet agencement</b><br>30 % des dépenses HT (votre chiffre d’affaires tabac dépasse 500 000 €), dans la limite de 33 000 €. Elle est versée après les travaux, sur factures acquittées : elle ne comble pas le creux, elle le rembourse ensuite. Conditions : audit préalable, deux éléments rénovés à l’extérieur et deux à l’intérieur, aucun travaux avant la décision de la douane. ' +
    '<a href="https://www.douane.gouv.fr/fiche/aide-la-transformation-des-debits-de-tabac" target="_blank" rel="noopener">Fiche de la douane</a></div></div>';
}
function htmlPlanTable(plan) {
  const table = plan.det.map((x, i) => {
    const ev = [];
    if (x.embauche) ev.push('Embauche ' + eur(x.embauche * 100, false, true));
    if (x.credit) ev.push((x.credit < 0 ? 'Crédit soldé ' : 'Échéance de prêt en moins ') + eur(x.credit * 100, false, true));
    if (x.salaire) ev.push('Votre salaire ' + eur(x.salaire * 100, false, true));
    if (x.cbd) ev.push('Rayon CBD ' + eur(x.cbd * 100, false, true));
    if (x.agencement) ev.push((x.agencement < 0 ? 'Agencement ' : 'Ventes en plus après travaux ') + eur(x.agencement * 100, false, true));
    return '<tr' + (x.solde < SIM.seuil ? ' class="alerte"' : '') + '><td><b>' + maj(SIM.quand[i + 1]) + '</b><span class="sec">' + dCourt(SIM.dates[i + 1]) + '</span></td><td class="n">' + eur(x.base * 100, false, true) + '</td><td>' + (ev.join(' · ') || '—') + '</td><td class="n">' + eur(x.total * 100, false, true) + '</td><td class="n"><b>' + eur(x.solde * 100) + '</b></td><td class="n">' + F1.format(x.solde / SIM.seuil) + '</td></tr>';
  }).join('');
  return '<div class="defile"><table class="tableau"><thead><tr><th>Quinzaine</th><th class="n">Activité courante</th><th>Vos décisions</th><th class="n">Mouvement net</th><th class="n">Trésorerie</th><th class="n">Factures Logista d’avance</th></tr></thead><tbody><tr><td><b>Mi-octobre</b><span class="sec">lun. 19 oct., après Logista</span></td><td class="n">—</td><td>Départ</td><td class="n">—</td><td class="n"><b>' + eur(SIM.depart * 100) + '</b></td><td class="n">' + F1.format(SIM.depart / SIM.seuil) + '</td></tr>' + table + '</tbody></table></div>';
}
function majZonesPlan() {
  const plan = calculPlan();
  const g = $('#plan-gauche'), a = $('#plan-aide'), t = $('#plan-table');
  if (g) g.innerHTML = htmlPlanGauche(plan);
  if (a) a.innerHTML = htmlPlanAide(plan);
  if (t) t.innerHTML = htmlPlanTable(plan);
  return !!g;
}
function ongletPlan() {
  const plan = calculPlan();
  const p = ETAT.plan;
  const leviers = LEVIERS.map((l) => {
    if (l.cle === 'salaire') {
      return '<div class="levier"><b>' + l.titre + '</b><span>' + l.sous + ' : <span id="salaire-lib">' + (p.salaire ? eur(p.salaire * 100) + ' par mois' : 'aucun salaire') + '</span></span>' +
        '<input class="curseur" type="range" id="curseur-salaire" min="0" max="4000" step="250" value="' + p.salaire + '" aria-label="Votre salaire de gérant, par mois"></div>';
    }
    return '<div class="levier"><b>' + l.titre + '</b><span>' + l.sous + '</span><button type="button" class="bascule" role="switch" aria-checked="' + !!p[l.cle] + '" data-levier="' + l.cle + '" aria-label="' + esc(l.titre) + '"></button></div>';
  }).join('');
  return '<div class="g">' +
    '<div class="c8">' + carte('Votre plan de vol, sur six mois', '<div id="plan-gauche">' + htmlPlanGauche(plan) + '</div>', { meta: 'Quinzaine par quinzaine' }) + '</div>' +
    '<div class="c4">' + carte('Touchez les commandes', '<div class="leviers">' + leviers + '</div>', { pied: '<button class="bouton petit" type="button" data-action="plan-defaut">' + ic('retour') + '<span>Revenir au plan du film</span></button>' }) + '</div>' +
    '<div class="c12" id="plan-aide">' + htmlPlanAide(plan) + '</div>' +
    '<div class="c12">' + carte('Quinzaine par quinzaine', '<div id="plan-table">' + htmlPlanTable(plan) + '</div>',
      { meta: 'Activité courante : ventes moins achats, charges et échéances connues (URSSAF, TVA, loyer, CFE en décembre)', actions: boutonsExport('plan') }) + '</div></div>';
}
function ongletQuatorze() {
  const serie = D.serie.map((x) => ({ v: x.total / 100, lib: dLong(x.date) }));
  const prev = SEM.slice(3).map((x) => ({ v: x.solde / 100, lib: dLong(x.date) + ' (prévu)' }));
  const pts = serie.concat(prev);
  const iMin = serie.reduce((k, x, i) => (x.v < serie[k].v ? i : k), 0);
  const axe = [];
  D.serie.forEach((x, i) => { if (i === 0 || x.date.slice(8) === '01') axe.push({ i, lib: M[+x.date.slice(5, 7) - 1], ancre: i === 0 ? 'start' : 'middle' }); });
  // résumé mensuel
  const mois = [7, 8, 9, 10];
  const rows = mois.map((m) => {
    const mm = String(m).padStart(2, '0');
    const mv = D.mouvements.filter((x) => x.statut === 'réel' && x.date.slice(5, 7) === mm && x.categorie !== 'Virement interne');
    const ent = mv.filter((x) => x.montant > 0).reduce((s, x) => s + x.montant, 0);
    const sor = mv.filter((x) => x.montant < 0).reduce((s, x) => s + x.montant, 0);
    const fin = D.serie.filter((x) => x.date.slice(5, 7) === mm).slice(-1)[0];
    const bas = D.serie.filter((x) => x.date.slice(5, 7) === mm).reduce((a, x) => (x.total < a.total ? x : a));
    return '<tr><td><b>' + maj(ML[m - 1]) + '</b>' + (m === 7 ? '<span class="sec">depuis le 8</span>' : m === 10 ? '<span class="sec">au 13</span>' : '') + '</td><td class="n positif">+' + eur(ent) + '</td><td class="n negatif">' + eur(sor) + '</td><td class="n">' + eur(ent + sor, false, true) + '</td><td class="n">' + eur(bas.total) + '<span class="sec">' + dCourt(bas.date) + '</span></td><td class="n"><b>' + eur(fin.total) + '</b></td></tr>';
  }).join('');
  return '<div class="g"><div class="c12">' + carte('Trésorerie totale chaque soir, depuis le 8 juillet', '<div class="graphe">' + svgCourbe({
    titre: 'Trésorerie totale du 8 juillet au 19 octobre', w: LG(1000), h: etroit() ? 260 : 300, pts, prevision: serie.length - 1, margeD: etroit() ? 72 : 100, seuilsDedans: etroit(), serie: 'Trésorerie totale',
    seuils: [{ v: SIM.seuil, lib: '1 facture Logista', cls: 'seuil-att' }], axeX: axe,
    marques: [{ i: iMin, lib: 'Point bas ' + keur(serie[iMin].v) + ', ' + dCourt(D.serie[iMin].date), dy: 22, coul: 'var(--ko-plein)' }, { i: serie.length - 1, lib: 'Ce soir', dy: -12 }],
    finLib: keur(pts[pts.length - 1].v) + ' lundi',
  }) + '</div><div class="legende"><span><i class="ligne-cle" style="background:var(--s1)"></i>Banques, espèces et cartes en attente</span><span><i class="ligne-cle" style="background:repeating-linear-gradient(90deg,var(--s1) 0 5px,transparent 5px 9px)"></i>Prévu</span><span><i class="ligne-cle" style="background:var(--att-plein)"></i>Une facture Logista d’avance (29 330 €)</span></div>',
    { meta: 'Chaque creux suit une facture Logista' }) + '</div>' +
    '<div class="c12">' + carte('Mois par mois', '<div class="defile"><table class="tableau"><thead><tr><th>Mois</th><th class="n">Encaissements</th><th class="n">Décaissements</th><th class="n">Variation</th><th class="n">Point bas</th><th class="n">Fin de mois</th></tr></thead><tbody>' + rows + '</tbody></table></div>', { meta: 'Hors virements entre vos comptes' }) + '</div></div>';
}
const CATS_MVT = Array.from(new Set(D.mouvements.map((m) => m.categorie))).sort();
function mouvementsFiltres() {
  const f = ETAT.mvt, q = f.q.trim().toLowerCase();
  let l = MVT.filter((m) => (f.compte === 'tous' || m.compte === f.compte) && (f.cat === 'toutes' || m.categorie === f.cat) && (f.statut === 'tous' || m.statut === f.statut) &&
    (!q || (m.libelle + ' ' + m.contrepartie + ' ' + m.categorie + ' ' + eur2(m.montant)).toLowerCase().includes(q)));
  const cle = f.tri;
  l = trier(l, cle, f.sens, cle === 'montant' ? (x) => x.montant : cle === 'date' ? (x) => x.date + String(9999 - x.i).padStart(4, '0') : null);
  return l;
}
function htmlTableMouvements() {
  const l = mouvementsFiltres();
  const f = ETAT.mvt;
  const total = l.reduce((s, m) => s + m.montant, 0);
  const rows = l.slice(0, f.n).map((m) => '<tr class="cliquable' + (m.statut === 'prévu' ? ' prevu' : '') + '" data-action="mouvement" data-i="' + m.i + '"><td class="num">' + dNum(m.date) + '</td><td><span class="cpt ' + m.compte + '">' + COMPTES[m.compte].court + '</span></td><td class="lib"><b>' + esc(m.libelle) + '</b><span class="sec">' + esc(m.contrepartie) + (m.statut === 'prévu' ? ' · prévu' : '') + '</span></td><td>' + esc(m.categorie) + '</td><td class="n ' + (m.montant < 0 ? '' : 'positif') + '">' + eur2(m.montant, true) + '</td><td>' + (m.facture ? '<span class="rappro">' + ic('coche') + 'Facture</span>' : '') + '</td></tr>').join('');
  return '<div class="defile"><table class="tableau"><thead><tr>' + th('Date', 'date', f) + '<th>Compte</th><th>Libellé</th>' + th('Catégorie', 'categorie', f) + th('Montant', 'montant', f, true) + '<th>Rapprochement</th></tr></thead><tbody>' +
    (rows || '<tr><td colspan="6" class="vide-etat">Aucun mouvement pour ces filtres.</td></tr>') + '</tbody></table></div>' +
    '<div class="pagination"><span>' + Math.min(f.n, l.length) + ' sur ' + l.length + ' mouvements · solde de la sélection ' + eur2(total, true) + '</span>' + (l.length > f.n ? '<button class="bouton petit" type="button" data-action="plus-mvt">Afficher 60 de plus</button>' : '') + '</div>';
}
function ongletMouvements() {
  const f = ETAT.mvt;
  return carte('Mouvements bancaires', '', {
    meta: 'BNP, Banque Populaire et compte FDJ, du 8 juillet au 13 octobre, puis la semaine prévue', actions: boutonsExport('mouvements'),
    cls: 'sans-corps',
  }).replace('<div class="carte-corps"></div>', '<div class="outils"><select class="champ" data-filtre="mvt.compte" aria-label="Compte"><option value="tous">Tous les comptes</option>' +
    ['bnp', 'bp', 'fdj'].map((k) => '<option value="' + k + '"' + (f.compte === k ? ' selected' : '') + '>' + COMPTES[k].nom + '</option>').join('') + '</select>' +
    '<select class="champ" data-filtre="mvt.cat" aria-label="Catégorie"><option value="toutes">Toutes les catégories</option>' + CATS_MVT.map((c) => '<option' + (f.cat === c ? ' selected' : '') + '>' + esc(c) + '</option>').join('') + '</select>' +
    '<select class="champ" data-filtre="mvt.statut" aria-label="Réel ou prévu"><option value="tous">Réel et prévu</option><option value="réel"' + (f.statut === 'réel' ? ' selected' : '') + '>Réel</option><option value="prévu"' + (f.statut === 'prévu' ? ' selected' : '') + '>Prévu</option></select>' +
    '<input class="champ grandit" type="search" id="q-mvt" placeholder="Rechercher un libellé, un montant…" value="' + esc(f.q) + '" data-filtre="mvt.q"></div><div id="zone-mvt">' + htmlTableMouvements() + '</div>');
}
function ongletFixes() {
  const n = D.fixes_mois.length;
  const tot = D.fixes_mois.map((_, i) => D.fixes.reduce((s, f) => s + f.serie[i], 0));
  const rows = D.fixes.slice().sort((a, b) => b.serie[n - 1] - a.serie[n - 1]).map((f) => {
    const evo = f.serie[0] ? (f.serie[n - 1] - f.serie[0]) / f.serie[0] * 100 : 0;
    const note = D.notes_fixes[f.cle];
    return '<tr' + (note && /renég|concurrence|négocier/.test(note) ? ' class="a-voir"' : '') + '><td class="lib"><b>' + esc(f.libelle) + '</b><span class="sec">' + esc(f.fournisseur) + '</span></td><td class="n">le ' + f.jour + '</td><td class="n"><b>' + eur2(f.serie[n - 1]) + '</b></td><td>' + svgEtincelle(f.serie.map((x) => x / 100), 'var(--s1)', 110, 26) + '</td><td class="n">' + delta(evo, true) + '</td><td class="n">' + eur(f.serie.reduce((s, x) => s + x, 0)) + '</td><td class="note">' + (note ? esc(note) : '') + '</td></tr>';
  }).join('');
  const labels = D.fixes_mois.map((m) => M[+m.slice(5) - 1]);
  return '<div class="g"><div class="c12">' + carte('Vos charges fixes, sur douze mois', '<div class="graphe">' + svgColonnes({ id: 'fixes', titre: 'Charges fixes payées chaque mois', w: LG(1000), h: 200, vals: tot.map((x) => x / 100), labels, largeur: etroit() ? 14 : 30, pasLabels: etroit() ? 2 : 0,
    etiquette: (i) => (i === 0 || i === n - 1 ? keur(tot[i] / 100) : ''), tips: (i) => '<b>' + maj(ML[+D.fixes_mois[i].slice(5) - 1]) + ' ' + D.fixes_mois[i].slice(0, 4) + '</b>' + ligneTip('', 'Charges fixes payées', eur(tot[i])) }) + '</div>',
    { meta: 'De novembre 2025 à octobre 2026 : ' + eur(tot.reduce((s, x) => s + x, 0)) + ' au total' }) + '</div>' +
    '<div class="c12">' + carte('Ligne par ligne', '<div class="defile"><table class="tableau"><thead><tr><th>Charge</th><th class="n">Prélevée</th><th class="n">Ce mois</th><th>12 mois</th><th class="n">Sur un an</th><th class="n">Total 12 mois</th><th>À savoir</th></tr></thead><tbody>' + rows +
      '<tr class="total"><td>Total</td><td></td><td class="n">' + eur2(tot[n - 1]) + '</td><td></td><td class="n">' + delta((tot[n - 1] - tot[0]) / tot[0] * 100, true) + '</td><td class="n">' + eur(tot.reduce((s, x) => s + x, 0)) + '</td><td></td></tr></tbody></table></div>', { meta: 'Montants payés, TTC', actions: boutonsExport('fixes') }) + '</div></div>';
}

/* ================================================================== CAISSE ET JEUX */
function heuresDu(iso) {
  if (iso === AUJ) return D.heures;
  const z = ZJ[iso];
  const prof = [0.035, 0.085, 0.09, 0.07, 0.06, 0.065, 0.075, 0.06, 0.05, 0.055, 0.07, 0.085, 0.09, 0.075, 0.035];
  let g = 0;
  for (const ch of iso) g = (g * 31 + ch.charCodeAt(0)) % 9973;
  const brut = prof.map((p, i) => p * (0.88 + ((g * (i + 7)) % 25) / 100));
  const sP = brut.reduce((a, b) => a + b, 0);
  let acc = 0;
  return brut.map((p, i) => { const m = i < brut.length - 1 ? Math.round(z.total * p / sP) : z.total - acc; acc += m; return { h: 6 + i, montant: m }; });
}
function detailCaisse() {
  const iso = ETAT.caisse.jour;
  const z = ZJ[iso];
  const idx = Z.findIndex((x) => x.date === iso);
  const marge = margeJour(z);
  const gains = z.gains_fdj + z.gains_pmu;
  const fam = D.ventes_fam.map((f) => ({ f, v: z.ventes[f] })).sort((a, b) => b.v - a.v);
  const margeFam = (f, v) => {
    if (f === 'tabac') return Math.round(v * D.taux.tabac);
    if (D.taux[f] != null) return Math.round(v * D.taux[f]);
    return Math.round(v / (1 + D.tva_vente[f]) * (1 - D.cout[f]));
  };
  const rayon = fam.map((x) => '<tr><td><b>' + LIB_FAM[x.f] + '</b></td><td class="n">' + eur2(x.v) + '</td><td><span class="barre-mini" style="width:' + (x.v / z.total * (etroit() ? 56 : 160)).toFixed(0) + 'px"></span> ' + pct(x.v / z.total * 100) + '</td><td class="n">' + eur2(margeFam(x.f, x.v)) + '</td></tr>').join('');
  const h = heuresDu(iso);
  const sem = ETAT.jeux.semaine;
  const fdj = fdjSemaine(sem);
  const totPJ = fdj.reduce((s, x) => s + x.pj, 0), totST = fdj.reduce((s, x) => s + x.st, 0);
  const fdjRows = fdj.map((x) => {
    let etat = pastille('ok', 'Juste');
    if (x.ecart) etat = x.iso === '2026-09-15' ? pastille('ok', 'Expliqué : ticket Loto saisi deux fois en caisse') : pastille('ko', 'Écart');
    return '<tr class="' + (x.ecart && x.iso !== '2026-09-15' ? 'alerte' : '') + '"><td><b>' + maj(dCourt(x.iso)) + '</b></td><td class="n">' + eur2(x.pj) + '</td><td class="n">' + eur2(x.st) + '</td><td class="n">' + (x.ecart ? eur2(x.ecart, true) : '—') + '</td><td>' + etat + '</td></tr>';
  }).join('');
  const aEcart = fdj.some((x) => x.iso === ECART_FDJ.iso);
  const exportFdj = aEcart ? carte('Export détaillé FDJ, jeudi 8 octobre, de 14 h 25 à 14 h 40',
    '<div class="defile"><table class="tableau compact"><thead><tr><th>Heure</th><th>Jeu</th><th class="n">Montant</th><th>Dans la caisse</th></tr></thead><tbody>' +
    EXPORT_FDJ.map((o) => '<tr class="' + (o.ok ? '' : 'alerte') + '"><td class="mono">' + o.h + '</td><td>' + o.jeu + '</td><td class="n">' + eur2(o.mt) + '</td><td>' + (o.ok ? pastille('ok', 'Oui') : pastille('ko', 'Absent')) + '</td></tr>').join('') + '</tbody></table></div>' +
    '<div class="encart ko" style="margin-top:12px">' + ic('alerte') + '<div><b>Jeudi, 14 h 31 min 08 s :</b> trois tickets à gratter passés au terminal FDJ, absents de la caisse. À vérifier avec la personne au comptoir à cette heure-là.</div></div>',
    { meta: 'Obtenu avec la collaboration de la FDJ, opération par opération' }) : carte('Export détaillé FDJ', '<p class="pre">Aucun écart cette semaine : pas besoin de l’export détaillé.</p>');
  const annules = D.annules.filter((a) => ETAT.caisse.annules === 'apres' ? a.moment === 'Après encaissement' : ETAT.caisse.annules === 'jour' ? a.date === iso : true);
  const annRows = annules.slice().reverse().slice(0, 60).map((a) => '<tr class="' + (a.moment === 'Après encaissement' ? 'alerte' : '') + '"><td class="num">' + dNum(a.date) + '</td><td class="mono">' + a.heure + '</td><td>Caisse ' + a.caisse + '</td><td>' + a.vendeur + '</td><td class="n">' + eur2(a.montant) + '</td><td>' + esc(a.motif) + '</td><td>' + (a.moment === 'Après encaissement' ? pastille('att', 'Après paiement') : pastille('', 'Avant paiement')) + '</td></tr>').join('');
  const jPrel = (iso) => J[jour(iso).getDay()] + ' ' + dNum(iso);
  const rel = D.releves.fdj.slice(-8).reverse().map((r) => '<tr><td class="nw"><b>S' + r.semaine + '</b><span class="sec">' + dNum(r.du) + ' au ' + dNum(r.au) + '</span></td><td class="n">' + eur2(r.ventes) + '</td><td class="n">' + eur2(r.gains) + '</td><td class="n positif">' + eur2(r.commission) + '</td><td class="n"><b>' + eur2(r.solde) + '</b><span class="sec">' + jPrel(r.prelevement) + '</span></td></tr>').join('');
  const relP = D.releves.pmu.slice(-8).reverse().map((r) => '<tr><td class="nw"><b>S' + r.semaine + '</b><span class="sec">' + dNum(r.du) + ' au ' + dNum(r.au) + '</span></td><td class="n">' + eur2(r.ventes) + '</td><td class="n">' + eur2(r.gains) + '</td><td class="n positif">' + eur2(r.commission) + '</td><td class="n"><b>' + eur2(r.solde) + '</b><span class="sec">' + jPrel(r.prelevement) + '</span></td></tr>').join('');
  return bandeau('Un écart entre le prélèvement FDJ et la caisse se cherche à la main, ticket par ticket. Les annulations, personne ne les regarde.',
    'Il croise chaque jour Profession Jeux et la caisse Strator, puis l’export détaillé opération par opération. Il lit chaque soir le Z, les ventes par article et les tickets annulés.',
    'Un écart de <b>' + eur2(-4500) + '</b> retrouvé à la seconde près : jeudi 8 octobre, <b>14 h 31 min 08 s</b>. Trois annulations après paiement repérées samedi soir.') +
    '<div class="jour-nav"><button class="bouton petit" type="button" data-action="jour" data-pas="-1"' + (idx <= 0 ? ' disabled' : '') + ' aria-label="Jour précédent">' + ic('gauche') + '</button><b>' + maj(dLong(iso)) + '</b>' +
    '<button class="bouton petit" type="button" data-action="jour" data-pas="1"' + (idx >= Z.length - 1 ? ' disabled' : '') + ' aria-label="Jour suivant">' + ic('droite') + '</button>' + (iso !== AUJ ? '<button class="bouton petit fantome" type="button" data-action="jour" data-pas="0">Ce soir</button>' : '<span class="discret">Z de ce soir, 21 h 00</span>') + '</div>' +
    '<div class="tuiles">' +
    '<section class="carte tuile"><span class="lib">Encaissé</span><span class="val">' + eur(z.total) + '</span><span class="sous">dont jeux FDJ ' + eur(z.ventes.fdj) + '</span></section>' +
    '<section class="carte tuile"><span class="lib">Tickets</span><span class="val">' + nb(z.tickets) + '</span><span class="sous">Panier moyen ' + eur2(Math.round(z.total / z.tickets)) + '</span></section>' +
    '<section class="carte tuile"><span class="lib">Cartes et espèces</span><span class="val">' + pct(z.cb / z.total * 100, 0) + ' carte</span><span class="sous">' + eur(z.cb) + ' carte, ' + eur(z.especes) + ' espèces</span></section>' +
    '<section class="carte tuile"><span class="lib">Marge du jour</span><span class="val">' + eur(marge) + '</span><span class="sous">Gains payés au comptoir : ' + eur(gains) + '</span></section></div>' +
    '<div class="g etire">' +
    '<div class="c5">' + carte('Encaissements du jour', '<div class="graphe">' + svgColonnes({ id: 'h', titre: 'Ventes par heure', w: LG(520), h: etroit() ? 200 : 290, vals: h.map((x) => x.montant / 100), labels: h.map((x) => x.h + ' h'), pasLabels: etroit() ? 3 : 2, largeur: etroit() ? 13 : 20,
      tips: (i) => '<b>De ' + h[i].h + ' h à ' + (h[i].h + 1) + ' h</b>' + ligneTip('', 'Ventes', eur(h[i].montant)) }) + '</div>' +
      '<div class="paiements"><div class="repart clair" role="img" aria-label="Part des cartes et des espèces"><i style="flex-grow:' + z.cb + ';background:var(--s1)"></i><i style="flex-grow:' + z.especes + ';background:var(--s3)"></i></div>' +
      '<div class="liste">' +
      '<div class="ligne"><span class="pt-cle" style="background:var(--s1)"></span><div class="l-txt"><b>Cartes</b><span>Créditées demain sur la BNP</span></div><span class="l-mt">' + eur2(z.cb) + '</span></div>' +
      '<div class="ligne"><span class="pt-cle" style="background:var(--s3)"></span><div class="l-txt"><b>Espèces encaissées</b><span>' + pct(z.especes / z.total * 100, 0) + ' des ventes</span></div><span class="l-mt">' + eur2(z.especes) + '</span></div>' +
      '<div class="ligne"><span class="pt-cle"></span><div class="l-txt"><b>Gains payés au comptoir</b><span>FDJ et PMU, en espèces</span></div><span class="l-mt negatif">' + eur2(-gains) + '</span></div>' +
      '<div class="ligne total-l"><span class="pt-cle"></span><div class="l-txt"><b>Espèces nettes du jour</b><span>À déposer avec celles du coffre</span></div><span class="l-mt">' + eur2(z.especes - gains) + '</span></div>' +
      '</div></div>', { meta: 'Ventes par heure, 6 h 30 à 20 h 30', cls: 'colonne' }) + '</div>' +
    '<div class="c7">' + carte('Par rayon', '<div class="defile"><table class="tableau compact"><thead><tr><th>Rayon</th><th class="n">Ventes TTC</th><th>Part</th><th class="n">Marge estimée</th></tr></thead><tbody>' + rayon + '<tr class="total"><td>Total</td><td class="n">' + eur2(z.total) + '</td><td></td><td class="n">' + eur2(marge) + '</td></tr></tbody></table></div>', { actions: boutonsExport('z') }) + '</div>' +
    '<div class="c7">' + carte('Contrôle FDJ : Profession Jeux face à Strator', '<div class="defile"><table class="tableau"><thead><tr><th>Jour</th><th class="n">Profession Jeux</th><th class="n">Strator</th><th class="n">Écart</th><th>État</th></tr></thead><tbody>' + fdjRows +
      '<tr class="total"><td>Semaine</td><td class="n">' + eur2(totPJ) + '</td><td class="n">' + eur2(totST) + '</td><td class="n">' + (totST - totPJ ? eur2(totST - totPJ, true) : '—') + '</td><td></td></tr></tbody></table></div>',
      { actions: seg('fdjsem', SEMAINES_FDJ.map((d) => [d, 'S' + D.releves.fdj.find((r) => r.du === d).semaine]), sem) }) + '</div>' +
    '<div class="c5">' + exportFdj + '</div>' +
    '<div class="c12">' + carte('Tickets annulés', '<div class="defile"><table class="tableau compact"><thead><tr><th>Date</th><th>Heure</th><th>Caisse</th><th>Au comptoir</th><th class="n">Montant</th><th>Motif</th><th>Moment</th></tr></thead><tbody>' +
      (annRows || '<tr><td colspan="7" class="vide-etat">Aucune annulation ce jour-là.</td></tr>') + '</tbody></table></div>',
      { meta: D.annules.length + ' annulations depuis le 1er septembre, dont ' + D.annules.filter((a) => a.moment === 'Après encaissement').length + ' après paiement', actions: seg('annules', [['jour', 'Ce jour'], ['apres', 'Après paiement'], ['tous', 'Depuis le 1er sept.']], ETAT.caisse.annules) }) + '</div>' +
    '<div class="c6">' + carte('Relevés FDJ', '<div class="defile"><table class="tableau compact"><thead><tr><th>Semaine</th><th class="n">Ventes</th><th class="n">Gains payés</th><th class="n">Commission</th><th class="n">Prélevé le</th></tr></thead><tbody>' + rel + '</tbody></table></div>', { meta: 'Prélèvement chaque mercredi', actions: boutonsExport('fdj') }) + '</div>' +
    '<div class="c6">' + carte('Relevés PMU', '<div class="defile"><table class="tableau compact"><thead><tr><th>Semaine</th><th class="n">Enjeux</th><th class="n">Gains payés</th><th class="n">Commission</th><th class="n">Prélevé le</th></tr></thead><tbody>' + relP + '</tbody></table></div>', { meta: 'Prélèvement chaque mardi' }) + '</div>' +
    '</div>';
}

/* ================================================================== FACTURES */
const CAT_COUL = { 'Tabac': '#2a78d6', 'Jeux FDJ': '#eb6834', 'Jeux PMU': '#d95926', 'Recharges': '#1baf7a', 'Timbres': '#8a63e8', 'Presse': '#69758a', 'Cigarette électronique': '#c98500',
  'CBD': '#d55181', 'Boissons': '#199e70', 'Boissons, café, entretien et confiserie': '#199e70', 'Café': '#8a5a00', 'Accessoires fumeurs': '#5b6678', 'Investissement': '#0d1830' };
const coulCat = (c) => CAT_COUL[c] || '#46526a';
const COUL_FAM = { 'Entretien': '#69758a', 'Café': '#8a5a00', 'Boissons sans alcool': '#1baf7a', 'Boissons alcoolisées': '#eb6834', 'Confiserie et snacking': '#e87ba4', 'Cigarette électronique': '#c98500', 'CBD': '#d55181', 'Accessoires fumeurs': '#5b6678', 'Commissions': '#2a78d6' };
const coulFam = (x) => COUL_FAM[x] || coulCat(x);
const CATS_FACT = Array.from(new Set(D.factures.map((f) => f.categorie))).sort();
function facturesFiltrees() {
  const f = ETAT.fact, q = f.q.trim().toLowerCase();
  return D.factures.filter((x) => (f.cat === 'toutes' || x.categorie === f.cat) && (f.statut === 'tous' || (f.statut === 'apayer' ? x.statut === 'À payer' : x.statut === 'Payée')) &&
    (!q || (x.fournisseur + ' ' + x.objet + ' ' + eur2(x.ttc) + ' ' + x.lignes.map((l) => l.d).join(' ')).toLowerCase().includes(q)))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1));
}
function htmlListeFactures() {
  const l = facturesFiltrees();
  return l.map((f) => {
    const ini = f.fournisseur.split(/[\s’']+/).filter((w) => w.length > 1).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
    return '<div class="facture-l' + (f.id === ETAT.fact.choisie ? ' choisie' : '') + '" data-action="facture" data-id="' + f.id + '" role="button" tabindex="0">' +
      '<span class="av" style="background:' + coulCat(f.categorie) + '">' + esc(ini) + '</span><b>' + esc(f.fournisseur) + '</b><span class="mt">' + eur2(f.ttc) + '</span>' +
      '<span class="s">' + esc(f.objet) + (f.alerte ? ' · hausse de prix' : '') + '</span><span class="d">' + dNum(f.date) + (f.statut === 'À payer' ? ' · à payer' : '') + '</span></div>';
  }).join('') || '<div class="vide-etat">Aucune facture pour ces filtres.</div>';
}
function htmlLecteur(id) {
  const f = FACT[id];
  if (!f) return '';
  const mvt = MVT.find((m) => m.facture === f.id);
  const parFam = {};
  f.lignes.forEach((l) => { parFam[l.fam] = (parFam[l.fam] || 0) + l.ht; });
  const fams = Object.entries(parFam).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const maxF = Math.max(...fams.map((x) => Math.abs(x[1])));
  const parTva = {};
  f.lignes.forEach((l) => { const k = String(l.tva); parTva[k] = (parTva[k] || 0) + l.ht; });
  const lignes = f.lignes.map((l) => '<tr><td class="lib">' + esc(l.d) + '<span class="fam" style="--c:' + coulFam(l.fam) + '">' + esc(l.fam) + '</span></td><td class="n">' + (l.pu != null ? nb(l.q) : '') + '</td><td class="n">' + (l.pu ? eur2(l.pu) : '') + '</td><td class="n">' + (l.tva ? String(l.tva).replace('.', ',') + NB + '%' : '—') + '</td><td class="n">' + eur2(l.ht) + '</td></tr>').join('');
  return '<div class="lecture-f"><div class="lecteur-tete"><div><span class="etiquette">' + esc(f.categorie) + '</span><h2>' + esc(f.fournisseur) + '</h2><p>' + esc(f.objet) + '</p></div><div class="lecteur-mt"><b>' + eur2(f.ttc) + '</b><span>' + (f.statut === 'À payer' ? pastille('att', 'À payer le ' + dNum(f.echeance)) : pastille('ok', 'Payée')) + '</span></div></div>' +
    '<dl class="fiche"><div><dt>Reçue le</dt><dd>' + maj(dCourt(f.date)) + '</dd></div><div><dt>Échéance</dt><dd>' + maj(dCourt(f.echeance)) + '</dd></div><div><dt>Règlement</dt><dd>' + esc(f.mode) + '</dd></div><div><dt>Pièce</dt><dd class="mono">' + f.id + '</dd></div></dl>' +
    (f.alerte ? '<div class="encart att">' + ic('alerte') + '<div><b>Hausse de prix repérée.</b> ' + esc(f.alerte) + '</div></div>' : '') +
    '<div><h3 class="h3">Lue ligne par ligne</h3><div class="defile"><table class="tableau compact"><thead><tr><th>Désignation</th><th class="n">Qté</th><th class="n">PU HT</th><th class="n">TVA</th><th class="n">Montant HT</th></tr></thead><tbody>' + lignes +
    '<tr class="total"><td>Total HT</td><td></td><td></td><td></td><td class="n">' + eur2(f.ht) + '</td></tr><tr><td>TVA</td><td></td><td></td><td></td><td class="n">' + eur2(f.tva) + '</td></tr><tr class="sous-total"><td>Total TTC</td><td></td><td></td><td></td><td class="n">' + eur2(f.ttc) + '</td></tr></tbody></table></div></div>' +
    (fams.length > 1 ? '<div><h3 class="h3">Répartition par famille</h3><div class="repartition">' + fams.map(([k, v]) => '<div class="rep-l"><span>' + esc(k) + '</span><span class="rb"><i style="width:' + (Math.abs(v) / maxF * 100).toFixed(0) + '%;background:' + coulFam(k) + '"></i></span><span class="rv">' + eur2(v) + '</span></div>').join('') + '</div>' +
      '<p class="discret petit-txt">Chaque famille d’achats est ensuite comparée à ses ventes : boissons, café, entretien, confiserie.</p></div>' : '') +
    '<div class="encart ' + (mvt ? 'ok' : 'info') + '">' + ic(mvt ? 'coche' : 'horloge') + '<div>' + (mvt ? '<b>Rapprochée avec la banque.</b> ' + esc(mvt.libelle) + ', ' + dCourt(mvt.date) + ', ' + eur2(mvt.montant) + ' sur ' + COMPTES[mvt.compte].nom + '.' : '<b>Paiement prévu le ' + dNum(f.echeance) + '.</b> Le cockpit le place dans votre trésorerie.') + '</div></div>' +
    (f.note ? '<p class="discret petit-txt">' + esc(f.note) + '</p>' : '') + '</div>';
}
function detailFactures() {
  const f = ETAT.fact;
  const aPayer = D.factures.filter((x) => x.statut === 'À payer');
  const lignes = D.factures.reduce((s, x) => s + x.lignes.length, 0);
  return bandeau('Les factures arrivent de partout : Logista, FDJ, PMU, fournisseurs, papier. On les retrouve au moment de payer, ou trop tard.',
    'Une boîte mail dédiée reçoit tout. Chaque facture est lue ligne par ligne, rangée par famille, rapprochée du prélèvement et placée dans la trésorerie.',
    '<b>' + D.factures.length + ' factures</b> et <b>' + nb(lignes) + ' lignes</b> rangées depuis juillet, sans saisie. Une hausse de prix repérée : <b>Coca-Cola +6,8 %</b>.') +
    '<div class="puces-resume"><span>' + ic('facture') + '<b>' + D.factures.length + '</b> factures depuis juillet</span><span>' + ic('coche') + '<b>100 %</b> rangées</span><span>' + ic('horloge') + '<b>' + aPayer.length + '</b> à payer, ' + eur(aPayer.reduce((s, x) => s + x.ttc, 0)) + '</span><span>' + ic('alerte') + '<b>1</b> hausse de prix</span></div>' +
    '<div class="boite">' +
    '<section class="carte"><div class="outils"><input class="champ grandit" type="search" id="q-fact" placeholder="Fournisseur, produit, montant…" value="' + esc(f.q) + '" data-filtre="fact.q">' + boutonsExport('factures', ['xlsx']) + '</div>' +
    '<div class="outils">' + seg('factstatut', [['tous', 'Toutes'], ['apayer', 'À payer'], ['payee', 'Payées']], f.statut) +
    '<select class="champ grandit" data-filtre="fact.cat" aria-label="Catégorie"><option value="toutes">Toutes les catégories</option>' + CATS_FACT.map((c) => '<option' + (f.cat === c ? ' selected' : '') + '>' + esc(c) + '</option>').join('') + '</select></div>' +
    '<div class="boite-liste" id="zone-fact">' + htmlListeFactures() + '</div></section>' +
    '<section class="carte lecteur" id="lecteur"><div class="carte-corps">' + htmlLecteur(f.choisie) + '</div></section></div>';
}

/* ================================================================== STOCK */
const ORDRE_STATUT = { 'À recommander': 0, 'À arrêter': 1, 'À réduire': 2, 'En rayon': 3 };
function quantiteCommande(r) { return Math.max(0, Math.ceil((r.v4 / 28) * 21 - r.stock)); }
function htmlTopEcarts() {
  const l = D.refs.filter((r) => r.stock_strator !== r.stock).map((r) => ({ d: r.designation, q: r.stock_strator - r.stock, v: (r.stock_strator - r.stock) * r.pa }))
    .concat(D.cbd_refs.filter((r) => r.stock_strator !== r.stock).map((r) => ({ d: r.designation, q: r.stock_strator - r.stock, v: (r.stock_strator - r.stock) * r.pa })))
    .sort((a, b) => a.v - b.v).slice(0, 4);
  return '<h3 class="h3 espace">Les plus gros écarts</h3><div class="liste">' + l.map((x) => '<div class="ligne"><div class="l-txt"><b>' + esc(x.d) + '</b><span>' + Math.abs(x.q) + ' unité' + (Math.abs(x.q) > 1 ? 's' : '') + ' de moins dans Strator</span></div><span class="l-mt negatif">' + eur2(x.v) + '</span></div>').join('') + '</div>';
}
function detailStock() {
  const s = ETAT.stock;
  const refs = D.refs;
  const n = (st) => refs.filter((r) => r.statut === st).length;
  let onglet = '';
  if (s.onglet === 'vape') {
    const q = s.q.trim().toLowerCase();
    let l = refs.filter((r) => (s.statut === 'tous' || r.statut === s.statut) && (!q || (r.designation + ' ' + r.code + ' ' + r.famille).toLowerCase().includes(q)));
    l = trier(l, s.tri, s.sens, s.tri === 'statut' ? (r) => ORDRE_STATUT[r.statut] * 1000 - Math.abs(r.tendance) : s.tri === 'valeur' ? (r) => r.stock * r.pa : null);
    const NIV = { 'À recommander': 'info', 'À arrêter': 'ko', 'À réduire': 'att', 'En rayon': 'ok' };
    const rows = l.map((r) => '<tr' + (r.cle ? ' class="choisi"' : '') + '><td class="mono">' + r.code + '</td><td class="lib"><b>' + esc(r.designation) + '</b><span class="sec">' + esc(r.famille) + ' · ' + esc(r.fournisseur) + '</span></td><td class="n">' + r.stock + '</td><td class="n">' + r.v4 + '</td><td class="n">' + delta(r.tendance) + '</td><td class="n">' + (r.couverture >= 999 ? '—' : r.couverture + ' j') + '</td><td>' + pastille(NIV[r.statut], r.statut) + '</td><td class="n">' + eur2(r.stock * r.pa) + '</td></tr>').join('');
    onglet = carte('Cigarette électronique : ' + refs.length + ' références', '', { meta: 'Ventes sur 4 semaines, comparées aux 4 précédentes', actions: boutonsExport('vape') })
      .replace('<div class="carte-corps"></div>', '<div class="outils">' + seg('vapestatut', [['tous', 'Toutes (' + refs.length + ')'], ['À recommander', 'À recommander (' + n('À recommander') + ')'], ['À réduire', 'À réduire (' + n('À réduire') + ')'], ['À arrêter', 'À arrêter (' + n('À arrêter') + ')']], s.statut) +
        '<input class="champ grandit" type="search" id="q-vape" placeholder="Saveur, taux, matériel…" value="' + esc(s.q) + '" data-filtre="stock.q"></div><div id="zone-vape" class="defile tableau-haut"><table class="tableau compact"><thead><tr>' + th('Réf.', 'code', s) + th('Désignation', 'designation', s) + th('Stock', 'stock', s, true) + th('Ventes 4 sem.', 'v4', s, true) + th('Tendance', 'tendance', s, true) + th('Couverture', 'couverture', s, true) + th('Statut', 'statut', s) + th('Valeur', 'valeur', s, true) + '</tr></thead><tbody>' + rows + '</tbody></table></div>');
  }
  if (s.onglet === 'cbd') {
    const rows = D.cbd_refs.map((r) => '<tr><td class="lib"><b>' + esc(r.designation) + '</b><span class="sec">' + esc(r.famille) + '</span></td><td class="mono">' + esc(r.lot) + '</td><td>' + dNumA(r.conditionne) + '</td><td class="n">' + (r.thc ? F2.format(r.thc) + NB + '%' : '—') + '</td><td class="n">' + r.stock + '</td><td class="n">' + r.v4 + '</td><td class="n">' + eur2(r.pv) + '</td><td>' + pastille('ok', 'Analyse reçue') + '</td></tr>').join('');
    onglet = carte('CBD : chaque produit a sa fiche', '<div class="defile"><table class="tableau compact"><thead><tr><th>Produit</th><th>Lot</th><th>Conditionné le</th><th class="n">THC</th><th class="n">Stock</th><th class="n">Ventes 4 sem.</th><th class="n">Prix</th><th>Traçabilité</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="discret petit-txt">Lot, date de conditionnement et certificat d’analyse pour chaque produit. Taux de THC des fleurs sous le seuil légal de 0,3 %.</p>', { meta: 'Lemon Haze 5 g, lot 26-10-B, conditionné le 12/10/2026', actions: boutonsExport('cbd') });
  }
  if (s.onglet === 'ecarts') {
    const lst = D.refs.filter((r) => r.stock_strator !== r.stock).map((r) => ({ code: r.code, d: r.designation, t: r.stock, s: r.stock_strator, pa: r.pa }))
      .concat(D.cbd_refs.filter((r) => r.stock_strator !== r.stock).map((r) => ({ code: r.code, d: r.designation, t: r.stock, s: r.stock_strator, pa: r.pa })));
    const rows = lst.map((x) => '<tr><td class="mono">' + x.code + '</td><td class="lib"><b>' + esc(x.d) + '</b></td><td class="n">' + x.t + '</td><td class="n">' + x.s + '</td><td class="n negatif">' + (x.s - x.t) + '</td><td class="n negatif">' + eur2((x.s - x.t) * x.pa) + '</td></tr>').join('');
    const autres = D.stock.filter((f) => !['Cigarette électronique', 'CBD', 'Tabac'].includes(f.famille) && f.theo !== f.strator).map((f) => '<tr><td></td><td class="lib"><b>' + esc(f.famille) + '</b><span class="sec">famille entière</span></td><td class="n"></td><td class="n"></td><td class="n"></td><td class="n negatif">' + eur2(f.strator - f.theo) + '</td></tr>').join('');
    onglet = carte('Écarts entre le stock théorique et Strator', '<div class="defile"><table class="tableau compact"><thead><tr><th>Réf.</th><th>Désignation</th><th class="n">Théorique</th><th class="n">Strator</th><th class="n">Écart</th><th class="n">Valeur</th></tr></thead><tbody>' + rows + autres +
      '<tr class="total"><td></td><td>Total</td><td></td><td></td><td></td><td class="n">' + eur2(-STOCK_ECART) + '</td></tr></tbody></table></div>' +
      '<div class="encart info" style="margin-top:12px">' + ic('info') + '<div>Le stock théorique se calcule tout seul : stock de départ, plus les achats lus sur les factures, moins les ventes de la caisse, référence par référence, dès que le code-barres est renseigné.</div></div>', { meta: 'Tolérance : 2 % de la valeur du stock' });
  }
  if (s.onglet === 'commande') {
    const l = refs.filter((r) => r.statut === 'À recommander').sort((a, b) => b.tendance - a.tendance);
    let tot = 0;
    const rows = l.map((r) => {
      const q = ETAT.commande[r.code] != null ? ETAT.commande[r.code] : quantiteCommande(r);
      tot += q * r.pa;
      return '<tr' + (r.cle ? ' class="choisi"' : '') + '><td class="lib"><b>' + esc(r.designation) + '</b><span class="sec">' + r.code + ' · ' + esc(r.fournisseur) + '</span></td><td class="n">' + r.stock + '</td><td class="n">' + r.v4 + '</td><td class="n">' + delta(r.tendance) + '</td><td class="n"><input class="champ qte" type="number" min="0" step="1" value="' + q + '" data-commande="' + r.code + '" aria-label="Quantité ' + esc(r.designation) + '"></td><td class="n">' + eur2(q * r.pa) + '</td></tr>';
    }).join('');
    onglet = carte('Commande de jeudi', '<div class="defile"><table class="tableau compact"><thead><tr><th>Référence</th><th class="n">Stock</th><th class="n">Ventes 4 sem.</th><th class="n">Tendance</th><th class="n">À commander</th><th class="n">Coût HT</th></tr></thead><tbody>' + rows +
      '<tr class="total"><td>Total de la commande</td><td></td><td></td><td></td><td></td><td class="n">' + eur2(tot) + '</td></tr></tbody></table></div><p class="discret petit-txt">Quantités proposées pour trois semaines de ventes au rythme actuel. Modifiez-les avant d’envoyer.</p>',
      { meta: 'Passée par Logista, comme d’habitude', actions: '<button class="bouton petit" type="button" data-action="copier-commande">' + ic('copie') + '<span>Copier la commande</span></button>' + boutonsExport('commande', ['csv']) });
  }
  const fam = D.stock.map((f) => '<tr><td><b>' + esc(f.famille) + '</b><span class="sec">' + esc(f.detail) + '</span></td><td class="n">' + eur2(f.theo) + '</td><td class="n">' + eur2(f.strator) + '</td><td class="n ' + (f.strator - f.theo ? 'negatif' : '') + '">' + (f.strator - f.theo ? eur2(f.strator - f.theo, true) : '—') + '</td><td class="n">' + (f.theo ? pct((f.strator - f.theo) / f.theo * 100) : '') + '</td></tr>').join('');
  return bandeau('Le stock, on ne le voit pas : on le découvre à l’inventaire, ou quand un client repart les mains vides.',
    'Il calcule chaque soir le stock théorique (achats moins ventes) et le compare à Strator, référence par référence. Il suit les ventes de chaque référence vape et la traçabilité du CBD.',
    'Écart de <b>' + eur(STOCK_ECART) + '</b> sur ' + eur(D.stock_tot.theo) + ' de stock (' + pct(STOCK_ECART / D.stock_tot.theo * 100) + '). Fraise glacée à recommander (<b>+34 %</b>), Vanille caramel à arrêter (<b>−27 %</b>).') +
    '<div class="g"><div class="c5">' + carte('Stock théorique et Strator', '<div class="stock-chiffres"><div><span>Théorique</span><b>' + eur(D.stock_tot.theo) + '</b></div><div><span>Dans Strator</span><b>' + eur(D.stock_tot.strator) + '</b></div><div class="ecart"><span>Écart</span><b>' + eur(STOCK_ECART) + '</b><small>' + pct(STOCK_ECART / D.stock_tot.theo * 100) + '</small></div></div><p class="discret petit-txt">Rien ne manque en rayon : l’écart reste sous la tolérance de 2 %.</p>' + htmlTopEcarts(), { meta: 'Au prix d’achat, ce soir' }) + '</div>' +
    '<div class="c7">' + carte('Par famille', '<div class="defile"><table class="tableau compact"><thead><tr><th>Famille</th><th class="n">Théorique</th><th class="n">Strator</th><th class="n">Écart</th><th class="n">%</th></tr></thead><tbody>' + fam + '<tr class="total"><td>Total</td><td class="n">' + eur2(D.stock_tot.theo) + '</td><td class="n">' + eur2(D.stock_tot.strator) + '</td><td class="n negatif">' + eur2(-STOCK_ECART) + '</td><td class="n">' + pct(-STOCK_ECART / D.stock_tot.theo * 100) + '</td></tr></tbody></table></div>', { actions: boutonsExport('stock', ['xlsx']) }) + '</div></div>' +
    '<div class="onglets">' + seg('stockonglet', [['vape', 'Cigarette électronique'], ['cbd', 'CBD'], ['ecarts', 'Écarts'], ['commande', 'Commande de jeudi']], s.onglet) + '</div>' + onglet;
}

/* ================================================================== RENTABILITÉ */
function grapheMarges() {
  const cles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'att'];
  const labels = cles.map((k) => (k === 'att' ? 'oct.*' : M[k - 1]));
  const series = ACTIVITES.map((a) => ({ lib: a.lib, coul: a.coul, vals: cles.map((k) => margeActivite(pnlDe(k).produits, a) / 100) }));
  return '<div class="legende">' + ACTIVITES.map((a) => '<span><i style="background:' + a.coul + '"></i>' + a.lib + '</span>').join('') + '</div>' +
    '<div class="graphe">' + svgEmpile({ id: 'marges', titre: 'Marge brute par activité, de janvier à octobre', w: LG(760), h: 280, labels, series, pasLabels: etroit() ? 3 : 0,
      titresX: cles.map((k) => (k === 'att' ? 'Octobre, atterrissage' : maj(ML[k - 1]))), hachure: (i) => i === 9,
      etiquette: (i) => (i === 9 || (!etroit() && (i === 8 || i === 0)) ? keur(series.reduce((s, se) => s + se.vals[i], 0)) : '') }) + '</div>' +
    '<p class="discret petit-txt">* Octobre : réel au 13, puis le reste du mois au rythme des quatre dernières semaines.</p>';
}
function tableProduits(cle) {
  const x = pnlDe(cle);
  const p = x.produits;
  const n1 = typeof cle === 'number' ? n1Produits(cle) : null;
  const ligne = (fam, lib, venteHT) => {
    const v = p[fam + '_ventes'], m = p[fam + '_marge'];
    const mn1 = n1 ? n1[fam + '_marge'] : null;
    const evo = mn1 ? (m - mn1) / mn1 * 100 : null;
    return '<tr><td><b>' + lib + '</b><span class="sec">' + (venteHT ? 'ventes HT, marge' : fam === 'tabac' ? 'ventes TTC, remise' : 'ventes, commission') + '</span></td><td class="n cache-etroit">' + eur(v) + '</td><td class="n"><b>' + eur(m) + '</b></td><td class="n">' + pct(m / v * 100) + '</td><td class="n cache-etroit">' + (mn1 != null ? (mn1 ? eur(mn1) : '—') : '') + '</td><td class="n">' + (evo != null && isFinite(evo) ? delta(evo) : mn1 === 0 ? pastille('info sans', 'Nouveau') : '') + '</td></tr>';
  };
  let h = '<tr class="section"><td colspan="6">Tabac, jeux et services</td></tr>' + ligne('tabac', 'Tabac') + ligne('fdj', 'Jeux FDJ') + ligne('pmu', 'Jeux PMU') + ligne('timbres', 'Timbres') + ligne('recharges', 'Recharges et cartes prépayées') + ligne('presse', 'Presse');
  h += '<tr class="section"><td colspan="6">Boutique</td></tr>' + D.boutique.map((f) => ligne(f, LIB_FAM[f], true)).join('');
  const mt = margeTotale(p), mtn1 = n1 ? margeTotale(n1) : null;
  h += '<tr class="total"><td>Marge brute</td><td class="cache-etroit"></td><td class="n">' + eur(mt) + '</td><td></td><td class="n cache-etroit">' + (mtn1 ? eur(mtn1) : '') + '</td><td class="n">' + (mtn1 ? delta((mt - mtn1) / mtn1 * 100) : '') + '</td></tr>';
  return '<div class="defile"><table class="tableau"><thead><tr><th>Rayon</th><th class="n cache-etroit">Ventes</th><th class="n">Marge</th><th class="n">Taux</th><th class="n cache-etroit">' + (n1 ? 'Même mois 2025' : '') + '</th><th class="n">' + (n1 ? 'Évolution' : '') + '</th></tr></thead><tbody>' + h + '</tbody></table></div>';
}
function noteProduits(cle) {
  if (typeof cle !== 'number') return '';
  const p = pnlDe(cle).produits, n1 = n1Produits(cle);
  const r100 = (c) => Math.round(c / 100) * 100;
  const mt = margeTotale(p), m0 = margeTotale(n1), dt = r100(mt) - r100(m0);
  const acts = ACTIVITES.map((a) => ({ a, d: r100(margeActivite(p, a)) - r100(margeActivite(n1, a)) })).sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
  const top = acts[0];
  const essentiel = Math.sign(top.d) === Math.sign(dt) && Math.abs(top.d) >= Math.abs(dt) / 2;
  const nomAct = top.a.id === 'cbd' ? 'Le CBD' : top.a.id === 'jeux' ? 'Les jeux' : top.a.id === 'tabac' ? 'Le tabac' : top.a.id === 'vape' ? 'La cigarette électronique' : top.a.id === 'services' ? 'Les timbres, recharges et presse' : 'Le bar et la boutique';
  return '<p class="pied-note">' + ic('info') + '<span><b>Marge brute : ' + eur(mt) + ', ' + eur(dt, false, true) + ' sur ' + ML[cle - 1] + ' 2025 (' + pctS(dt / m0 * 100) + ').</b> ' +
    (essentiel ? nomAct + ' fait l’essentiel de ' + (dt >= 0 ? 'la hausse' : 'la baisse') : 'Plus forte variation : ' + top.a.lib.toLowerCase()) + ' (' + eur(top.d, false, true) + ').</span></p>';
}
function tableCharges(cle) {
  const x = pnlDe(cle);
  const mt = margeTotale(x.produits);
  const ch = x.charges;
  const exploit = chargesHorsAmort(ch);
  const ebe = mt - exploit;
  const res = mt - chargesTotales(ch);
  const l = (lib, v, cls = '') => '<tr class="' + cls + '"><td>' + lib + '</td><td class="n">' + eur(v) + '</td><td class="n">' + pct(v / mt * 100) + '</td></tr>';
  let h = l('<b>Marge brute</b>', mt, 'sous-total');
  RUBRIQUES.forEach((r) => { if (ch[r]) h += l(r, -ch[r]); });
  h += l('<b>Excédent brut d’exploitation</b>', ebe, 'sous-total') + l('Amortissements', -(ch['Amortissements'] || 0)) + l('Charges financières', -(ch['Charges financières'] || 0));
  h += l('Résultat courant, avant votre rémunération', res, 'total');
  return '<div class="defile"><table class="tableau"><thead><tr><th>Ligne</th><th class="n">Montant</th><th class="n">Part de la marge</th></tr></thead><tbody>' + h + '</tbody></table></div>';
}
function tableAnnee() {
  const cles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'att'];
  const X = cles.map(pnlDe);
  const lignes = [];
  ACTIVITES.forEach((a) => lignes.push({ lib: a.lib, vals: X.map((x) => margeActivite(x.produits, a)) }));
  lignes.push({ lib: 'Marge brute', vals: X.map((x) => margeTotale(x.produits)), cls: 'sous-total' });
  lignes.push({ lib: 'Charges d’exploitation', vals: X.map((x) => -chargesHorsAmort(x.charges)) });
  lignes.push({ lib: 'Excédent brut d’exploitation', vals: X.map((x) => margeTotale(x.produits) - chargesHorsAmort(x.charges)), cls: 'sous-total' });
  lignes.push({ lib: 'Amortissements et frais financiers', vals: X.map((x) => -((x.charges['Amortissements'] || 0) + (x.charges['Charges financières'] || 0))) });
  lignes.push({ lib: 'Résultat courant', vals: X.map((x) => resultatDe(x)), cls: 'total' });
  return '<div class="defile"><table class="tableau compact"><thead><tr><th>En euros</th>' + cles.map((k) => '<th class="n">' + (k === 'att' ? 'oct.*' : M[k - 1]) + '</th>').join('') + '<th class="n">Cumul</th></tr></thead><tbody>' +
    lignes.map((l) => '<tr class="' + (l.cls || '') + '"><td>' + l.lib + '</td>' + l.vals.map((v) => '<td class="n">' + F0.format(Math.round(v / 100)) + '</td>').join('') + '<td class="n"><b>' + F0.format(Math.round(l.vals.reduce((s, v) => s + v, 0) / 100)) + '</b></td></tr>').join('') +
    '</tbody></table></div><p class="discret petit-txt">* Octobre en atterrissage. Résultat avant la rémunération du gérant et avant impôt.</p>';
}
function cartesRatios() {
  const R = D.ratios;
  const mois = R.map((r) => M[r.mois - 1]);
  const r9 = R[8];
  const cafe = svgColonnes({ id: 'cafe', titre: 'Tasses de café par kilo', w: 340, h: 150, vals: R.map((r) => r.tasses_kg), labels: mois, pasLabels: 2, largeur: 16, margeG: 34, fmtAxe: (t) => F0.format(t),
    couleurs: R.map((r, i) => (i === 8 ? 'var(--att-plein)' : 'var(--s1)')), tips: (i) => '<b>' + maj(ML[i]) + '</b>' + ligneTip('', 'Tasses par kilo', R[i].tasses_kg) + ligneTip('', 'Cafés vendus', nb(R[i].tasses)) + ligneTip('', 'Kilos achetés', R[i].cafe_kg) });
  const boi = svgColonnes({ id: 'boi', titre: 'Écart de marge boissons', w: 340, h: 150, vals: R.map((r) => Math.round((r.boissons_reel - r.boissons_theo) * 10) / 10), labels: mois, pasLabels: 2, largeur: 16, margeG: 34, fmtAxe: (t) => F1.format(t),
    tips: (i) => '<b>' + maj(ML[i]) + '</b>' + ligneTip('', 'Marge réelle', pct(R[i].boissons_reel)) + ligneTip('', 'Marge attendue', pct(R[i].boissons_theo)) });
  const esp = svgColonnes({ id: 'esp', titre: 'Écart de caisse en espèces', w: 340, h: 150, vals: R.map((r) => r.especes_ecart / 100), labels: mois, pasLabels: 2, largeur: 16, margeG: 34, fmtAxe: (t) => F0.format(t) + NB + '€',
    tips: (i) => '<b>' + maj(ML[i]) + '</b>' + ligneTip('', 'Écart de caisse', eur(R[i].especes_ecart)) });
  const moisV = [7, 8, 9, 10];
  const vapeD = moisV.map((m) => ((D.vape_achats[String(m)] || 0) - (m === 10 ? 0 : D.pnl[m - 1].produits.vape_cout)) / 100);
  const vape = svgColonnes({ id: 'vape', titre: 'Achats vape moins coût des ventes', w: 340, h: 150, vals: vapeD.slice(0, 3), labels: ['juil.', 'août', 'sept.'], largeur: 26, margeG: 46,
    couleurs: ['var(--s4)', 'var(--s4)', 'var(--att-plein)'], tips: (i) => '<b>' + maj(ML[moisV[i] - 1]) + '</b>' + ligneTip('', 'Achats moins coût des ventes', eur(vapeD[i] * 100)) });
  const fdjCom = D.releves.fdj.slice(-8).reduce((s, r) => s + r.commission, 0) / D.releves.fdj.slice(-8).reduce((s, r) => s + r.ventes, 0) * 100;
  const tabacP = D.pnl.slice(0, 9).map((x) => x.produits);
  const tabac = svgColonnes({ id: 'tabac', titre: 'Remise tabac chaque mois', w: 340, h: 150, vals: tabacP.map((x) => x.tabac_marge / 100), labels: mois, pasLabels: 2, largeur: 16, margeG: 38,
    tips: (i) => '<b>' + maj(ML[i]) + '</b>' + ligneTip('', 'Ventes de tabac', eur(tabacP[i].tabac_ventes)) + ligneTip('', 'Remise', eur(tabacP[i].tabac_marge)) + ligneTip('', 'Taux', pct(tabacP[i].tabac_marge / tabacP[i].tabac_ventes * 100)) });
  const relF = D.releves.fdj.slice(-8);
  const fdjG = svgColonnes({ id: 'fdjc', titre: 'Commission FDJ chaque semaine', w: 340, h: 150, vals: relF.map((r) => r.commission / 100), labels: relF.map((r) => 'S' + r.semaine), pasLabels: 2, largeur: 16, margeG: 38, couleur: 'var(--s2)',
    tips: (i) => '<b>Semaine ' + relF[i].semaine + '</b>' + ligneTip('', 'Ventes', eur(relF[i].ventes)) + ligneTip('', 'Commission', eur2(relF[i].commission)) + ligneTip('', 'Taux', pct(relF[i].commission / relF[i].ventes * 100)) });
  const c = (titre, val, lib, graphe, verdict) => '<section class="carte ratio-c"><div class="carte-tete"><h3>' + titre + '</h3></div><div class="carte-corps ratio"><span class="rv">' + val + '</span><span class="rl">' + lib + '</span>' + (graphe ? '<div class="graphe">' + graphe + '</div>' : '') + verdict + '</div></section>';
  return '<div class="ratios">' +
    c('Café', r9.tasses_kg + ' tasses par kilo', 'en septembre : ' + nb(r9.tasses) + ' cafés vendus pour ' + r9.cafe_kg + ' kg achetés', cafe, '<div class="encart att">' + ic('alerte') + '<div>Environ 138 attendues. Cafés offerts, réglage du moulin ou ventes oubliées en caisse.</div></div>') +
    c('Boissons', pct(r9.boissons_reel), 'de marge réelle en septembre, ' + pct(r9.boissons_theo) + ' attendus', boi, '<div class="encart att">' + ic('alerte') + '<div>Un à deux points sous l’attendu chaque mois : boissons offertes, casse ou prix de rayon pas à jour. Coca-Cola +6,8 % chez Metro le 9 octobre : prix à revoir.</div></div>') +
    c('Espèces', eur(r9.especes_ecart), 'd’écart de caisse en septembre', esp, '<div class="encart ok">' + ic('coche') + '<div>Dans la tolérance. Dépôts bancaires rapprochés des espèces du Z, gains payés déduits.</div></div>') +
    c('Cigarette électronique', eur(vapeD[2] * 100, false, true), 'd’achats au-dessus du coût des ventes en septembre', vape, '<div class="encart ok">' + ic('coche') + '<div>Écart expliqué : 14 nouvelles références mises en rayon.</div></div>') +
    c('Tabac', pct(D.taux.tabac * 100), 'de remise sur les ventes, chaque mois depuis janvier', tabac, '<div class="encart ok">' + ic('coche') + '<div>Factures Logista cohérentes avec les ventes de la caisse, livraison après livraison.</div></div>') +
    c('Jeux FDJ', pct(fdjCom, 2), 'de commission sur les ventes, huit dernières semaines', fdjG, '<div class="encart ok">' + ic('coche') + '<div>Commission conforme sur chaque relevé hebdomadaire.</div></div>') +
    '</div>';
}
function htmlBarresMarge(cle, note = true) {
  const p = pnlDe(cle).produits;
  const parts = ACTIVITES.map((a) => ({ a, m: margeActivite(p, a) })).sort((u, v) => v.m - u.m);
  const tot = parts.reduce((s, y) => s + y.m, 0), maxP = Math.max(...parts.map((y) => y.m));
  const part = (i) => pct(margeActivite(p, ACTIVITES[i]) / tot * 100, 0);
  return '<div class="repartition grande">' + parts.map((y) => '<div class="rep-l"><span>' + y.a.lib + '</span><span class="rb"><i style="width:' + (y.m / maxP * 100).toFixed(0) + '%;background:' + y.a.coul + '"></i></span><span class="rv">' + eur(y.m) + '</span></div>').join('') + '</div>' +
    (note ? '<p class="discret petit-txt">Les jeux rapportent ' + part(1) + ' de la marge, le tabac ' + part(0) + '. Le CBD pèse déjà ' + part(4) + '.</p>' : '');
}
function htmlOrigineMarge(cle) {
  const x = pnlDe(cle), p = x.produits;
  const parts = ACTIVITES.map((a) => ({ a, m: margeActivite(p, a) })).sort((u, v) => v.m - u.m);
  const tot = parts.reduce((s, y) => s + y.m, 0), maxP = Math.max(...parts.map((y) => y.m));
  const part = (i) => pct(margeActivite(p, ACTIVITES[i]) / tot * 100, 0);
  return carte('D’où vient la marge', '<div class="repartition">' + parts.map((y) => '<div class="rep-l"><span>' + y.a.lib + '</span><span class="rb"><i style="width:' + (y.m / maxP * 100).toFixed(0) + '%;background:' + y.a.coul + '"></i></span><span class="rv">' + eur(y.m) + '</span></div>').join('') + '</div>' +
    '<p class="discret petit-txt">Les jeux rapportent ' + part(1) + ' de la marge, le tabac ' + part(0) + '. Le CBD pèse déjà ' + part(4) + '.</p>', { meta: x.lib });
}
function detailRentabilite() {
  const r = ETAT.resultat;
  const att = D.pnl_att;
  const resOct = margeTotale(att.produits) - chargesTotales(att.charges);
  const cbd4 = D.pnl[3].produits.cbd_ventes, cbd9 = D.pnl_att.produits.cbd_ventes;
  const n1s = n1Produits(9);
  const evo = ACTIVITES.map((a) => { const m = margeActivite(D.pnl[8].produits, a), m0 = margeActivite(n1s, a); return { a, m, m0, d: (Math.round(m / 100) - Math.round(m0 / 100)) * 100 }; }).sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
  const choix = [[1, 'janv.'], [2, 'févr.'], [3, 'mars'], [4, 'avr.'], [5, 'mai'], [6, 'juin'], [7, 'juil.'], [8, 'août'], [9, 'sept.'], ['oct', 'oct. au 13'], ['att', 'oct. atterrissage']];
  return bandeau('Le compte de résultat arrive des mois plus tard, en un seul bloc. Il ne dit pas ce que rapporte chaque rayon, ni où partent les marges.',
    'Chaque mois, la marge de chaque rayon, de la marge au résultat, et l’atterrissage du mois en cours. Des ratios surveillent le café, les boissons et les espèces.',
    'Octobre : <b>' + eur(resOct) + '</b> de résultat attendu. Le CBD est passé de ' + eur(cbd4) + ' de ventes en avril à ' + eur(cbd9) + ' en octobre (<b>×' + F0.format(cbd9 / cbd4) + '</b>).') +
    '<div class="g etire"><div class="c8">' + carte('Marge brute par activité, en 2026', grapheMarges(), { meta: 'Ce qui reste après le coût des achats ou les commissions' }) + '</div>' +
    '<div class="c4">' + carte('Sur un an, ce qui a bougé', '<div class="liste">' + evo.map((x) => '<div class="ligne longue"><span class="pt-cle" style="background:' + x.a.coul + '"></span><div class="l-txt"><b>' + x.a.lib + '</b><span>' + eur(x.m) + ' en septembre, ' + eur(x.m0) + ' en 2025</span></div><span class="l-mt ' + (x.d >= 0 ? 'positif' : 'negatif') + '">' + eur(x.d, false, true) + '</span></div>').join('') + '</div>', { meta: 'Marge de septembre' }) + '</div></div>' +
    '<div class="onglets">' + seg('resvue', [['mois', 'Un mois'], ['annee', 'L’année']], r.vue) + (r.vue === 'mois' ? '<select class="champ" data-filtre="resultat.mois" aria-label="Mois">' + choix.map(([k, l]) => '<option value="' + k + '"' + (String(r.mois) === String(k) ? ' selected' : '') + '>' + maj(l) + '</option>').join('') + '</select>' : '') + '<span class="grandit"></span>' + boutonsExport('resultat', ['xlsx']) + '</div>' +
    (r.vue === 'mois' ? carte('Ce que rapporte chaque rayon, ' + pnlDe(r.mois).lib.toLowerCase(), tableProduits(r.mois), { pied: noteProduits(r.mois) }) + '<div class="g"><div class="c7">' + carte('De la marge au résultat', tableCharges(r.mois)) + '</div><div class="c5">' + htmlOrigineMarge(r.mois) + '</div></div>'
      : carte('Compte de résultat de gestion, mois par mois', tableAnnee())) +
    '<div class="titre-section"><h2>Ratios</h2><span>Les ratios racontent une histoire. Autant qu’elle soit propre.</span></div>' + cartesRatios() +
    carte('Facture électronique : être prêt avant septembre 2027',
      '<div class="frise"><div class="etape fait"><b>1er septembre 2026</b><span>Réception obligatoire pour toutes les entreprises.</span><small>Vos factures arrivent déjà dans le cockpit.</small></div>' +
      '<div class="etape bientot"><b>Aujourd’hui</b><span>Ratios propres, familles d’achats à jour, écarts expliqués.</span><small>C’est ce que l’administration verra.</small></div>' +
      '<div class="etape"><b>1er septembre 2027</b><span>Émission et transmission des ventes (e-reporting) pour les PME et les TPE.</span><small>Source : impots.gouv.fr</small></div></div>',
      { meta: 'Calendrier de la réforme' });
}

/* ================================================================== MISE EN PLACE */
function detailMise() {
  const sources = [
    { ic: 'banque', t: 'Vos banques, en lecture seule', d: 'Comme pour votre expert-comptable : une connexion agréée qui lit les relevés. Aucune opération possible.', s: 'Lues ce soir à 21 h 02' },
    { ic: 'mail', t: 'Une boîte mail par tabac', d: 'Logista, la FDJ, le PMU et vos fournisseurs y envoient leurs factures. Vous y transférez les autres.', s: D.factures.length + ' factures reçues depuis juillet' },
    { ic: 'caisse', t: 'L’export de caisse, chaque soir', d: 'Strator envoie le Z, les ventes par article et les tickets annulés. Vos identifiants restent chez vous.', s: 'Reçu ce soir à 21 h 00' },
    { ic: 'mandat', t: 'Un mandat, pas un mot de passe', d: 'Avec votre accord, chaque partenaire envoie un export : relevés FDJ et PMU, recharges, timbres, boissons.', s: 'FDJ, PMU, Logista : reçus cette semaine' },
  ];
  const etapes = [
    ['Semaine 1', 'Le mandat et la boîte mail', 'Vous signez le mandat. La boîte factures est créée, vos fournisseurs reçoivent la nouvelle adresse.'],
    ['Semaine 1', 'Les banques en lecture seule', 'Connexion agréée, comme pour l’expert-comptable. Six mois d’historique lus d’un coup.'],
    ['Semaine 2', 'La caisse et les jeux', 'Export Strator programmé chaque soir. Premiers contrôles FDJ et PMU, premier atterrissage du lundi.'],
    ['Semaine 3', 'Les achats et le stock', 'Factures lues ligne par ligne, familles d’achats, stock théorique face à Strator.'],
    ['Semaine 4', 'Le plan de vol et la première lecture', 'Plan de vol à six mois, compte de résultat du mois, premier rendez-vous avec votre contrôleur de gestion.'],
  ];
  return '<div class="mise-intro"><h2>Sans aucun mot de passe.</h2><p>Le cockpit ne se connecte ni à votre caisse ni à vos comptes de jeux. Il reçoit ce que vous et vos partenaires lui envoyez, et lit vos banques en lecture seule. Chaque accès se coupe en un clic.</p></div>' +
    '<div class="sources">' + sources.map((s) => '<section class="carte source"><h3><span class="puce-ic ok">' + ic(s.ic) + '</span>' + s.t + '</h3><p>' + s.d + '</p><div class="src-pied"><span><span class="point"></span> ' + s.s + '</span></div></section>').join('') + '</div>' +
    '<div class="g"><div class="c7">' + carte('Le déploiement, semaine par semaine', '<ol class="etapes">' + etapes.map((e, i) => '<li><span class="num-e">' + (i + 1) + '</span><div><span class="etiquette">' + e[0] + '</span><b>' + e[1] + '</b><p>' + e[2] + '</p></div></li>').join('') + '</ol>', { meta: 'Un tabac opérationnel en quatre semaines' }) + '</div>' +
    '<div class="c5">' + carte('Chaque mois, une lecture avec vous', '<p class="pre">Comme si votre tabac avait son propre contrôleur de gestion : on lit vos chiffres ensemble et on s’adapte à vos questions.</p>' +
      '<div class="rdv"><span class="puce-ic info">' + ic('calendrier') + '</span><div><b>Jeudi 5 novembre, 10 h</b><span>Lecture d’octobre, 45 minutes</span></div></div>' +
      '<ul class="ordre"><li>Atterrissage d’octobre et marge par rayon</li><li>Agencement : choisir la date et monter le dossier d’aide</li><li>Embauche pour fermer à 23 h : le bon mois</li></ul>' +
      '<div class="carte-actions"><button class="bouton petit" type="button" data-action="export" data-cle="pack" data-format="pdf">' + ic('pdf') + '<span>Pack de septembre pour le comptable</span></button></div>') +
    carte('Pour un réseau de buralistes', '<p class="pre">Un pilote de trois mois avec vingt buralistes volontaires. De leur côté, un simple export, avec l’accord de chaque buraliste. On mesure le temps gagné, les écarts retrouvés et la trésorerie sécurisée.</p>', { cls: 'reseau' }) + '</div></div>' +
    carte('Ce qui reste à vous', '<div class="garanties">' +
      '<div class="ligne"><span class="puce-ic">' + ic('cadenas') + '</span><div class="l-txt"><b>Vos identifiants restent chez vous</b><span>Ni code bancaire, ni mot de passe de caisse ou de jeux.</span></div></div>' +
      '<div class="ligne"><span class="puce-ic">' + ic('croix') + '</span><div class="l-txt"><b>Chaque accès se coupe en un clic</b><span>Banque, boîte factures, exports : vous arrêtez quand vous voulez.</span></div></div>' +
      '<div class="ligne"><span class="puce-ic">' + ic('export') + '</span><div class="l-txt"><b>Tout s’exporte</b><span>Excel, CSV et PDF, pour vous ou pour votre comptable.</span></div></div></div>');
}

/* ================================================================== VUES SIMPLES : une phrase, trois chiffres, un visuel */
function pageSimple(o) {
  const ouvert = !!ETAT.detail[ETAT.route];
  return '<section class="resume" aria-label="L’essentiel">' +
    '<p class="resume-phrase">' + o.probleme + ' <b>' + o.cockpit + '</b></p>' +
    '<div class="gros-chiffres">' + o.chiffres.map((c) => '<div class="gc' + (c[2] ? ' ' + c[2] : '') + '"><b>' + c[0] + '</b><span>' + c[1] + '</span></div>').join('') + '</div></section>' +
    carte(o.visuelTitre, o.visuel, { meta: o.visuelMeta || '', actions: o.visuelActions || '', cls: 'visuel-simple' }) +
    '<div class="detail-bascule"><button class="bouton" type="button" data-action="detail" aria-expanded="' + ouvert + '">' + ic('droite') + '<span>' + (ouvert ? 'Masquer le détail' : 'Voir le détail') + '</span></button>' +
    (ouvert ? '' : '<span class="discret">' + o.contenu + '</span>') + '</div>' +
    (ouvert ? '<div class="detail" id="detail">' + o.detail() + '</div>' : '');
}
function htmlHerosSimple() {
  return '<section class="heros">' +
    '<span class="kick">Lundi soir, après la facture tabac</span>' +
    '<div class="heros-ligne"><span class="gros">' + eur(ATT.total) + '</span><span class="ca-passe">' + ic('coche') + 'Ça passe</span></div>' +
    '<span class="sous">dont <b>' + eur(ATT.net) + '</b> vraiment à vous</span>' +
    htmlTrajectoire() + '</section>';
}
/* ---- accueil financier : le mois, la marge par rayon, de la marge au résultat */
const AUTRES_FRAIS = ['Énergie', 'Assurances', 'Honoraires', 'Banque et monétique', 'Logiciels et télécoms', 'Entretien et fournitures', 'Impôts et taxes', 'Démarque et écarts', 'Cotisations professionnelles', 'Publicité et divers'];
function htmlMargeRayons(cle, cleComp) {
  const p = pnlDe(cle).produits, p0 = cleComp ? pnlDe(cleComp).produits : null;
  const l = ACTIVITES.map((a) => ({ a, m: margeActivite(p, a), m0: p0 ? margeActivite(p0, a) : null })).sort((u, v) => v.m - u.m);
  const max = Math.max(...l.map((x) => x.m));
  const tot = l.reduce((s, x) => s + x.m, 0);
  return '<div class="rayons">' + l.map((x) => {
    const evo = x.m0 ? (x.m - x.m0) / x.m0 * 100 : null;
    return '<div class="ray-l"' + tip('<b>' + x.a.lib + '</b>' + ligneTip('var(--s1)', pnlDe(cle).lib, eur(x.m)) + (x.m0 != null ? ligneTip('', pnlDe(cleComp).lib, eur(x.m0)) : '') + ligneTip('', 'Part de la marge', pct(x.m / tot * 100, 0))) + '>' +
      '<span class="ray-lib">' + x.a.lib + '</span><span class="ray-piste"><i style="width:' + (x.m / max * 100).toFixed(1) + '%;background:var(--s1)"></i></span>' +
      '<span class="ray-v">' + eur(x.m) + '</span><span class="ray-d">' + (evo != null ? delta(evo) : '') + '</span></div>';
  }).join('') +
    '<div class="ray-l total"><span class="ray-lib">Marge brute</span><span class="ray-piste vide"></span><span class="ray-v">' + eur(tot) + '</span><span class="ray-d">' + (p0 ? delta((tot - margeTotale(p0)) / margeTotale(p0) * 100) : '') + '</span></div></div>';
}
function htmlCascade(cle) {
  const x = pnlDe(cle), ch = x.charges, mt = margeTotale(x.produits), res = mt - chargesTotales(ch);
  const somme = (keys) => keys.reduce((s, k) => s + (ch[k] || 0), 0);
  const nommes = [['Personnel', somme(['Personnel'])], ['Cotisations du gérant', somme(['Cotisations du gérant'])], ['Loyer et charges', somme(['Loyer et charges'])]];
  const amort = somme(['Amortissements', 'Charges financières']);
  const autres = chargesTotales(ch) - nommes.reduce((s, y) => s + y[1], 0) - amort;
  const lignes = nommes.concat([['Autres frais', autres, AUTRES_FRAIS.filter((k) => ch[k]).map((k) => ligneTip('', k, eur(-ch[k]))).join('')], ['Amortissements et intérêts', amort]]);
  const w = (v) => (Math.max(0, v) / mt * 100).toFixed(2) + '%';
  const ligne = (lib, debut, larg, cls, val, t) => '<div class="cas-l ' + cls + '"' + (t ? tip('<b>' + lib + '</b>' + t) : '') + '><span class="cas-lib">' + lib + '</span><span class="cas-piste"><i style="left:' + w(debut) + ';width:' + w(larg) + '"></i></span><span class="cas-v">' + val + '</span></div>';
  let cours = mt;
  let h = ligne('Marge brute', 0, mt, 'total', eur(mt));
  lignes.forEach(([lib, v, t]) => { cours -= v; h += ligne(lib, cours, v, 'charge', eur(-v), t); });
  h += ligne('Résultat<small>avant votre rémunération</small>', 0, res, 'resultat', eur(res));
  return '<div class="cascade">' + h + '</div>';
}
function vueCockpit() {
  const plan = calculPlan();
  const att = pnlDe('att'), sep = pnlDe(9);
  const margeAtt = margeTotale(att.produits), resAtt = resultatDe(att);
  const margeSep = margeTotale(sep.produits), resSep = resultatDe(sep);
  const surveiller = [
    ['caisse', 'ticket', 'att', 'Écart FDJ : ' + eur2(-4500), 'jeudi 8 octobre, 14 h 31 min 08 s'],
    ['factures', 'facture', 'att', 'Coca-Cola : +6,8 % chez Metro', 'prix de rayon à revoir'],
    ['rentabilite', 'resultat', 'att', 'Café : ' + D.ratios[8].tasses_kg + ' tasses par kilo', 'environ 138 attendues en septembre'],
  ];
  return '<div class="titre-section"><h2>Octobre, au Balto</h2><span>Atterrissage : réel jusqu’à ce soir, puis le reste du mois au rythme des quatre dernières semaines.</span></div>' +
    '<div class="kpis">' +
    '<section class="kpi fonce"><span class="lib">Résultat attendu en octobre</span><b>' + eur(resAtt) + '</b><span class="sous">' + delta((resAtt - resSep) / Math.abs(resSep) * 100) + '<span>sur septembre, avant votre rémunération</span></span></section>' +
    '<section class="kpi carte"><span class="lib">Marge brute d’octobre</span><b>' + eur(margeAtt) + '</b><span class="sous">' + delta((margeAtt - margeSep) / margeSep * 100) + '<span>sur septembre</span></span></section>' +
    '<section class="kpi carte"><span class="lib">Trésorerie lundi soir</span><b>' + eur(ATT.total) + '</b><span class="sous">' + (plan.niveau === 'ok' ? pastille('ok', 'Ça passe') : pastille('att', 'À anticiper')) + '<span>après la facture tabac</span></span></section>' +
    '</div>' +
    '<div class="g etire">' +
    '<div class="c6">' + carte('Marge par rayon', htmlMargeRayons('att', 9), { meta: 'Octobre, comparé à septembre', actions: lienPage('rentabilite', 'Rentabilité') }) + '</div>' +
    '<div class="c6">' + carte('De la marge au résultat', htmlCascade('att'), { meta: 'Octobre', actions: lienPage('rentabilite', 'Compte de résultat') }) + '</div></div>' +
    '<div class="g etire">' +
    '<div class="c6">' + carte('Cette semaine, 3 gestes', htmlTaches(false), { actions: lienPage('tresorerie', 'Trésorerie') }) + '</div>' +
    '<div class="c6">' + carte('À surveiller', '<div class="liste">' + surveiller.map((x) => '<div class="ligne cliquable" data-action="aller" data-route="' + x[0] + '"><span class="puce-ic ' + x[2] + '">' + ic(x[1]) + '</span><div class="l-txt"><b>' + x[3] + '</b><span>' + x[4] + '</span></div>' + ic('droite') + '</div>').join('') + '</div>') + '</div></div>';
}
function vueTresorerie() {
  const plan = calculPlan();
  return pageSimple({
    probleme: 'Chaque lundi, Logista prélève la facture tabac.',
    cockpit: 'Le cockpit vous dit dès ce soir si ça passe.',
    chiffres: [[eur(ATT.total), 'lundi soir, après Logista', 'ok'], [eur(3240000), 'à virer de la BNP avant jeudi'],
      plan.niveau === 'ok' ? ['6 mois', 'de ciel dégagé, jusqu’en avril', 'ok'] : [maj(SIM.mois[plan.kb]), 'premières turbulences', 'att']],
    visuelTitre: 'Votre semaine, soir après soir', visuelMeta: 'Réel jusqu’à ce soir, puis prévu', visuel: htmlSemaine(250, true, 1080),
    contenu: 'Comptes, plan de vol à six mois, mouvements bancaires, charges fixes.',
    detail: detailTresorerie,
  });
}
function vueCaisse() {
  const apres = D.annules.filter((a) => a.moment === 'Après encaissement').length;
  const lignes = EXPORT_FDJ.map((o) => '<tr class="' + (o.ok ? '' : 'alerte') + '"><td class="mono">' + o.h + '</td><td>' + o.jeu + '</td><td class="n">' + eur2(o.mt) + '</td><td>' + (o.ok ? pastille('ok', 'Oui') : pastille('ko', 'Absent')) + '</td></tr>').join('');
  return pageSimple({
    probleme: 'Un écart FDJ se cherchait ticket par ticket.',
    cockpit: 'Le cockpit le retrouve à la seconde.',
    chiffres: [[eur2(-4500), 'd’écart FDJ, jeudi 8 octobre', 'att'], ['14 h 31', 'l’heure exacte des tickets manquants'], [nb(apres), 'annulations après paiement']],
    visuelTitre: 'L’écart, opération par opération', visuelMeta: 'Export FDJ du jeudi 8 octobre',
    visuel: '<div class="defile"><table class="tableau"><thead><tr><th>Heure</th><th>Jeu</th><th class="n">Montant</th><th>En caisse</th></tr></thead><tbody>' + lignes + '</tbody></table></div>',
    contenu: 'Z du jour, ventes par rayon, contrôle FDJ semaine par semaine, tickets annulés, relevés FDJ et PMU.',
    detail: detailCaisse,
  });
}
function vueFactures() {
  const dern = D.factures.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1)).slice(0, 5);
  return pageSimple({
    probleme: 'Les factures arrivent de partout.',
    cockpit: 'Le cockpit les reçoit dans une seule boîte, les lit et les range.',
    chiffres: [[nb(D.factures.length), 'factures depuis juillet'], ['0', 'saisie à la main', 'ok'], ['+6,8 %', 'Coca-Cola chez Metro', 'att']],
    visuelTitre: 'Les dernières arrivées', visuelMeta: 'Touchez une facture pour la lire',
    visuel: '<div class="liste">' + dern.map((f) => '<div class="ligne cliquable" data-action="facture" data-id="' + f.id + '"><span class="puce-ic">' + ic('facture') + '</span><div class="l-txt"><b>' + esc(f.fournisseur) + '</b><span>' + esc(f.objet) + '</span></div>' +
      (f.alerte ? pastille('att', 'Hausse de prix') : f.statut === 'À payer' ? pastille('info', 'À payer') : pastille('ok', 'Payée')) + '<span class="l-mt">' + eur2(f.ttc) + '</span></div>').join('') + '</div>',
    contenu: 'Toutes les factures, chaque ligne lue et rangée, rapprochement avec la banque.',
    detail: detailFactures,
  });
}
function vueStock() {
  const reco = D.refs.filter((r) => r.statut === 'À recommander').sort((a, b) => b.tendance - a.tendance);
  const arret = D.refs.filter((r) => r.statut === 'À arrêter');
  return pageSimple({
    probleme: 'Le stock, on le découvre à l’inventaire.',
    cockpit: 'Le cockpit le compare chaque soir à Strator.',
    chiffres: [[eur(STOCK_ECART), 'd’écart, sous 0,5 %', 'ok'], [nb(reco.length), 'références vape à recommander'], [nb(arret.length), 'à arrêter : ' + (arret[0] ? arret[0].designation.split(',')[0] : ''), 'att']],
    visuelTitre: 'La commande de jeudi', visuelMeta: 'Ce qui part le plus vite',
    visuel: '<div class="liste">' + reco.slice(0, 4).map((r) => {
      const q = ETAT.commande[r.code] != null ? ETAT.commande[r.code] : quantiteCommande(r);
      return '<div class="ligne"><span class="puce-ic">' + ic('stock') + '</span><div class="l-txt"><b>' + esc(r.designation) + '</b><span>' + r.stock + ' en rayon · ventes <b class="positif">' + pctS(r.tendance, Math.abs(r.tendance) < 10 ? 1 : 0) + '</b></span></div><span class="l-mt empile">' + q + '<small>à commander</small></span></div>';
    }).join('') + '</div>',
    contenu: '148 références vape, CBD par lot, écarts par famille, commande complète.',
    detail: detailStock,
  });
}
function grapheMargeResultat() {
  const cles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'att'];
  const X = cles.map(pnlDe);
  const series = [
    { lib: 'Votre résultat', coul: 'var(--s1)', vals: X.map((x) => Math.max(0, resultatDe(x)) / 100) },
    { lib: 'Charges', coul: 'var(--charge)', vals: X.map((x) => Math.min(chargesTotales(x.charges), margeTotale(x.produits)) / 100) },
  ];
  return '<div class="legende"><span><i style="background:var(--s1)"></i>Votre résultat</span><span><i style="background:var(--charge)"></i>Charges</span><span class="discret">La hauteur de chaque colonne, c’est la marge brute du mois.</span></div>' +
    '<div class="graphe">' + svgEmpile({ id: 'mr', titre: 'Marge brute du mois, partagée entre les charges et votre résultat', w: LG(1040), h: 260, labels: cles.map((k) => (k === 'att' ? 'oct.*' : M[k - 1])), series, libTotal: 'Marge brute',
      pasLabels: etroit() ? 3 : 0, titresX: cles.map((k) => (k === 'att' ? 'Octobre, atterrissage' : maj(ML[k - 1]))), hachure: (i) => i === 9,
      etiquette: (i) => (etroit() ? '' : keur(series[0].vals[i])), etiquetteNiveau: (i) => series[0].vals[i], etiquetteClasse: 'dans' }) + '</div>' +
    '<p class="discret petit-txt">* Octobre : réel au 13, puis le reste du mois au rythme des quatre dernières semaines.' + (etroit() ? ' Touchez une colonne pour lire ses chiffres.' : ' Chiffre dans la partie bleue : votre résultat du mois.') + '</p>';
}
function vueRentabilite() {
  const att = pnlDe('att');
  const resOct = resultatDe(att);
  const cumul = D.pnl.slice(0, 9).reduce((s, p) => s + resultatDe(p), 0) + resOct;
  const cbdX = F0.format(D.pnl_att.produits.cbd_ventes / D.pnl[3].produits.cbd_ventes);
  return pageSimple({
    probleme: 'Le bilan arrive des mois plus tard.',
    cockpit: 'Le cockpit vous dit chaque mois ce que vous gagnez, rayon par rayon.',
    chiffres: [[eur(resOct), 'de résultat attendu en octobre', 'ok'], [eur(cumul), 'de résultat depuis janvier'], ['×' + cbdX, 'ventes de CBD depuis avril']],
    visuelTitre: 'Mois par mois', visuelMeta: 'De janvier à octobre 2026', visuel: grapheMargeResultat(),
    contenu: 'Marge de chaque rayon, compte de résultat mois par mois, ratios, facture électronique.',
    detail: detailRentabilite,
  });
}
function vueMise() {
  const etapes = [['Semaine 1', 'Le mandat, la boîte factures et les banques'], ['Semaine 2', 'La caisse et les jeux'], ['Semaine 3', 'Les factures et le stock'], ['Semaine 4', 'Le plan de vol et la première lecture']];
  return pageSimple({
    probleme: 'Pas le temps, et pas question de donner ses mots de passe.',
    cockpit: 'Le cockpit démarre en quatre semaines, sans aucun mot de passe.',
    chiffres: [['0', 'mot de passe à donner', 'ok'], ['4', 'semaines pour démarrer'], ['1', 'lecture par mois avec vous']],
    visuelTitre: 'Le démarrage', visuelMeta: 'Un tabac opérationnel en quatre semaines',
    visuel: '<ol class="quatre-etapes">' + etapes.map((e, i) => '<li><span class="num-e">' + (i + 1) + '</span><span class="etiquette">' + e[0] + '</span><b>' + e[1] + '</b></li>').join('') + '</ol>',
    contenu: 'Les quatre sources, le déploiement détaillé, la lecture mensuelle, le pilote réseau.',
    detail: detailMise,
  });
}

const VUES = { cockpit: vueCockpit, tresorerie: vueTresorerie, caisse: vueCaisse, factures: vueFactures, stock: vueStock, rentabilite: vueRentabilite, mise: vueMise, fdj: vueCaisse };
