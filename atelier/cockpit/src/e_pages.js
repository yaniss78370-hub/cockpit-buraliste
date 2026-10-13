/* ==================================================================
   Les pages du cockpit. Chaque page s'ouvre sur une réponse (un montant, une phrase),
   puis ce qui l'explique, puis le détail pour ceux qui le veulent.
   Caisse et FDJ sont deux pages : « à avoir en caisse depuis la collecte » et
   « atterrissage du prochain prélèvement FDJ », calculé à partir des rubriques de la caisse.
   ================================================================== */

/* ------------------------------------------------------------------ composants */
// dans les très grands chiffres, l'espace fine suffit entre les milliers
const fin = (s) => s.replace(/\u00a0(?=\d)/g, '\u202f');
function grosMontant(c, centimes = true) {
  if (!centimes) return esc(fin(eur(c)));
  const s = fin(eur2(c));
  const i = s.lastIndexOf(',');
  return s.slice(0, i) + '<small>' + s.slice(i) + '</small>';
}
function puce(cls, txt, icone) {
  return '<span class="puce ' + (cls || '') + '">' + (icone ? ic(icone) : '') + '<span>' + txt + '</span></span>';
}
function reponse(o) {
  const g = '<span class="rep-eyebrow">' + o.eyebrow + '</span>' +
    '<span class="rep-montant' + (o.ton ? ' ' + o.ton : '') + '">' + o.montant + '</span>' +
    (o.ligne ? '<p class="rep-ligne">' + o.ligne + '</p>' : '') +
    (o.puces && o.puces.length ? '<div class="puces">' + o.puces.filter(Boolean).join('') + '</div>' : '') +
    (o.corps || '');
  return '<section class="reponse' + (o.droite ? ' duo' : '') + (o.cls ? ' ' + o.cls : '') + '"' + (o.id ? ' id="' + o.id + '"' : '') + '>' +
    (o.droite ? '<div class="duo-g">' + g + '</div><div class="duo-d">' + o.droite + '</div>' : g) + '</section>';
}
function bloc(titre, corps, o = {}) {
  return '<section class="bloc' + (o.cls ? ' ' + o.cls : '') + '"' + (o.id ? ' id="' + o.id + '"' : '') + '>' +
    (titre ? '<div class="bloc-tete"><h2>' + titre + '</h2>' + (o.meta ? '<span class="bloc-meta">' + o.meta + '</span>' : '') +
      (o.actions ? '<div class="bloc-actions">' + o.actions + '</div>' : '') + '</div>' : '') +
    corps + '</section>';
}
function basculeDetail(contenu, detail) {
  const ouvert = !!ETAT.detail[ETAT.route];
  return '<div class="detail-bascule"><button class="bouton" type="button" data-action="detail" aria-expanded="' + ouvert + '">' + ic('droite') + '<span>' + (ouvert ? 'Masquer le détail' : 'Voir le détail') + '</span></button>' +
    (ouvert ? '' : '<span class="discret">' + contenu + '</span>') + '</div>' +
    (ouvert ? '<div class="detail" id="detail">' + detail() + '</div>' : '');
}
const pct2 = (x) => F2.format(x) + NB + '%';
const jourCourt = (iso) => maj(J[jour(iso).getDay()]) + ' ' + jour(iso).getDate();
const jourMoyen = (iso) => maj(dCourt(iso));

/* ------------------------------------------------------------------ « où va la marge » : une barre, six parts */
function partsMarge(cle) {
  const x = pnlDe(cle), ch = x.charges, mt = margeTotale(x.produits);
  const s = (keys) => keys.reduce((t, k) => t + (ch[k] || 0), 0);
  const perso = s(['Personnel']), gerant = s(['Cotisations du gérant']), loyer = s(['Loyer et charges']), amort = s(['Amortissements', 'Charges financières']);
  const autres = chargesTotales(ch) - perso - gerant - loyer - amort;
  return { mt, res: mt - chargesTotales(ch), parts: [
    { lib: 'Salaires et charges', v: perso, coul: 'var(--m1)' },
    { lib: 'Vos cotisations de gérant', v: gerant, coul: 'var(--m2)' },
    { lib: 'Loyer et charges locatives', v: loyer, coul: 'var(--m3)' },
    { lib: 'Autres frais', v: autres, coul: 'var(--m4)', detail: AUTRES_FRAIS.filter((k) => ch[k]).map((k) => ligneTip('', k, eur(ch[k]))).join('') },
    { lib: 'Amortissements et intérêts', v: amort, coul: 'var(--m5)' },
    { lib: 'Votre résultat', v: mt - chargesTotales(ch), coul: 'var(--ok-plein)', res: true },
  ] };
}
function htmlOuVaLaMarge(cle) {
  const m = partsMarge(cle);
  return '<div class="ou-va"><div class="ou-barre" role="img" aria-label="Partage de la marge brute">' +
    m.parts.map((p) => '<i style="flex-grow:' + Math.max(0, p.v) + ';background:' + p.coul + '"' + tip('<b>' + p.lib + '</b>' + ligneTip(p.coul, eur(p.v), pct(p.v / m.mt * 100, 0) + ' de la marge') + (p.detail || '')) + '></i>').join('') + '</div>' +
    '<div class="ou-liste">' + m.parts.map((p) => '<div class="ou-l' + (p.res ? ' res' : '') + '"><span class="ou-pt" style="background:' + p.coul + '"></span><span class="ou-lib">' + p.lib + '</span><span class="ou-pct">' + pct(p.v / m.mt * 100, 0) + '</span><span class="ou-v">' + eur(p.v) + '</span></div>').join('') + '</div></div>';
}

/* ================================================================== CAISSE : à avoir en caisse depuis la collecte */
const DEPUIS = D.caisse_depuis;
const PROCHAINE_COLLECTE = ajoute(DEPUIS.date, 7);
const netZ = (z) => z.especes - z.gains_fdj - z.gains_pmu;
const heureFr = (h) => h.replace(':', ' h ');
function joursDepuisCollecte() {
  const out = [];
  for (let k = ajoute(DEPUIS.date, 1); k <= AUJ; k = ajoute(k, 1)) {
    const z = ZJ[k];
    if (!z) continue;
    const g = z.gains_fdj + z.gains_pmu;
    out.push({ iso: k, esp: z.especes, gains: g, net: z.especes - g });
  }
  return out;
}
// la prochaine collecte : ce qui est en caisse ce soir, plus les jours restants au rythme des quatre mêmes jours précédents
function projectionCollecte() {
  const deja = joursDepuisCollecte().reduce((s, x) => s + x.net, 0);
  const jours = [];
  for (let k = ajoute(AUJ, 1); k <= PROCHAINE_COLLECTE; k = ajoute(k, 1)) {
    const l = [1, 2, 3, 4].map((w) => ZJ[ajoute(k, -7 * w)]).filter(Boolean);
    if (!l.length) continue;
    const moy = (f) => Math.round(l.reduce((t, z) => t + f(z), 0) / l.length);
    const esp = moy((z) => z.especes), gains = moy((z) => z.gains_fdj + z.gains_pmu);
    jours.push({ iso: k, esp, gains, net: esp - gains });
  }
  const reste = jours.reduce((t, x) => t + x.net, 0);
  return { deja, reste, total: deja + reste, jours };
}
const PROJ_COLLECTE = projectionCollecte();
(function gesteCollecte() {
  const t = TACHES.find((x) => x.id === 'especes');
  if (!t) return;
  t.lib = 'Compter et verser les espèces';
  t.mt = Math.round(PROJ_COLLECTE.total / 1000) * 1000;
  t.environ = true;
  t.quand = maj(dLong(PROCHAINE_COLLECTE)) + ', collecte de ' + heureFr(DEPUIS.heure);
  t.pourquoi = eur(PROJ_COLLECTE.deja) + ' en caisse ce soir, puis mercredi, jeudi et vendredi au rythme des quatre dernières semaines.';
})();
function resultatComptage(valeur, attendu) {
  const t = String(valeur || '').replace(/\s/g, '').replace(/ /g, '').replace('€', '').replace(',', '.');
  if (!t) return '';
  const v = Math.round(parseFloat(t) * 100);
  if (!isFinite(v)) return '<span class="compter-msg ko">' + ic('alerte') + 'Entrez un montant, par exemple 5 012,40</span>';
  const e = v - attendu;
  if (Math.abs(e) < 1) return '<span class="compter-msg ok">' + ic('coche') + '<b>Juste.</b> La caisse correspond au centime.</span>';
  if (e < 0) return '<span class="compter-msg ko">' + ic('alerte') + '<b>Il manque ' + eur2(-e) + '.</b> Recomptez, puis regardez les tickets annulés et les gains payés.</span>';
  return '<span class="compter-msg info">' + ic('info') + '<b>' + eur2(e) + ' de trop.</b> Souvent un gain de jeu payé mais non saisi en caisse.</span>';
}
function majComptage(valeur) {
  ETAT.compte = valeur;
  const el = $('#compte-res');
  if (el) el.innerHTML = resultatComptage(valeur, joursDepuisCollecte().reduce((s, x) => s + x.net, 0));
}
function vueCaisseV2() {
  const jours = joursDepuisCollecte();
  const total = jours.reduce((s, x) => s + x.net, 0);
  const C = D.collectes;
  const justes = C.filter((c) => !c.ecart).length;
  const cumul = C.reduce((s, c) => s + c.ecart, 0);
  const max = Math.max(...jours.map((x) => Math.abs(x.net)), 1);
  const lignes = jours.map((x) => '<tr><td class="lib"><b>' + maj(dLong(x.iso)) + '</b><span class="sec seul-etroit-bloc">' + eur2(x.esp) + ' encaissés · ' + eur2(x.gains) + ' de gains payés</span></td>' +
    '<td class="n cache-etroit">' + eur2(x.esp) + '</td><td class="n cache-etroit negatif">' + eur2(-x.gains) + '</td>' +
    '<td class="n"><b>' + eur2(x.net) + '</b><span class="barre-net"><i style="width:' + (Math.abs(x.net) / max * 100).toFixed(0) + '%"></i></span></td></tr>').join('');
  const P = PROJ_COLLECTE;
  const lignesPrevues = P.jours.map((x) => '<tr class="prevu"><td class="lib"><b>' + maj(dLong(x.iso)) + '</b><span class="sec">prévu, au rythme des quatre derniers ' + dLong(x.iso).split(' ')[0] + 's</span></td>' +
    '<td class="n cache-etroit">≈ ' + eur(x.esp) + '</td><td class="n cache-etroit negatif">≈ ' + eur(-x.gains) + '</td>' +
    '<td class="n">≈ ' + eur(x.net) + '<span class="barre-net prevu"><i style="width:' + Math.min(100, Math.abs(x.net) / max * 100).toFixed(0) + '%"></i></span></td></tr>').join('');
  const tableJours = '<div class="defile"><table class="tableau large"><thead><tr><th>Jour</th><th class="n cache-etroit">Encaissé en espèces</th><th class="n cache-etroit">Gains de jeux payés</th><th class="n">Reste en caisse</th></tr></thead><tbody>' + lignes +
    '<tr class="total"><td>Ce soir, depuis la collecte</td><td class="n cache-etroit">' + eur2(jours.reduce((s, x) => s + x.esp, 0)) + '</td><td class="n cache-etroit negatif">' + eur2(-jours.reduce((s, x) => s + x.gains, 0)) + '</td><td class="n">' + eur2(total) + '</td></tr>' +
    lignesPrevues +
    (P.jours.length ? '<tr class="total prevu-total"><td>À la collecte de ' + dLong(PROCHAINE_COLLECTE).split(' ')[0] + ', ' + heureFr(DEPUIS.heure) + '</td><td class="n cache-etroit"></td><td class="n cache-etroit"></td><td class="n">≈ ' + eur(Math.round(P.total / 1000) * 1000) + '</td></tr>' : '') +
    '</tbody></table></div>';
  const coll = C.slice().reverse().slice(0, 8).map((c) => '<tr' + (c.ecart ? ' class="signal"' : '') + '><td class="lib"><b>' + jourMoyen(c.date) + ', ' + heureFr(c.heure) + '</b><span class="sec cache-etroit">versée à la BNP</span><span class="sec seul-etroit-bloc">' + eur2(c.recupere) + ' comptés, versés à la BNP</span></td>' +
    '<td class="n cache-etroit">' + eur2(c.theorique) + '</td><td class="n cache-etroit">' + eur2(c.recupere) + '</td>' +
    '<td class="n">' + (c.ecart ? pastille(c.ecart < 0 ? 'att' : 'info', eur2(c.ecart, true)) : pastille('ok', 'Juste')) + '</td></tr>').join('');
  const tableColl = '<div class="defile"><table class="tableau large"><thead><tr><th>Collecte</th><th class="n cache-etroit">Théorique</th><th class="n cache-etroit">Compté</th><th class="n">Écart</th></tr></thead><tbody>' + coll + '</tbody></table></div>';
  const C14 = C.slice(-14);
  const maxColl = Math.ceil(Math.max(...C14.map((c) => c.recupere)) / 250000) * 2500;
  const grapheColl = '<div class="graphe">' + svgColonnes({ id: 'coll', titre: 'Espèces comptées à chaque collecte', w: LG(450), h: 190, vals: C14.map((c) => c.recupere / 100), labels: C14.map((c) => dNum(c.date).slice(0, 5)),
    max: maxColl, pasLabels: etroit() ? 4 : 3, largeur: etroit() ? 13 : 17, margeG: 46, couleurs: C14.map((c) => (c.ecart ? 'var(--att-plein)' : 'var(--m2)')),
    etiquette: (i) => (C14[i].ecart ? eur(C14[i].ecart, false, true) : ''), etiquetteClasse: () => 'att',
    tips: (i) => '<b>' + maj(dLong(C14[i].date)) + ', ' + heureFr(C14[i].heure) + '</b>' + ligneTip('', 'Compté', eur2(C14[i].recupere)) + ligneTip('', 'Écart', C14[i].ecart ? eur2(C14[i].ecart, true) : 'juste au centime') }) + '</div>' +
    '<div class="legende"><span><i style="background:var(--m2)"></i>Juste au centime</span><span><i style="background:var(--att-plein)"></i>Écart au comptage</span></div>';
  return '<div class="page">' +
    '<div class="g etire">' +
    '<div class="c7">' + reponse({
      eyebrow: 'À avoir en caisse', montant: grosMontant(total),
      ligne: 'Espèces encaissées depuis la collecte du <b>' + dLong(DEPUIS.date) + ' à ' + heureFr(DEPUIS.heure) + '</b>, gains de jeux payés au comptoir déduits.',
      puces: [puce('ok', 'Z de ce soir reçu à 21 h 00', 'coche'), puce('', jours.length + ' journées depuis la collecte'),
        puce('info', 'Collecte de ' + dLong(PROCHAINE_COLLECTE).split(' ')[0] + ' : ≈ ' + eur(Math.round(PROJ_COLLECTE.total / 1000) * 1000), 'calendrier')],
      corps: '<form class="compter" id="form-compte" novalidate><label for="compte-caisse">Vous avez compté la caisse ? Tapez le montant :</label>' +
        '<div class="compter-ligne"><input class="champ grand" id="compte-caisse" inputmode="decimal" autocomplete="off" placeholder="Montant compté" value="' + esc(ETAT.compte || '') + '"><span class="compter-eur">€</span></div>' +
        '<div class="compter-res" id="compte-res" aria-live="polite">' + resultatComptage(ETAT.compte, total) + '</div></form>',
    }) + '</div>' +
    '<div class="c5">' + bloc('Les collectes', '<div class="coll-resume"><div><b>' + C.length + '</b><span>collectes depuis le ' + dLong(C[0].date).replace(/^\S+ /, '') + '</span></div><div><b>' + justes + '</b><span>justes au centime</span></div><div><b class="' + (cumul ? 'att' : '') + '">' + eur2(cumul, true) + '</b><span>d’écart en tout</span></div></div>' +
      grapheColl, { meta: 'Chaque vendredi, ' + heureFr(DEPUIS.heure) }) + '</div></div>' +
    bloc('Jour par jour, d’une collecte à l’autre', tableJours, { meta: 'Espèces encaissées, moins les gains de jeux payés en liquide. Réel jusqu’à ce soir, puis prévu.' }) +
    bloc('Les dernières collectes', tableColl + '<p class="bloc-note">Après la fermeture, les espèces sont comptées, comparées au théorique de la caisse, puis versées à la banque.</p>', { meta: 'Théorique selon Strator, compté le soir même', actions: boutonsExport('collectes', ['xlsx', 'csv']) }) +
    basculeDetail('Le Z jour par jour, les ventes par rayon et par heure, les tickets annulés.', detailCaisseZ) + '</div>';
}
function detailCaisseZ() {
  const iso = ETAT.caisse.jour;
  const z = ZJ[iso];
  const idx = Z.findIndex((x) => x.date === iso);
  const marge = margeJour(z);
  const gains = z.gains_fdj + z.gains_pmu;
  const fam = D.ventes_fam.map((f) => ({ f, v: z.ventes[f] })).sort((a, b) => b.v - a.v);
  const margeFam = (f, v) => (f === 'fdj' && FDJ_JR[iso] ? Math.round(FDJ_JR[iso][0] * FDJ_TX.ji + FDJ_JR[iso][1] * FDJ_TX.loto) : f === 'tabac' ? Math.round(v * D.taux.tabac) : D.taux[f] != null ? Math.round(v * D.taux[f]) : Math.round(v / (1 + D.tva_vente[f]) * (1 - D.cout[f])));
  const rayon = fam.map((x) => '<tr><td><b>' + LIB_FAM[x.f] + '</b></td><td class="n">' + eur2(x.v) + '</td><td class="cache-etroit"><span class="barre-mini" style="width:' + (x.v / z.total * 160).toFixed(0) + 'px"></span> ' + pct(x.v / z.total * 100) + '</td><td class="n">' + eur2(margeFam(x.f, x.v)) + '</td></tr>').join('');
  const h = heuresDu(iso);
  const annules = D.annules.filter((a) => ETAT.caisse.annules === 'apres' ? a.moment === 'Après encaissement' : ETAT.caisse.annules === 'jour' ? a.date === iso : true);
  const annRows = annules.slice().reverse().slice(0, 60).map((a) => '<tr class="' + (a.moment === 'Après encaissement' ? 'alerte' : '') + '"><td class="num">' + dNum(a.date) + '</td><td class="mono">' + a.heure + '</td><td>Caisse ' + a.caisse + '</td><td>' + a.vendeur + '</td><td class="n">' + eur2(a.montant) + '</td><td>' + esc(a.motif) + '</td><td>' + (a.moment === 'Après encaissement' ? pastille('att', 'Après paiement') : pastille('', 'Avant paiement')) + '</td></tr>').join('');
  return '<div class="jour-nav"><button class="bouton petit" type="button" data-action="jour" data-pas="-1"' + (idx <= 0 ? ' disabled' : '') + ' aria-label="Jour précédent">' + ic('gauche') + '</button><b>' + maj(dLong(iso)) + '</b>' +
    '<button class="bouton petit" type="button" data-action="jour" data-pas="1"' + (idx >= Z.length - 1 ? ' disabled' : '') + ' aria-label="Jour suivant">' + ic('droite') + '</button>' + (iso !== AUJ ? '<button class="bouton petit fantome" type="button" data-action="jour" data-pas="0">Ce soir</button>' : '<span class="discret">Z de ce soir, 21 h 00</span>') + '</div>' +
    '<div class="tuiles">' +
    '<section class="carte tuile"><span class="lib">Encaissé</span><span class="val">' + eur(z.total) + '</span><span class="sous">dont jeux FDJ ' + eur(z.ventes.fdj) + '</span></section>' +
    '<section class="carte tuile"><span class="lib">Tickets</span><span class="val">' + nb(z.tickets) + '</span><span class="sous">Panier moyen ' + eur2(Math.round(z.total / z.tickets)) + '</span></section>' +
    '<section class="carte tuile"><span class="lib">Cartes et espèces</span><span class="val">' + pct(z.cb / z.total * 100, 0) + ' carte</span><span class="sous">' + eur(z.cb) + ' carte, ' + eur(z.especes) + ' espèces</span></section>' +
    '<section class="carte tuile"><span class="lib">Marge du jour</span><span class="val">' + eur(marge) + '</span><span class="sous">Gains payés au comptoir : ' + eur(gains) + '</span></section></div>' +
    '<div class="g etire">' +
    '<div class="c5">' + carte('Ventes par heure', '<div class="graphe">' + svgColonnes({ id: 'h', titre: 'Ventes par heure', w: LG(520), h: etroit() ? 200 : 290, vals: h.map((x) => x.montant / 100), labels: h.map((x) => x.h + ' h'), pasLabels: etroit() ? 3 : 2, largeur: etroit() ? 13 : 20,
      tips: (i) => '<b>De ' + h[i].h + ' h à ' + (h[i].h + 1) + ' h</b>' + ligneTip('', 'Ventes', eur(h[i].montant)) }) + '</div>', { meta: '6 h 30 à 20 h 30' }) + '</div>' +
    '<div class="c7">' + carte('Par rayon', '<div class="defile"><table class="tableau compact"><thead><tr><th>Rayon</th><th class="n">Ventes TTC</th><th class="cache-etroit">Part</th><th class="n">Marge estimée</th></tr></thead><tbody>' + rayon + '<tr class="total"><td>Total</td><td class="n">' + eur2(z.total) + '</td><td class="cache-etroit"></td><td class="n">' + eur2(marge) + '</td></tr></tbody></table></div>', { actions: boutonsExport('z') }) + '</div></div>' +
    carte('Tickets annulés', '<div class="defile"><table class="tableau compact"><thead><tr><th>Date</th><th>Heure</th><th>Caisse</th><th>Au comptoir</th><th class="n">Montant</th><th>Motif</th><th>Moment</th></tr></thead><tbody>' +
      (annRows || '<tr><td colspan="7" class="vide-etat">Aucune annulation ce jour-là.</td></tr>') + '</tbody></table></div>',
      { meta: D.annules.length + ' annulations depuis le 1er septembre, dont ' + D.annules.filter((a) => a.moment === 'Après encaissement').length + ' après paiement', actions: seg('annules', [['jour', 'Ce jour'], ['apres', 'Après paiement'], ['tous', 'Depuis le 1er sept.']], ETAT.caisse.annules) });
}

/* ================================================================== FDJ : atterrissage du prochain prélèvement */
const FDJ_TX = D.fdj.taux, FDJ_JR = D.fdj.jours;
function fdjRubriques(iso) { const x = FDJ_JR[iso]; return x ? { ji: x[2], loto: x[3], rj: x[4], rl: x[5] } : null; }
function fdjCalcul(liste) {
  const t = { ji: 0, loto: 0, rj: 0, rl: 0, n: 0 };
  liste.forEach((r) => { if (!r) return; t.n++; t.ji += r.ji; t.loto += r.loto; t.rj += r.rj; t.rl += r.rl; });
  t.ca = t.ji + t.loto; t.gains = t.rj + t.rl;
  t.comJi = t.ji * FDJ_TX.ji; t.comLoto = t.loto * FDJ_TX.loto; t.com = t.comJi + t.comLoto;
  t.total = t.ca - t.gains - t.com;
  return t;
}
function lundiDe(iso) { const d = jour(iso); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return isoDe(d); }
function fdjMoyenne(lundi, i) {
  const l = [];
  for (let s = 1; s <= 4; s++) l.push(fdjRubriques(ajoute(lundi, i - 7 * s)));
  const t = fdjCalcul(l), n = t.n || 1;
  return { ji: t.ji / n, loto: t.loto / n, rj: t.rj / n, rl: t.rl / n };
}
function fdjSemaineV2(lundi) {
  const jours = [0, 1, 2, 3, 4, 5, 6].map((i) => { const k = ajoute(lundi, i); const reel = k <= AUJ ? fdjRubriques(k) : null; return { iso: k, i, reel, proj: reel ? null : fdjMoyenne(lundi, i) }; });
  jours.forEach((j) => { j.net = fdjCalcul([j.reel || j.proj]).total; });
  const tReel = fdjCalcul(jours.map((j) => j.reel)), tProj = fdjCalcul(jours.map((j) => j.proj));
  const rel = D.releves.fdj.find((r) => r.du === lundi);
  return { lundi, jours, tReel, tProj, atterrissage: tReel.total + tProj.total, rel, prelev: rel ? rel.prelevement : ajoute(lundi, 9), complete: tProj.n === 0 };
}
const FDJ_PREMIERE = '2026-07-06';
function lignesCalculFdj(t, sem) {
  const r = (lib, v, cls = '') => '<div class="calc-l ' + cls + '"><span>' + lib + '</span><span class="v">' + eur2(Math.round(v)) + '</span></div>';
  let h = r('CA jeux (Strator)', t.ca, 'tete') + r('Jeux instantanés', t.ji, 'sous') + r('Loto, tirages et paris sportifs', t.loto, 'sous') +
    r('Gains payés au comptoir', -t.gains, 'tete') + r('Remboursement jeux', -t.rj, 'sous') + r('Remboursement loto', -t.rl, 'sous') +
    r('Votre commission (estimée)', -t.com, 'tete') + r('Jeux instantanés, ' + pct2(FDJ_TX.ji * 100), -t.comJi, 'sous') + r('Loto, ' + pct2(FDJ_TX.loto * 100), -t.comLoto, 'sous');
  if (sem && !sem.complete && !ETAT.fdj.jour) {
    h += r('Jours joués, à reverser', t.total, 'total') + r('Jours restants, estimés', sem.tProj.total, 'proj') + r('Atterrissage', sem.atterrissage, 'total fort');
  } else if (sem && sem.rel && !ETAT.fdj.jour) {
    h += r('Estimation à partir de la caisse', t.total, 'total') + r('Relevé FDJ (Profession Jeux)', sem.rel.solde, 'total fort') +
      '<div class="calc-l ecart"><span>Écart entre la caisse et le relevé</span><span class="v">' + eur2(Math.round(t.total - sem.rel.solde), true) + '</span></div>';
  } else {
    h += r(ETAT.fdj.jour ? 'À reverser pour ce jour' : 'Prélèvement estimé', t.total, 'total fort');
  }
  return '<div class="calc">' + h + '</div>';
}
// montant d'un jour, sur une pastille : sans centimes, sans « € » sur téléphone
const eurJour = (c) => (etroit() ? F0.format(Math.round(c / 100)) : eur(c));
function vueFdj() {
  const f = ETAT.fdj;
  if (!f.semaine) f.semaine = lundiDe(AUJ);
  const prochain = D.releves.fdj.find((r) => r.prelevement >= AUJ);
  const compte = D.comptes.fdj;
  const sem = fdjSemaineV2(f.semaine);
  const enCours = sem.lundi === lundiDe(AUJ);
  const choisi = f.jour && sem.jours.find((j) => j.iso === f.jour && j.reel);
  const tCalc = choisi ? fdjCalcul([choisi.reel]) : sem.tReel;

  // 1. mercredi : le prélèvement est connu, c'est le relevé FDJ
  const releve = prochain ? '<h3 class="h3">Le relevé FDJ de la semaine ' + prochain.semaine + '</h3><div class="calc compact">' +
    '<div class="calc-l"><span>Ventes de jeux</span><span class="v">' + eur2(prochain.ventes) + '</span></div>' +
    '<div class="calc-l"><span>Gains payés au comptoir</span><span class="v">' + eur2(-prochain.gains) + '</span></div>' +
    '<div class="calc-l"><span>Votre commission</span><span class="v">' + eur2(-prochain.commission) + '</span></div>' +
    '<div class="calc-l total fort"><span>Prélevé mercredi</span><span class="v">' + eur2(prochain.solde) + '</span></div></div>' : '';

  // 2. la semaine choisie : atterrissage tant qu'elle est ouverte, relevé une fois close
  let semTitre, semMontant, semLigne, semBarre = '';
  if (sem.rel && sem.complete) {
    semTitre = (sem.prelev < AUJ ? 'Prélevé le ' : 'Sera prélevé le ') + dLong(sem.prelev);
    semMontant = grosMontant(sem.rel.solde);
    semLigne = 'Relevé FDJ de la semaine ' + sem.rel.semaine + '. Estimé à partir de la caisse : <b>' + eur2(Math.round(sem.tReel.total)) + '</b>, soit un écart de ' + eur2(Math.round(sem.tReel.total - sem.rel.solde), true) + '.';
  } else {
    semTitre = 'Atterrissage du prélèvement du ' + dLong(sem.prelev);
    semMontant = '<span class="environ">≈</span>' + grosMontant(Math.round(sem.atterrissage / 100) * 100, false);
    semLigne = '<b>' + sem.tReel.n + ' jour' + (sem.tReel.n > 1 ? 's' : '') + ' joué' + (sem.tReel.n > 1 ? 's' : '') + ' sur 7.</b> Les jours qui restent sont estimés au rythme des quatre dernières semaines.';
    semBarre = '<div class="atter"><div class="atter-barre" role="img" aria-label="' + esc('Déjà joué ' + eur(sem.tReel.total) + ', reste estimé ' + eur(sem.tProj.total)) + '">' +
      '<i class="reel" style="flex-grow:' + Math.max(1, Math.round(sem.tReel.total)) + '"></i><i class="proj" style="flex-grow:' + Math.max(1, Math.round(sem.tProj.total)) + '"></i></div>' +
      '<div class="atter-leg"><span><i class="reel"></i>Déjà joué <b>' + eur(sem.tReel.total) + '</b></span><span><i class="proj"></i>Reste estimé <b>≈ ' + eur(sem.tProj.total) + '</b></span></div></div>';
  }
  const puces7 = '<div class="jours7" role="group" aria-label="Jours de la semaine">' + sem.jours.map((j) => {
    const cls = ['j7']; if (j.reel) cls.push('fait'); else cls.push('futur'); if (j.iso === AUJ) cls.push('auj'); if (f.jour === j.iso) cls.push('choisi');
    return '<button type="button" class="' + cls.join(' ') + '" data-action="fdj-jour" data-jour="' + j.iso + '"' + (j.reel ? '' : ' disabled') + ' aria-pressed="' + (f.jour === j.iso) + '"' +
      ' aria-label="' + esc(maj(dLong(j.iso)) + ' : ' + (j.reel ? '' : 'environ ') + eur(j.net)) + '">' +
      '<span class="j7-j">' + maj(J[jour(j.iso).getDay()]).replace('.', '') + '</span><b>' + jour(j.iso).getDate() + '</b><span class="j7-v">' + (j.reel ? '' : '≈') + eurJour(j.net) + '</span></button>';
  }).join('') + '</div>';
  const precedente = ajoute(sem.lundi, -7) >= FDJ_PREMIERE, suivante = ajoute(sem.lundi, 7) <= lundiDe(AUJ);

  // 3. la confiance : chaque semaine, l'estimation face au relevé
  const hist = D.releves.fdj.filter((r) => r.du >= FDJ_PREMIERE).slice(-9).map((r) => ({ r, s: fdjSemaineV2(r.du) }));
  const ecartFort = (x) => Math.abs(x.s.tReel.total - x.r.solde) > 4000;
  const lignesHist = hist.slice().reverse().map((x) => {
    const e = Math.round(x.s.tReel.total - x.r.solde);
    return '<tr class="' + (ecartFort(x) ? 'signal' : '') + (x.r.du === sem.lundi ? ' choisie' : '') + '" data-action="fdj-semaine" data-semaine="' + x.r.du + '" tabindex="0"><td class="lib"><b>Semaine ' + x.r.semaine + '</b><span class="sec">' + dNum(x.r.du).slice(0, 5) + ' au ' + dNum(x.r.au).slice(0, 5) + ' · prélevée le ' + dCourt(x.r.prelevement) + '</span></td>' +
      '<td class="n cache-etroit">' + eur2(Math.round(x.s.tReel.total)) + '</td><td class="n"><b>' + eur2(x.r.solde) + '</b></td>' +
      '<td class="n">' + (ecartFort(x) ? pastille('att', eur2(e, true)) : '<span class="ecart-petit">' + eur2(e, true) + '</span>') + '</td></tr>';
  }).join('');
  const h8 = hist.slice(-8);
  const moy = h8.reduce((s, x) => s + x.r.solde, 0) / h8.length;
  const ecartMoy = h8.reduce((s, x) => s + Math.abs(x.s.tReel.total - x.r.solde), 0) / h8.length;
  const atterEnCours = fdjSemaineV2(lundiDe(AUJ)).atterrissage;
  const grapheVals = hist.map((x) => x.r.solde / 100).concat([atterEnCours / 100]);
  const grapheLabels = hist.map((x) => 'S' + x.r.semaine).concat(['S' + (hist[hist.length - 1].r.semaine + 1)]);
  const nG = grapheVals.length;
  const graphe = '<div class="graphe">' + svgColonnes({ id: 'fdjh', titre: 'Prélèvements FDJ des dernières semaines', w: LG(450), h: etroit() ? 200 : 230, vals: grapheVals, labels: grapheLabels, largeur: etroit() ? 18 : 26, pasLabels: etroit() ? 2 : 0, margeG: 44,
    prevu: (i) => i === nG - 1, couleur: 'var(--s2)', etiquette: (i) => (i === nG - 1 ? '≈ ' + F1.format(grapheVals[i] / 1000) + NB + 'k€' : ''),
    tips: (i) => '<b>' + grapheLabels[i] + (i === nG - 1 ? ', semaine en cours' : '') + '</b>' + ligneTip('', i === nG - 1 ? 'Atterrissage' : 'Prélevé', eur(grapheVals[i] * 100)) }) + '</div>' +
    '<div class="legende"><span><i style="background:var(--s2)"></i>Prélevé</span><span><i style="background:repeating-linear-gradient(45deg,var(--s2) 0 2px,transparent 2px 5px);border:1px solid var(--s2)"></i>Atterrissage de la semaine en cours</span></div>';
  const s41 = hist.find(ecartFort);
  const explication = s41 ? '<div class="explication"><div class="encart att">' + ic('alerte') + '<div><b>Semaine ' + s41.r.semaine + ' : la caisse finit ' + eur2(Math.round(s41.r.solde - s41.s.tReel.total)) + ' sous le relevé.</b> ' +
    eur2(4500) + ' viennent du <b>jeudi 8 octobre à 14 h 31 min 08 s</b> : trois tickets à gratter passés au terminal FDJ, absents de la caisse. Le reste, c’est l’arrondi de la commission.</div></div>' +
    '<button class="lien-bouton" type="button" data-action="fdj-ops" aria-expanded="' + !!f.ops + '">' + (f.ops ? 'Masquer les opérations' : 'Voir les opérations de 14 h 25 à 14 h 40') + ' ' + ic('droite') + '</button>' +
    (f.ops ? '<div class="defile"><table class="tableau compact"><thead><tr><th>Heure</th><th>Jeu</th><th class="n">Montant</th><th>En caisse</th></tr></thead><tbody>' +
      EXPORT_FDJ.map((o) => '<tr class="' + (o.ok ? '' : 'alerte') + '"><td class="mono">' + o.h + '</td><td>' + o.jeu + '</td><td class="n">' + eur2(o.mt) + '</td><td>' + (o.ok ? pastille('ok', 'Oui') : pastille('ko', 'Absent')) + '</td></tr>').join('') + '</tbody></table></div><p class="bloc-note">Export détaillé obtenu avec la collaboration de la FDJ, opération par opération.</p>' : '') + '</div>' : '';

  return '<div class="page">' +
    reponse({
      eyebrow: 'Prochain prélèvement FDJ', montant: prochain ? grosMontant(prochain.solde) : '—',
      ligne: prochain ? '<b>' + maj(dLong(prochain.prelevement)) + '</b>. Relevé de la semaine du ' + jour(prochain.du).getDate() + ' au ' + dLong(prochain.au).replace(/^\S+ /, '') + ', reçu lundi.' : '',
      puces: prochain ? [puce('', 'Sur le compte FDJ : ' + eur(compte)), compte < prochain.solde ? puce('att', 'À virer avant mercredi : ' + eur(prochain.solde - compte), 'alerte') : puce('ok', 'Le compte couvre le prélèvement', 'coche')] : [],
      droite: releve,
    }) +
    bloc('Semaine de jeux', '<div class="sem-nav"><button class="bouton petit" type="button" data-action="fdj-sem" data-pas="-1"' + (precedente ? '' : ' disabled') + ' aria-label="Semaine précédente">' + ic('gauche') + '</button>' +
      '<div class="sem-titre"><b>Du ' + jour(sem.lundi).getDate() + ' au ' + dLong(ajoute(sem.lundi, 6)).replace(/^\S+ /, '') + '</b><span>' + (enCours ? 'semaine en cours' : 'semaine ' + (sem.rel ? sem.rel.semaine : '')) + '</span></div>' +
      '<button class="bouton petit" type="button" data-action="fdj-sem" data-pas="1"' + (suivante ? '' : ' disabled') + ' aria-label="Semaine suivante">' + ic('droite') + '</button></div>' +
      '<div class="sem-corps"><div class="sem-gauche"><span class="rep-eyebrow">' + semTitre + '</span><span class="rep-montant moyen">' + semMontant + '</span><p class="rep-ligne">' + semLigne + '</p>' + semBarre + puces7 +
      (f.jour ? '<button class="lien-bouton" type="button" data-action="fdj-jour" data-jour="">' + ic('retour') + 'Revenir à la semaine entière</button>' : '<p class="bloc-note">Touchez un jour pour voir ses rubriques Strator.</p>') + '</div>' +
      '<div class="sem-droite"><h3 class="h3">' + (choisi ? 'Rubriques Strator du ' + dLong(choisi.iso) : 'Le calcul, rubrique par rubrique') + '</h3>' + lignesCalculFdj(tCalc, choisi ? null : sem) + '</div></div>',
      { meta: 'Du lundi au dimanche, prélevée le mercredi suivant', id: 'fdj-semaine' }) +
    bloc('La caisse face aux relevés FDJ', '<div class="g"><div class="c5 pile">' + graphe + explication + '</div>' +
      '<div class="c7"><div class="defile"><table class="tableau large cliquables"><thead><tr><th>Semaine</th><th class="n cache-etroit">Estimé (caisse)</th><th class="n">Relevé FDJ</th><th class="n">Écart</th></tr></thead><tbody>' + lignesHist + '</tbody></table></div>' +
      '<p class="bloc-note">Taux de commission calibrés sur les relevés : ' + pct2(FDJ_TX.ji * 100) + ' des jeux instantanés, ' + pct2(FDJ_TX.loto * 100) + ' du Loto. En moyenne sur huit semaines : ' + eur(moy) + ' prélevés par semaine.</p></div></div>',
      { meta: 'L’estimation tombe en moyenne à ' + eur(ecartMoy) + ' du relevé', actions: boutonsExport('fdjSemaines', ['xlsx', 'csv']) }) +
    basculeDetail('Profession Jeux face à Strator jour par jour, relevés FDJ et PMU.', detailJeux) + '</div>';
}
function detailJeux() {
  const sem = ETAT.jeux.semaine;
  const fdj = fdjSemaine(sem);
  const totPJ = fdj.reduce((s, x) => s + x.pj, 0), totST = fdj.reduce((s, x) => s + x.st, 0);
  const fdjRows = fdj.map((x) => {
    let etat = pastille('ok', 'Juste');
    if (x.ecart) etat = x.iso === '2026-09-15' ? pastille('ok', 'Expliqué : ticket Loto saisi deux fois') : pastille('ko', 'Écart');
    return '<tr class="' + (x.ecart && x.iso !== '2026-09-15' ? 'alerte' : '') + '"><td><b>' + maj(dCourt(x.iso)) + '</b></td><td class="n">' + eur2(x.pj) + '</td><td class="n">' + eur2(x.st) + '</td><td class="n">' + (x.ecart ? eur2(x.ecart, true) : '—') + '</td><td>' + etat + '</td></tr>';
  }).join('');
  const jPrel = (iso) => J[jour(iso).getDay()] + ' ' + dNum(iso);
  const rel = D.releves.fdj.slice(-8).reverse().map((r) => '<tr><td class="nw"><b>S' + r.semaine + '</b><span class="sec">' + dNum(r.du) + ' au ' + dNum(r.au) + '</span></td><td class="n">' + eur2(r.ventes) + '</td><td class="n">' + eur2(r.gains) + '</td><td class="n positif">' + eur2(r.commission) + '</td><td class="n"><b>' + eur2(r.solde) + '</b><span class="sec">' + jPrel(r.prelevement) + '</span></td></tr>').join('');
  const relP = D.releves.pmu.slice(-8).reverse().map((r) => '<tr><td class="nw"><b>S' + r.semaine + '</b><span class="sec">' + dNum(r.du) + ' au ' + dNum(r.au) + '</span></td><td class="n">' + eur2(r.ventes) + '</td><td class="n">' + eur2(r.gains) + '</td><td class="n positif">' + eur2(r.commission) + '</td><td class="n"><b>' + eur2(r.solde) + '</b><span class="sec">' + jPrel(r.prelevement) + '</span></td></tr>').join('');
  return carte('Profession Jeux face à Strator, jour par jour', '<div class="defile"><table class="tableau"><thead><tr><th>Jour</th><th class="n">Profession Jeux</th><th class="n">Strator</th><th class="n">Écart</th><th>État</th></tr></thead><tbody>' + fdjRows +
      '<tr class="total"><td>Semaine</td><td class="n">' + eur2(totPJ) + '</td><td class="n">' + eur2(totST) + '</td><td class="n">' + (totST - totPJ ? eur2(totST - totPJ, true) : '—') + '</td><td></td></tr></tbody></table></div>',
      { meta: 'Les ventes de jeux selon la FDJ et selon la caisse', actions: seg('fdjsem', SEMAINES_FDJ.map((d) => [d, 'S' + D.releves.fdj.find((r) => r.du === d).semaine]), sem) + boutonsExport('controleFdj', ['xlsx']) }) +
    '<div class="g"><div class="c6">' + carte('Relevés FDJ', '<div class="defile"><table class="tableau compact"><thead><tr><th>Semaine</th><th class="n">Ventes</th><th class="n">Gains payés</th><th class="n">Commission</th><th class="n">Prélevé le</th></tr></thead><tbody>' + rel + '</tbody></table></div>', { meta: 'Prélèvement chaque mercredi', actions: boutonsExport('fdj') }) + '</div>' +
    '<div class="c6">' + carte('Relevés PMU', '<div class="defile"><table class="tableau compact"><thead><tr><th>Semaine</th><th class="n">Enjeux</th><th class="n">Gains payés</th><th class="n">Commission</th><th class="n">Prélevé le</th></tr></thead><tbody>' + relP + '</tbody></table></div>', { meta: 'Prélèvement chaque mardi', actions: boutonsExport('pmu') }) + '</div></div>';
}

/* ================================================================== ACCUEIL */
function vueAccueil() {
  const plan = calculPlan();
  const jours = joursDepuisCollecte();
  const especes = jours.reduce((s, x) => s + x.net, 0);
  const prochain = D.releves.fdj.find((r) => r.prelevement >= AUJ);
  const compte = D.comptes.fdj;
  const att = pnlDe('att'), sep = pnlDe(9);
  const mAtt = margeTotale(att.produits), rAtt = resultatDe(att), mSep = margeTotale(sep.produits), rSep = resultatDe(sep);
  const tuile = (route, icone, eyebrow, montant, ligne, p) => '<button type="button" class="tuile-rep" data-action="aller" data-route="' + route + '">' +
    '<span class="tr-tete">' + ic(icone) + '<span>' + eyebrow + '</span>' + ic('droite') + '</span><span class="tr-montant">' + montant + '</span><span class="tr-ligne">' + ligne + '</span>' + (p || '') + '</button>';
  const surveiller = [
    ['fdj', 'ticket', 'Écart FDJ : ' + eur2(-4500), 'jeudi 8 octobre, 14 h 31 min 08 s'],
    ['factures', 'facture', 'Coca-Cola : +6,8 % chez Metro', 'prix de rayon à revoir'],
    ['rentabilite', 'resultat', 'Café : ' + D.ratios[8].tasses_kg + ' tasses par kilo', 'environ 138 attendues en septembre'],
  ];
  return '<div class="page">' +
    '<div class="titre-section"><h2>Ce soir</h2><span>Ce que vous devez avoir, ce qui va partir, ce qui restera.</span></div>' +
    '<div class="tuiles-rep">' +
    tuile('caisse', 'billet', 'À avoir en caisse', grosMontant(especes), 'depuis la collecte de vendredi, 20 h 30', puce('', jours.length + ' journées')) +
    tuile('fdj', 'ticket', maj(dLong(prochain.prelevement).split(' ')[0]) + ', la FDJ prélève', grosMontant(prochain.solde), 'compte FDJ : ' + eur(compte), puce('att', 'À virer : ' + eur(prochain.solde - compte), 'alerte')) +
    tuile('tresorerie', 'banque', 'Lundi soir, après Logista', grosMontant(ATT.total, false), plan.niveau === 'ok' ? 'il restera 1,6 facture Logista d’avance' : maj(plan.ciel), puce(plan.niveau === 'ok' ? 'ok' : 'att', plan.niveau === 'ok' ? 'Ça passe' : 'À anticiper', plan.niveau === 'ok' ? 'coche' : 'alerte')) +
    '</div>' +
    '<div class="titre-section"><h2>Octobre, au Balto</h2><span>Réel jusqu’à ce soir, puis le reste du mois au rythme des quatre dernières semaines.</span></div>' +
    '<section class="bloc mois"><div class="mois-chiffres">' +
    '<div class="mc fort"><span>Résultat attendu</span><b>' + eur(rAtt) + '</b><em>' + delta((rAtt - rSep) / Math.abs(rSep) * 100) + ' sur septembre, avant votre rémunération</em></div>' +
    '<div class="mc"><span>Marge brute</span><b>' + eur(mAtt) + '</b><em>' + delta((mAtt - mSep) / mSep * 100) + ' sur septembre</em></div></div>' +
    '<div class="mois-visuels"><div><h3 class="h3">Où va la marge</h3>' + htmlOuVaLaMarge('att') + '</div>' +
    '<div><h3 class="h3">Ce que rapporte chaque rayon</h3>' + htmlMargeRayons('att', 9) + '</div></div>' +
    '<div class="mois-pied">' + lienPage('rentabilite', 'Le résultat mois par mois') + '</div></section>' +
    '<div class="g etire">' +
    '<div class="c6">' + bloc('Cette semaine, 3 gestes', htmlTaches(false), { actions: lienPage('tresorerie', 'Trésorerie') }) + '</div>' +
    '<div class="c6">' + bloc('À surveiller', '<div class="liste">' + surveiller.map((x) => '<div class="ligne cliquable" data-action="aller" data-route="' + x[0] + '"><span class="puce-ic att">' + ic(x[1]) + '</span><div class="l-txt"><b>' + x[2] + '</b><span>' + x[3] + '</span></div>' + ic('droite') + '</div>').join('') + '</div>') + '</div></div></div>';
}

/* ================================================================== TRÉSORERIE, RÉSULTAT, FACTURES, STOCK, MISE EN PLACE */
function vueTresorerieV2() {
  const plan = calculPlan();
  const avance = plan.bas / SIM.seuil;
  return '<div class="page">' +
    '<div class="g etire"><div class="c7">' + reponse({
      eyebrow: 'Lundi soir, après la facture Logista', montant: grosMontant(ATT.total, false),
      ligne: plan.niveau === 'ok' ? 'Ça passe. Au plus bas des six prochains mois, il restera <b>' + F1.format(avance) + ' facture Logista d’avance</b>.' : 'Attention : ' + plan.ciel.toLowerCase() + '. Il manque ' + eur(plan.manque * 100) + ' au point bas.',
      puces: [puce('att', eur(3240000) + ' à virer de la BNP avant jeudi', 'alerte'), puce(plan.niveau === 'ok' ? 'ok' : 'att', plan.ciel, plan.niveau === 'ok' ? 'soleil' : 'nuage')],
    }) + '</div><div class="c5">' + bloc('Le ciel à six mois', '<div class="jauge-carte">' + svgJauge(avance) + '<span class="jv">' + F1.format(avance) + '</span><span class="jl">facture Logista d’avance au point bas, ' + SIM.quand[plan.kb] + '</span></div>', { actions: lienPage('tresorerie', 'Plan de vol', ' data-onglet="plan"') }) + '</div></div>' +
    bloc('Votre semaine, soir après soir', htmlSemaine(250, true, 1080) + htmlEquationSemaine(), { meta: 'Réel jusqu’à ce soir, puis prévu' }) +
    basculeDetail('Comptes, plan de vol à six mois, 14 semaines, mouvements bancaires, charges fixes.', detailTresorerie) + '</div>';
}
function vueResultatV2() {
  const att = pnlDe('att'), sep = pnlDe(9);
  const rAtt = resultatDe(att), rSep = resultatDe(sep);
  const cumul = D.pnl.slice(0, 9).reduce((s, p) => s + resultatDe(p), 0) + rAtt;
  const cbdX = F0.format(D.pnl_att.produits.cbd_ventes / D.pnl[3].produits.cbd_ventes);
  return '<div class="page">' +
    '<div class="g etire"><div class="c7">' + reponse({
      eyebrow: 'Résultat attendu en octobre', montant: grosMontant(rAtt, false), ton: 'ok',
      ligne: 'Avant votre rémunération et avant impôt. <b>' + eur(cumul) + '</b> depuis janvier.',
      puces: [puce('ok', pctS((rAtt - rSep) / Math.abs(rSep) * 100) + ' sur septembre'), puce('info', 'CBD : ventes ×' + cbdX + ' depuis avril')],
    }) + '</div><div class="c5">' + bloc('Où va la marge d’octobre', htmlOuVaLaMarge('att')) + '</div></div>' +
    bloc('Mois par mois', grapheMargeResultat(), { meta: 'De janvier à octobre 2026' }) +
    bloc('Ce que rapporte chaque rayon', htmlMargeRayons('att', 9), { meta: 'Octobre, comparé à septembre' }) +
    basculeDetail('Marge de chaque rayon, compte de résultat mois par mois, ratios, facture électronique.', detailRentabilite) + '</div>';
}
function vueFacturesV2() {
  const aPayer = D.factures.filter((x) => x.statut === 'À payer');
  const lignes = D.factures.reduce((s, x) => s + x.lignes.length, 0);
  const dern = D.factures.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1)).slice(0, 6);
  return '<div class="page">' + reponse({
      eyebrow: 'Factures lues depuis juillet', montant: nb(D.factures.length),
      ligne: nb(lignes) + ' lignes rangées par famille, <b>sans aucune saisie</b>. ' + aPayer.length + ' factures à payer : ' + eur(aPayer.reduce((s, x) => s + x.ttc, 0)) + '.',
      puces: [puce('att', 'Coca-Cola +6,8 % chez Metro', 'alerte'), puce('ok', '100 % rapprochées de la banque', 'coche')],
    }) +
    bloc('Les dernières arrivées', '<div class="liste">' + dern.map((f) => '<div class="ligne cliquable" data-action="facture" data-id="' + f.id + '"><span class="puce-ic">' + ic('facture') + '</span><div class="l-txt"><b>' + esc(f.fournisseur) + '</b><span>' + esc(f.objet) + ' · ' + dCourt(f.date) + '</span></div>' +
      (f.alerte ? pastille('att', 'Hausse de prix') : f.statut === 'À payer' ? pastille('info', 'À payer le ' + dNum(f.echeance)) : pastille('ok', 'Payée')) + '<span class="l-mt">' + eur2(f.ttc) + '</span></div>').join('') + '</div>', { meta: 'Touchez une facture pour la lire, ligne par ligne' }) +
    basculeDetail('Toutes les factures, chaque ligne lue et rangée, rapprochement avec la banque.', detailFactures) + '</div>';
}
function vueStockV2() {
  const reco = D.refs.filter((r) => r.statut === 'À recommander').sort((a, b) => b.tendance - a.tendance);
  const arret = D.refs.filter((r) => r.statut === 'À arrêter');
  return '<div class="page">' + reponse({
      eyebrow: 'Écart avec Strator, ce soir', montant: grosMontant(STOCK_ECART, false), ton: 'ok',
      ligne: 'Sur ' + eur(D.stock_tot.theo) + ' de stock au prix d’achat, soit ' + pct(STOCK_ECART / D.stock_tot.theo * 100) + ' : <b>sous la tolérance de 2 %</b>.',
      puces: [puce('info', reco.length + ' références vape à recommander'), arret[0] ? puce('att', arret[0].designation.split(',')[0] + ' : à arrêter', 'alerte') : ''],
    }) +
    bloc('La commande de jeudi', '<div class="liste">' + reco.slice(0, 5).map((r) => {
      const q = ETAT.commande[r.code] != null ? ETAT.commande[r.code] : quantiteCommande(r);
      return '<div class="ligne"><span class="puce-ic">' + ic('stock') + '</span><div class="l-txt"><b>' + esc(r.designation) + '</b><span>' + r.stock + ' en rayon · ventes <b class="positif">' + pctS(r.tendance, Math.abs(r.tendance) < 10 ? 1 : 0) + '</b> sur 4 semaines</span></div><span class="l-mt empile">' + q + '<small>à commander</small></span></div>';
    }).join('') + '</div>', { meta: 'Ce qui part le plus vite, pour trois semaines de ventes' }) +
    basculeDetail('148 références vape, CBD par lot, écarts par famille, commande complète.', detailStock) + '</div>';
}
function vueMiseV2() {
  const etapes = [['Semaine 1', 'Le mandat, la boîte factures et les banques'], ['Semaine 2', 'La caisse et les jeux'], ['Semaine 3', 'Les factures et le stock'], ['Semaine 4', 'Le plan de vol et la première lecture']];
  return '<div class="page">' + reponse({
      eyebrow: 'Votre cockpit, opérationnel en', montant: '4 semaines',
      ligne: '<b>Sans aucun mot de passe.</b> Le cockpit reçoit ce que vous et vos partenaires lui envoyez, et lit vos banques en lecture seule. Chaque accès se coupe en un clic.',
      puces: [puce('ok', '0 mot de passe à donner', 'cadenas'), puce('', '1 lecture par mois avec vous', 'calendrier')],
    }) +
    bloc('Le démarrage', '<ol class="quatre-etapes">' + etapes.map((e, i) => '<li><span class="num-e">' + (i + 1) + '</span><span class="etiquette">' + e[0] + '</span><b>' + e[1] + '</b></li>').join('') + '</ol>', { meta: 'Un tabac opérationnel en quatre semaines' }) +
    basculeDetail('Les quatre sources, le déploiement détaillé, la lecture mensuelle, le pilote réseau.', detailMise) + '</div>';
}

Object.assign(VUES, { cockpit: vueAccueil, caisse: vueCaisseV2, fdj: vueFdj, tresorerie: vueTresorerieV2, rentabilite: vueResultatV2, factures: vueFacturesV2, stock: vueStockV2, mise: vueMiseV2 });
