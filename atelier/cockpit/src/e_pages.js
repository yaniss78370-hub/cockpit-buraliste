/* ==================================================================
   Les pages du cockpit, troisième génération.
   Chaque page s'ouvre sur sa réponse (une carte de nuit, un montant), puis ce qui l'explique
   (des cartes « papier »), puis le détail pour qui le veut.
   ================================================================== */

// le code QR de l'étiquette CBD (le même que sur le site)
const QR_CBD = '<svg class="qr" viewBox="0 0 130 130" aria-hidden="true"><g fill="#0e1726"><rect x="41.6" y="0.0" width="5.2" height="5.2"/><rect x="52.0" y="0.0" width="5.2" height="5.2"/><rect x="62.4" y="0.0" width="5.2" height="5.2"/><rect x="67.6" y="0.0" width="5.2" height="5.2"/><rect x="72.8" y="0.0" width="5.2" height="5.2"/><rect x="67.6" y="5.2" width="5.2" height="5.2"/><rect x="83.2" y="5.2" width="5.2" height="5.2"/><rect x="41.6" y="10.4" width="5.2" height="5.2"/><rect x="72.8" y="10.4" width="5.2" height="5.2"/><rect x="78.0" y="10.4" width="5.2" height="5.2"/><rect x="83.2" y="10.4" width="5.2" height="5.2"/><rect x="57.2" y="15.6" width="5.2" height="5.2"/><rect x="67.6" y="15.6" width="5.2" height="5.2"/><rect x="72.8" y="15.6" width="5.2" height="5.2"/><rect x="78.0" y="15.6" width="5.2" height="5.2"/><rect x="41.6" y="20.8" width="5.2" height="5.2"/><rect x="62.4" y="20.8" width="5.2" height="5.2"/><rect x="83.2" y="20.8" width="5.2" height="5.2"/><rect x="57.2" y="26.0" width="5.2" height="5.2"/><rect x="67.6" y="26.0" width="5.2" height="5.2"/><rect x="72.8" y="26.0" width="5.2" height="5.2"/><rect x="83.2" y="26.0" width="5.2" height="5.2"/><rect x="41.6" y="31.2" width="5.2" height="5.2"/><rect x="46.8" y="31.2" width="5.2" height="5.2"/><rect x="67.6" y="31.2" width="5.2" height="5.2"/><rect x="62.4" y="36.4" width="5.2" height="5.2"/><rect x="67.6" y="36.4" width="5.2" height="5.2"/><rect x="78.0" y="36.4" width="5.2" height="5.2"/><rect x="5.2" y="41.6" width="5.2" height="5.2"/><rect x="15.6" y="41.6" width="5.2" height="5.2"/><rect x="20.8" y="41.6" width="5.2" height="5.2"/><rect x="26.0" y="41.6" width="5.2" height="5.2"/><rect x="31.2" y="41.6" width="5.2" height="5.2"/><rect x="36.4" y="41.6" width="5.2" height="5.2"/><rect x="41.6" y="41.6" width="5.2" height="5.2"/><rect x="46.8" y="41.6" width="5.2" height="5.2"/><rect x="57.2" y="41.6" width="5.2" height="5.2"/><rect x="67.6" y="41.6" width="5.2" height="5.2"/><rect x="72.8" y="41.6" width="5.2" height="5.2"/><rect x="83.2" y="41.6" width="5.2" height="5.2"/><rect x="88.4" y="41.6" width="5.2" height="5.2"/><rect x="98.8" y="41.6" width="5.2" height="5.2"/><rect x="104.0" y="41.6" width="5.2" height="5.2"/><rect x="109.2" y="41.6" width="5.2" height="5.2"/><rect x="119.6" y="41.6" width="5.2" height="5.2"/><rect x="124.8" y="41.6" width="5.2" height="5.2"/><rect x="52.0" y="46.8" width="5.2" height="5.2"/><rect x="57.2" y="46.8" width="5.2" height="5.2"/><rect x="62.4" y="46.8" width="5.2" height="5.2"/><rect x="67.6" y="46.8" width="5.2" height="5.2"/><rect x="72.8" y="46.8" width="5.2" height="5.2"/><rect x="88.4" y="46.8" width="5.2" height="5.2"/><rect x="93.6" y="46.8" width="5.2" height="5.2"/><rect x="104.0" y="46.8" width="5.2" height="5.2"/><rect x="119.6" y="46.8" width="5.2" height="5.2"/><rect x="20.8" y="52.0" width="5.2" height="5.2"/><rect x="26.0" y="52.0" width="5.2" height="5.2"/><rect x="41.6" y="52.0" width="5.2" height="5.2"/><rect x="46.8" y="52.0" width="5.2" height="5.2"/><rect x="52.0" y="52.0" width="5.2" height="5.2"/><rect x="67.6" y="52.0" width="5.2" height="5.2"/><rect x="72.8" y="52.0" width="5.2" height="5.2"/><rect x="83.2" y="52.0" width="5.2" height="5.2"/><rect x="88.4" y="52.0" width="5.2" height="5.2"/><rect x="93.6" y="52.0" width="5.2" height="5.2"/><rect x="98.8" y="52.0" width="5.2" height="5.2"/><rect x="109.2" y="52.0" width="5.2" height="5.2"/><rect x="114.4" y="52.0" width="5.2" height="5.2"/><rect x="124.8" y="52.0" width="5.2" height="5.2"/><rect x="5.2" y="57.2" width="5.2" height="5.2"/><rect x="36.4" y="57.2" width="5.2" height="5.2"/><rect x="41.6" y="57.2" width="5.2" height="5.2"/><rect x="46.8" y="57.2" width="5.2" height="5.2"/><rect x="52.0" y="57.2" width="5.2" height="5.2"/><rect x="78.0" y="57.2" width="5.2" height="5.2"/><rect x="83.2" y="57.2" width="5.2" height="5.2"/><rect x="88.4" y="57.2" width="5.2" height="5.2"/><rect x="114.4" y="57.2" width="5.2" height="5.2"/><rect x="119.6" y="57.2" width="5.2" height="5.2"/><rect x="0.0" y="62.4" width="5.2" height="5.2"/><rect x="10.4" y="62.4" width="5.2" height="5.2"/><rect x="31.2" y="62.4" width="5.2" height="5.2"/><rect x="52.0" y="62.4" width="5.2" height="5.2"/><rect x="78.0" y="62.4" width="5.2" height="5.2"/><rect x="88.4" y="62.4" width="5.2" height="5.2"/><rect x="0.0" y="67.6" width="5.2" height="5.2"/><rect x="10.4" y="67.6" width="5.2" height="5.2"/><rect x="26.0" y="67.6" width="5.2" height="5.2"/><rect x="36.4" y="67.6" width="5.2" height="5.2"/><rect x="41.6" y="67.6" width="5.2" height="5.2"/><rect x="46.8" y="67.6" width="5.2" height="5.2"/><rect x="52.0" y="67.6" width="5.2" height="5.2"/><rect x="62.4" y="67.6" width="5.2" height="5.2"/><rect x="78.0" y="67.6" width="5.2" height="5.2"/><rect x="93.6" y="67.6" width="5.2" height="5.2"/><rect x="98.8" y="67.6" width="5.2" height="5.2"/><rect x="104.0" y="67.6" width="5.2" height="5.2"/><rect x="124.8" y="67.6" width="5.2" height="5.2"/><rect x="0.0" y="72.8" width="5.2" height="5.2"/><rect x="10.4" y="72.8" width="5.2" height="5.2"/><rect x="15.6" y="72.8" width="5.2" height="5.2"/><rect x="41.6" y="72.8" width="5.2" height="5.2"/><rect x="62.4" y="72.8" width="5.2" height="5.2"/><rect x="72.8" y="72.8" width="5.2" height="5.2"/><rect x="78.0" y="72.8" width="5.2" height="5.2"/><rect x="93.6" y="72.8" width="5.2" height="5.2"/><rect x="98.8" y="72.8" width="5.2" height="5.2"/><rect x="104.0" y="72.8" width="5.2" height="5.2"/><rect x="114.4" y="72.8" width="5.2" height="5.2"/><rect x="10.4" y="78.0" width="5.2" height="5.2"/><rect x="15.6" y="78.0" width="5.2" height="5.2"/><rect x="31.2" y="78.0" width="5.2" height="5.2"/><rect x="36.4" y="78.0" width="5.2" height="5.2"/><rect x="52.0" y="78.0" width="5.2" height="5.2"/><rect x="57.2" y="78.0" width="5.2" height="5.2"/><rect x="62.4" y="78.0" width="5.2" height="5.2"/><rect x="78.0" y="78.0" width="5.2" height="5.2"/><rect x="83.2" y="78.0" width="5.2" height="5.2"/><rect x="93.6" y="78.0" width="5.2" height="5.2"/><rect x="98.8" y="78.0" width="5.2" height="5.2"/><rect x="119.6" y="78.0" width="5.2" height="5.2"/><rect x="5.2" y="83.2" width="5.2" height="5.2"/><rect x="10.4" y="83.2" width="5.2" height="5.2"/><rect x="15.6" y="83.2" width="5.2" height="5.2"/><rect x="20.8" y="83.2" width="5.2" height="5.2"/><rect x="26.0" y="83.2" width="5.2" height="5.2"/><rect x="36.4" y="83.2" width="5.2" height="5.2"/><rect x="57.2" y="83.2" width="5.2" height="5.2"/><rect x="62.4" y="83.2" width="5.2" height="5.2"/><rect x="67.6" y="83.2" width="5.2" height="5.2"/><rect x="72.8" y="83.2" width="5.2" height="5.2"/><rect x="78.0" y="83.2" width="5.2" height="5.2"/><rect x="83.2" y="83.2" width="5.2" height="5.2"/><rect x="93.6" y="83.2" width="5.2" height="5.2"/><rect x="109.2" y="83.2" width="5.2" height="5.2"/><rect x="114.4" y="83.2" width="5.2" height="5.2"/><rect x="124.8" y="83.2" width="5.2" height="5.2"/><rect x="41.6" y="88.4" width="5.2" height="5.2"/><rect x="52.0" y="88.4" width="5.2" height="5.2"/><rect x="62.4" y="88.4" width="5.2" height="5.2"/><rect x="72.8" y="88.4" width="5.2" height="5.2"/><rect x="83.2" y="88.4" width="5.2" height="5.2"/><rect x="93.6" y="88.4" width="5.2" height="5.2"/><rect x="98.8" y="88.4" width="5.2" height="5.2"/><rect x="104.0" y="88.4" width="5.2" height="5.2"/><rect x="114.4" y="88.4" width="5.2" height="5.2"/><rect x="124.8" y="88.4" width="5.2" height="5.2"/><rect x="52.0" y="93.6" width="5.2" height="5.2"/><rect x="57.2" y="93.6" width="5.2" height="5.2"/><rect x="78.0" y="93.6" width="5.2" height="5.2"/><rect x="83.2" y="93.6" width="5.2" height="5.2"/><rect x="98.8" y="93.6" width="5.2" height="5.2"/><rect x="114.4" y="93.6" width="5.2" height="5.2"/><rect x="119.6" y="93.6" width="5.2" height="5.2"/><rect x="41.6" y="98.8" width="5.2" height="5.2"/><rect x="52.0" y="98.8" width="5.2" height="5.2"/><rect x="57.2" y="98.8" width="5.2" height="5.2"/><rect x="72.8" y="98.8" width="5.2" height="5.2"/><rect x="78.0" y="98.8" width="5.2" height="5.2"/><rect x="83.2" y="98.8" width="5.2" height="5.2"/><rect x="124.8" y="98.8" width="5.2" height="5.2"/><rect x="46.8" y="104.0" width="5.2" height="5.2"/><rect x="52.0" y="104.0" width="5.2" height="5.2"/><rect x="78.0" y="104.0" width="5.2" height="5.2"/><rect x="93.6" y="104.0" width="5.2" height="5.2"/><rect x="98.8" y="104.0" width="5.2" height="5.2"/><rect x="114.4" y="104.0" width="5.2" height="5.2"/><rect x="119.6" y="104.0" width="5.2" height="5.2"/><rect x="52.0" y="109.2" width="5.2" height="5.2"/><rect x="57.2" y="109.2" width="5.2" height="5.2"/><rect x="62.4" y="109.2" width="5.2" height="5.2"/><rect x="67.6" y="109.2" width="5.2" height="5.2"/><rect x="78.0" y="109.2" width="5.2" height="5.2"/><rect x="93.6" y="109.2" width="5.2" height="5.2"/><rect x="109.2" y="109.2" width="5.2" height="5.2"/><rect x="119.6" y="109.2" width="5.2" height="5.2"/><rect x="62.4" y="114.4" width="5.2" height="5.2"/><rect x="67.6" y="114.4" width="5.2" height="5.2"/><rect x="72.8" y="114.4" width="5.2" height="5.2"/><rect x="93.6" y="114.4" width="5.2" height="5.2"/><rect x="98.8" y="114.4" width="5.2" height="5.2"/><rect x="124.8" y="114.4" width="5.2" height="5.2"/><rect x="52.0" y="119.6" width="5.2" height="5.2"/><rect x="57.2" y="119.6" width="5.2" height="5.2"/><rect x="67.6" y="119.6" width="5.2" height="5.2"/><rect x="78.0" y="119.6" width="5.2" height="5.2"/><rect x="88.4" y="119.6" width="5.2" height="5.2"/><rect x="98.8" y="119.6" width="5.2" height="5.2"/><rect x="104.0" y="119.6" width="5.2" height="5.2"/><rect x="114.4" y="119.6" width="5.2" height="5.2"/><rect x="119.6" y="119.6" width="5.2" height="5.2"/><rect x="67.6" y="124.8" width="5.2" height="5.2"/><rect x="72.8" y="124.8" width="5.2" height="5.2"/><rect x="93.6" y="124.8" width="5.2" height="5.2"/><rect x="98.8" y="124.8" width="5.2" height="5.2"/><rect x="104.0" y="124.8" width="5.2" height="5.2"/><rect x="114.4" y="124.8" width="5.2" height="5.2"/><rect x="119.6" y="124.8" width="5.2" height="5.2"/><rect x="0.0" y="0.0" width="36.4" height="36.4"/><rect x="5.2" y="5.2" width="26.0" height="26.0" fill="#fff"/><rect x="10.4" y="10.4" width="15.6" height="15.6"/><rect x="93.6" y="0.0" width="36.4" height="36.4"/><rect x="98.8" y="5.2" width="26.0" height="26.0" fill="#fff"/><rect x="104.0" y="10.4" width="15.6" height="15.6"/><rect x="0.0" y="93.6" width="36.4" height="36.4"/><rect x="5.2" y="98.8" width="26.0" height="26.0" fill="#fff"/><rect x="10.4" y="104.0" width="15.6" height="15.6"/></g></svg>';

/* ------------------------------------------------------------------ composants de page */
const SURTITRE = 'Mar. 13 oct. <i></i> <b>' + HEURE + '</b>';
function pageTete(o) {
  return '<header class="page-tete anime"><div class="pt-txt"><span class="surtitre">' + (o.surtitre || SURTITRE) + '</span><h1>' + o.titre + '</h1>' + (o.sous ? '<p class="pt-sous">' + o.sous + '</p>' : '') + '</div>' + (o.actions ? '<div class="pt-actions">' + o.actions + '</div>' : '') + '</header>';
}
function secTete(titre, sous, id) { return '<div class="sec-tete anime"' + (id ? ' id="' + id + '"' : '') + '><h2>' + titre + '</h2>' + (sous ? '<p>' + sous + '</p>' : '') + '</div>'; }
function carteP(titre, sous, corps, o = {}) {
  return '<section class="papier anime' + (o.cls ? ' ' + o.cls : '') + '"' + (o.id ? ' id="' + o.id + '"' : '') + (o.route ? ' data-action="aller" data-route="' + o.route + '" role="link" tabindex="0"' : '') + '>' +
    (titre ? '<div class="p-tete"><div><h2>' + titre + '</h2>' + (sous ? '<span class="p-sous">' + sous + '</span>' : '') + '</div>' + (o.actions ? '<div class="p-actions">' + o.actions + '</div>' : '') + '</div>' : '') + corps + '</section>';
}
function pill(cls, txt, icone) { return '<span class="pill ' + (cls || '') + '">' + (icone ? ic(icone) : '') + txt + '</span>'; }
function cielN(plan) { return '<span class="ciel-n ' + (plan.niveau === 'ok' ? '' : plan.niveau) + '">' + ic(plan.niveau === 'ok' ? 'soleil' : 'nuage') + plan.ciel + '</span>'; }
function basculeDetail(contenu, detail) {
  const ouvert = !!ETAT.detail[ETAT.route];
  return '<div class="detail-bascule anime"><button class="bouton" type="button" data-action="detail" aria-expanded="' + ouvert + '">' + ic('droite') + '<span>' + (ouvert ? 'Masquer le détail' : 'Voir le détail') + '</span></button>' +
    (ouvert ? '' : '<span class="discret">' + contenu + '</span>') + '</div>' +
    (ouvert ? '<div class="detail" id="detail">' + detail() + '</div>' : '');
}
const pct2 = (x) => F2.format(x) + NB + '%';
const jourMoyen = (iso) => maj(dCourt(iso));
const heureFr = (h) => h.replace(':', ' h ');

/* ------------------------------------------------------------------ « où va la marge » : une barre, six parts */
const AUTRES_FRAIS_V3 = ['Énergie', 'Assurances', 'Honoraires', 'Banque et monétique', 'Logiciels et télécoms', 'Entretien et fournitures', 'Impôts et taxes', 'Démarque et écarts', 'Cotisations professionnelles', 'Publicité et divers'];
function partsMarge(cle) {
  const x = pnlDe(cle), ch = x.charges, mt = margeTotale(x.produits);
  const s = (keys) => keys.reduce((t, k) => t + (ch[k] || 0), 0);
  const perso = s(['Personnel']), gerant = s(['Cotisations du gérant']), loyer = s(['Loyer et charges']), amort = s(['Amortissements', 'Charges financières']);
  const autres = chargesTotales(ch) - perso - gerant - loyer - amort;
  return { mt, res: mt - chargesTotales(ch), parts: [
    { lib: 'Salaires et charges', v: perso, coul: 'var(--m1)' },
    { lib: 'Vos cotisations de gérant', v: gerant, coul: 'var(--m2)' },
    { lib: 'Loyer et charges locatives', v: loyer, coul: 'var(--m3)' },
    { lib: 'Autres frais', v: autres, coul: 'var(--m4)', detail: AUTRES_FRAIS_V3.filter((k) => ch[k]).map((k) => ligneTip('', k, eur(ch[k]))).join('') },
    { lib: 'Amortissements et intérêts', v: amort, coul: 'var(--m5)' },
    { lib: 'Votre résultat', v: mt - chargesTotales(ch), coul: 'var(--vert)', res: true },
  ] };
}
function htmlOuVaLaMarge(cle) {
  const m = partsMarge(cle);
  return '<div class="ou-va"><div class="ou-barre" role="img" aria-label="Partage de la marge brute">' +
    m.parts.map((p, k) => '<i class="etire-x" style="--k:' + k + ';flex-grow:' + Math.max(0, p.v) + ';background:' + p.coul + '"' + tip('<b>' + p.lib + '</b>' + ligneTip(p.coul, eur(p.v), pct(p.v / m.mt * 100, 0) + ' de la marge') + (p.detail || '')) + '></i>').join('') + '</div>' +
    '<div class="ou-liste">' + m.parts.map((p) => '<div class="ou-l' + (p.res ? ' res' : '') + '"><span class="ou-pt" style="background:' + p.coul + '"></span><span class="ou-lib">' + p.lib + '</span><span class="ou-pct">' + pct(p.v / m.mt * 100, 0) + '</span><span class="ou-v">' + eur(p.v) + '</span></div>').join('') + '</div></div>';
}
function htmlRayons(cle, cleComp) {
  const p = pnlDe(cle).produits, p0 = cleComp ? pnlDe(cleComp).produits : null;
  const l = ACTIVITES.map((a) => ({ a, m: margeActivite(p, a), m0: p0 ? margeActivite(p0, a) : null })).sort((u, v) => v.m - u.m);
  const max = Math.max(...l.map((x) => x.m));
  const tot = l.reduce((s, x) => s + x.m, 0);
  return '<div class="rayons">' + l.map((x, k) => {
    const evo = x.m0 ? (x.m - x.m0) / x.m0 * 100 : null;
    return '<div class="ray-l"' + tip('<b>' + x.a.lib + '</b>' + ligneTip('var(--bleu)', pnlDe(cle).lib, eur(x.m)) + (x.m0 != null ? ligneTip('', pnlDe(cleComp).lib, eur(x.m0)) : '') + ligneTip('', 'Part de la marge', pct(x.m / tot * 100, 0))) + '>' +
      '<span class="ray-lib">' + x.a.lib + '</span><span class="ray-v">' + eur(x.m) + '</span><span class="ray-d">' + (evo != null ? delta(evo) : '') + '</span>' +
      '<span class="ray-piste"><i class="etire-x" style="--k:' + k + ';width:' + (x.m / max * 100).toFixed(1) + '%"></i></span></div>';
  }).join('') +
    '<div class="ray-l total"><span class="ray-lib">Marge brute</span><span class="ray-v">' + eur(tot) + '</span><span class="ray-d">' + (p0 ? delta((tot - margeTotale(p0)) / margeTotale(p0) * 100) : '') + '</span></div></div>';
}

/* ================================================================== CAISSE : à avoir en caisse depuis la collecte */
const DEPUIS = D.caisse_depuis;
const PROCHAINE_COLLECTE = ajoute(DEPUIS.date, 7);
const netZ = (z) => z.especes - z.gains_fdj - z.gains_pmu;
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
const COLLECTE_ENV = Math.round(PROJ_COLLECTE.total / 1000) * 1000;
(function gesteCollecte() {
  const t = TACHES.find((x) => x.id === 'especes');
  if (!t) return;
  t.lib = 'Compter et verser les espèces';
  t.mt = COLLECTE_ENV;
  t.environ = true;
  t.quand = maj(dLong(PROCHAINE_COLLECTE)) + ', collecte de ' + heureFr(DEPUIS.heure);
  t.pourquoi = eur(PROJ_COLLECTE.deja) + ' en caisse ce soir, puis mercredi, jeudi et vendredi au rythme des quatre dernières semaines.';
})();
function resultatComptage(valeur, attendu) {
  const t = String(valeur || '').replace(/\s/g, '').replace(/ /g, '').replace('€', '').replace(',', '.');
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
// la caisse se remplit : de la collecte de vendredi à celle de vendredi prochain
function ptsRemplissage() {
  const pts = [{ v: 0, lib: maj(dLong(DEPUIS.date)) + ', ' + heureFr(DEPUIS.heure) + ' (collecte)' }];
  let c = 0;
  joursDepuisCollecte().forEach((x) => { c += x.net; pts.push({ v: c / 100, lib: maj(dLong(x.iso)) + (x.iso === AUJ ? ' (ce soir)' : ''), note: eur2(x.net, true) + ' dans la journée' }); });
  PROJ_COLLECTE.jours.forEach((x) => { c += x.net; pts.push({ v: c / 100, lib: maj(dLong(x.iso)) + ' (prévu)', note: '≈ ' + eur(x.net, false, true) + ' dans la journée' }); });
  return pts;
}
function vueCaisseV3() {
  const jours = joursDepuisCollecte();
  const total = jours.reduce((s, x) => s + x.net, 0);
  const C = D.collectes;
  const justes = C.filter((c) => !c.ecart).length;
  const cumul = C.reduce((s, c) => s + c.ecart, 0);
  const max = Math.max(...jours.map((x) => Math.abs(x.net)), 1);
  const P = PROJ_COLLECTE;
  const lignes = jours.map((x) => '<tr><td class="lib"><b>' + maj(dLong(x.iso)) + '</b><span class="sec seul-etroit-bloc">' + eur2(x.esp) + ' encaissés · ' + eur2(x.gains) + ' de gains payés</span></td>' +
    '<td class="n cache-etroit">' + eur2(x.esp) + '</td><td class="n cache-etroit negatif">' + eur2(-x.gains) + '</td>' +
    '<td class="n"><b>' + eur2(x.net) + '</b><span class="barre-net"><i style="width:' + (Math.abs(x.net) / max * 100).toFixed(0) + '%"></i></span></td></tr>').join('');
  const lignesPrevues = P.jours.map((x) => '<tr class="prevu"><td class="lib"><b>' + maj(dLong(x.iso)) + '</b><span class="sec">prévu, au rythme des quatre derniers ' + dLong(x.iso).split(' ')[0] + 's</span></td>' +
    '<td class="n cache-etroit">≈ ' + eur(x.esp) + '</td><td class="n cache-etroit negatif">≈ ' + eur(-x.gains) + '</td>' +
    '<td class="n">≈ ' + eur(x.net) + '<span class="barre-net prevu"><i style="width:' + Math.min(100, Math.abs(x.net) / max * 100).toFixed(0) + '%"></i></span></td></tr>').join('');
  const tableJours = '<div class="defile"><table class="tableau large"><thead><tr><th>Jour</th><th class="n cache-etroit">Encaissé en espèces</th><th class="n cache-etroit">Gains de jeux payés</th><th class="n">Reste en caisse</th></tr></thead><tbody>' + lignes +
    '<tr class="total"><td>Ce soir, depuis la collecte</td><td class="n cache-etroit">' + eur2(jours.reduce((s, x) => s + x.esp, 0)) + '</td><td class="n cache-etroit negatif">' + eur2(-jours.reduce((s, x) => s + x.gains, 0)) + '</td><td class="n">' + eur2(total) + '</td></tr>' +
    lignesPrevues + (P.jours.length ? '<tr class="prevu-total"><td>À la collecte de ' + dLong(PROCHAINE_COLLECTE).split(' ')[0] + ', ' + heureFr(DEPUIS.heure) + '</td><td class="n cache-etroit"></td><td class="n cache-etroit"></td><td class="n">≈ ' + eur(COLLECTE_ENV) + '</td></tr>' : '') + '</tbody></table></div>';
  const coll = C.slice().reverse().slice(0, 8).map((c) => '<tr' + (c.ecart ? ' class="signal"' : '') + '><td class="lib"><b>' + jourMoyen(c.date) + ', ' + heureFr(c.heure) + '</b><span class="sec cache-etroit">versée à la BNP</span><span class="sec seul-etroit-bloc">' + eur2(c.recupere) + ' comptés, versés à la BNP</span></td>' +
    '<td class="n cache-etroit">' + eur2(c.theorique) + '</td><td class="n cache-etroit">' + eur2(c.recupere) + '</td>' +
    '<td class="n">' + (c.ecart ? pastille(c.ecart < 0 ? 'att' : 'info', eur2(c.ecart, true)) : pastille('ok', 'Juste')) + '</td></tr>').join('');
  const tableColl = '<div class="defile"><table class="tableau large"><thead><tr><th>Collecte</th><th class="n cache-etroit">Théorique</th><th class="n cache-etroit">Compté</th><th class="n">Écart</th></tr></thead><tbody>' + coll + '</tbody></table></div>';
  const C14 = C.slice(-14);
  const maxColl = Math.ceil(Math.max(...C14.map((c) => c.recupere)) / 250000) * 2500;
  const grapheColl = graphe((w) => svgColonnes({ id: 'coll', titre: 'Espèces comptées à chaque collecte', w, h: 200, vals: C14.map((c) => c.recupere / 100), labels: C14.map((c) => dNum(c.date).slice(0, 5)),
    max: maxColl, pasLabels: w < 420 ? 4 : 3, largeur: 18, margeG: 46, couleurs: C14.map((c) => (c.ecart ? 'var(--ambre)' : 'var(--m2)')),
    etiquette: (i) => (C14[i].ecart ? eur(C14[i].ecart, false, true) : ''), etiquetteClasse: () => 'att',
    tips: (i) => '<b>' + maj(dLong(C14[i].date)) + ', ' + heureFr(C14[i].heure) + '</b>' + ligneTip('', 'Compté', eur2(C14[i].recupere)) + ligneTip('', 'Écart', C14[i].ecart ? eur2(C14[i].ecart, true) : 'juste au centime') })) +
    '<div class="legende"><span><i style="background:var(--m2)"></i>Juste au centime</span><span><i style="background:var(--ambre)"></i>Écart au comptage</span></div>';
  const pts = ptsRemplissage();
  const iSoir = jours.length;
  const remplissage = graphe((w) => svgCourbe({ id: 'rempl', titre: 'Les espèces en caisse, de vendredi à vendredi', w, h: w < 500 ? 230 : 270, pts, prevision: iSoir, lisse: false, couleur: 'var(--vert)', margeD: w < 500 ? 16 : 96, margeH: 26,
    axeX: pts.map((p, i) => ({ i, lib: i === 0 ? (w < 500 ? 'V' + jour(DEPUIS.date).getDate() : 'ven. ' + jour(DEPUIS.date).getDate()) : (w < 500 ? J[jour(ajoute(DEPUIS.date, i)).getDay()].charAt(0).toUpperCase() : J[jour(ajoute(DEPUIS.date, i)).getDay()] + ' ' + jour(ajoute(DEPUIS.date, i)).getDate()), ancre: i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle' })),
    marques: [{ i: iSoir, lib: 'Ce soir ' + eur(total), dy: -14 }], serie: 'Espèces en caisse', finLib: w < 500 ? false : '≈ ' + eur(COLLECTE_ENV) }));
  return pageTete({ titre: 'Caisse', sous: 'Ce que la caisse doit contenir, depuis la collecte de vendredi 20 h 30. Le Z de ce soir est arrivé à 21 h 00.' }) +
    '<div class="grille">' +
    '<section class="heros anime s7"><div class="h-eyebrow">' + ic('billet') + 'À avoir en caisse, ce soir ' + pill('n ok', 'Z de 21 h 00 reçu', 'coche') + '</div>' +
      '<div class="h-montant"><span class="chiffre-xl">' + compte(total, 'gros') + '</span></div>' +
      '<p class="h-ligne">Espèces encaissées depuis la collecte du <b>' + dLong(DEPUIS.date) + ' à ' + heureFr(DEPUIS.heure) + '</b>, gains de jeux payés au comptoir déduits. ' + jours.length + ' journées.</p>' +
      '<form class="compter sur-nuit" id="form-compte" novalidate><label for="compte-caisse">Vous avez compté la caisse ? Tapez le montant :</label>' +
        '<div class="compter-ligne"><input class="champ grand" id="compte-caisse" inputmode="decimal" autocomplete="off" placeholder="Montant compté" value="' + esc(ETAT.compte || '') + '"><span class="compter-eur">€</span></div>' +
        '<div class="compter-res" id="compte-res" aria-live="polite">' + resultatComptage(ETAT.compte, total) + '</div></form>' +
      '<div class="h-pied"><span class="pill n info">' + ic('calendrier') + 'Collecte de ' + dLong(PROCHAINE_COLLECTE).split(' ')[0] + ' : ≈ ' + eur(COLLECTE_ENV) + '</span></div></section>' +
    '<div class="s5">' + carteP('Les collectes', 'Chaque vendredi à ' + heureFr(DEPUIS.heure) + ', comptées puis versées à la BNP',
      '<div class="coll-resume"><div><b>' + compte(C.length, 'nb') + '</b><span>collectes depuis le ' + dLong(C[0].date).replace(/^\S+ /, '') + '</span></div><div><b>' + compte(justes, 'nb') + '</b><span>justes au centime</span></div><div><b class="' + (cumul ? 'att' : '') + '">' + eur2(cumul, true) + '</b><span>d’écart en tout</span></div></div>' + grapheColl, { cls: 'grandit' }) + '</div>' +
    '</div>' +
    carteP('La caisse se remplit, d’une collecte à l’autre', 'Réel jusqu’à ce soir, puis mercredi, jeudi et vendredi au rythme des quatre dernières semaines', remplissage + '<div style="height:18px"></div>' + tableJours) +
    carteP('Les dernières collectes', 'Théorique selon Strator, compté le soir même', tableColl + '<p class="bloc-note" style="margin-top:12px">Après la fermeture, les espèces sont comptées, comparées au théorique de la caisse, puis versées à la banque.</p>', { actions: boutonsExport('collectes', ['xlsx', 'csv']) }) +
    basculeDetail('Le Z jour par jour, les ventes par rayon et par heure, les tickets annulés.', detailCaisseZ);
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
  const pic = h.reduce((m, x) => (x.montant > m.montant ? x : m), h[0]);
  const totH = h.reduce((t, x) => t + x.montant, 0) || 1;
  const matin = h.filter((x) => x.h < 12).reduce((t, x) => t + x.montant, 0), soir = h.filter((x) => x.h >= 18).reduce((t, x) => t + x.montant, 0);
  const annules = D.annules.filter((a) => ETAT.caisse.annules === 'apres' ? a.moment === 'Après encaissement' : ETAT.caisse.annules === 'jour' ? a.date === iso : true);
  const annRows = annules.slice().reverse().slice(0, 60).map((a) => '<tr class="' + (a.moment === 'Après encaissement' ? 'alerte' : '') + '"><td class="num">' + dNum(a.date) + '</td><td class="mono">' + a.heure + '</td><td>Caisse ' + a.caisse + '</td><td>' + a.vendeur + '</td><td class="n">' + eur2(a.montant) + '</td><td>' + esc(a.motif) + '</td><td>' + (a.moment === 'Après encaissement' ? pastille('att', 'Après paiement') : pastille('', 'Avant paiement')) + '</td></tr>').join('');
  return '<div class="jour-nav"><button class="bouton petit" type="button" data-action="jour" data-pas="-1"' + (idx <= 0 ? ' disabled' : '') + ' aria-label="Jour précédent">' + ic('gauche') + '</button><b>' + maj(dLong(iso)) + '</b>' +
    '<button class="bouton petit" type="button" data-action="jour" data-pas="1"' + (idx >= Z.length - 1 ? ' disabled' : '') + ' aria-label="Jour suivant">' + ic('droite') + '</button>' + (iso !== AUJ ? '<button class="bouton petit" type="button" data-action="jour" data-pas="0">Ce soir</button>' : '<span class="discret">Z de ce soir, 21 h 00</span>') + '</div>' +
    '<div class="tuiles">' +
    '<section class="carte tuile"><span class="lib">Encaissé</span><span class="val">' + eur(z.total) + '</span><span class="sous">dont jeux FDJ ' + eur(z.ventes.fdj) + '</span></section>' +
    '<section class="carte tuile"><span class="lib">Tickets</span><span class="val">' + nb(z.tickets) + '</span><span class="sous">Panier moyen ' + eur2(Math.round(z.total / z.tickets)) + '</span></section>' +
    '<section class="carte tuile"><span class="lib">Cartes et espèces</span><span class="val">' + pct(z.cb / z.total * 100, 0) + ' carte</span><span class="sous">' + eur(z.cb) + ' carte, ' + eur(z.especes) + ' espèces</span></section>' +
    '<section class="carte tuile"><span class="lib">Marge du jour</span><span class="val">' + eur(marge) + '</span><span class="sous">Gains payés au comptoir : ' + eur(gains) + '</span></section></div>' +
    '<div class="g etire">' +
    '<div class="c5">' + carte('Ventes par heure', graphe((w) => svgColonnes({ id: 'h', titre: 'Ventes par heure', w, h: w < 420 ? 220 : 320, vals: h.map((x) => x.montant / 100), labels: h.map((x) => x.h + ' h'), pasLabels: w < 420 ? 3 : 2, largeur: 22,
      couleurs: h.map((x) => (x === pic ? 'var(--ambre)' : 'var(--bleu)')),
      tips: (i) => '<b>De ' + h[i].h + ' h à ' + (h[i].h + 1) + ' h</b>' + ligneTip('', 'Ventes', eur(h[i].montant)) })) +
      '<div class="mini-stats"><div><span>Heure de pointe</span><b>' + pic.h + ' h – ' + (pic.h + 1) + ' h</b><small>' + eur(pic.montant) + '</small></div><div><span>Avant midi</span><b>' + pct(matin / totH * 100, 0) + '</b><small>' + eur(matin) + '</small></div><div><span>Après 18 h</span><b>' + pct(soir / totH * 100, 0) + '</b><small>' + eur(soir) + '</small></div></div>', { meta: '6 h 30 à 20 h 30' }) + '</div>' +
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
  let h = r('CA jeux (Strator)', t.ca, 'cl-tete') + r('Jeux instantanés', t.ji, 'sous') + r('Loto, tirages et paris sportifs', t.loto, 'sous') +
    r('Gains payés au comptoir', -t.gains, 'cl-tete') + r('Remboursement jeux', -t.rj, 'sous') + r('Remboursement loto', -t.rl, 'sous') +
    r('Votre commission (estimée)', -t.com, 'cl-tete') + r('Jeux instantanés, ' + pct2(FDJ_TX.ji * 100), -t.comJi, 'sous') + r('Loto, ' + pct2(FDJ_TX.loto * 100), -t.comLoto, 'sous');
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
const eurJour = (c) => (etroit() ? F0.format(Math.round(c / 100)) : eur(c));
function vueFdj() {
  const f = ETAT.fdj;
  if (!f.semaine) f.semaine = lundiDe(AUJ);
  const prochain = D.releves.fdj.find((r) => r.prelevement >= AUJ);
  const compteFdj = D.comptes.fdj;
  const sem = fdjSemaineV2(f.semaine);
  const enCours = sem.lundi === lundiDe(AUJ);
  const choisi = f.jour && sem.jours.find((j) => j.iso === f.jour && j.reel);
  const tCalc = choisi ? fdjCalcul([choisi.reel]) : sem.tReel;
  const releve = prochain ? '<div class="papier serre"><h3 class="h3">Le relevé de la semaine ' + prochain.semaine + ', reçu lundi</h3><div class="calc compact">' +
    '<div class="calc-l"><span>Ventes de jeux</span><span class="v">' + eur2(prochain.ventes) + '</span></div>' +
    '<div class="calc-l"><span>Gains payés au comptoir</span><span class="v">' + eur2(-prochain.gains) + '</span></div>' +
    '<div class="calc-l"><span>Votre commission</span><span class="v">' + eur2(-prochain.commission) + '</span></div>' +
    '<div class="calc-l total fort"><span>Prélevé mercredi</span><span class="v">' + eur2(prochain.solde) + '</span></div></div></div>' : '';
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
      '<i class="reel etire-x" style="flex-grow:' + Math.max(1, Math.round(sem.tReel.total)) + '"></i><i class="proj etire-x" style="--k:1;flex-grow:' + Math.max(1, Math.round(sem.tProj.total)) + '"></i></div>' +
      '<div class="atter-leg"><span><i class="reel"></i>Déjà joué <b>' + eur(sem.tReel.total) + '</b></span><span><i class="proj"></i>Reste estimé <b>≈ ' + eur(sem.tProj.total) + '</b></span></div></div>';
  }
  const puces7 = '<div class="jours7" role="group" aria-label="Jours de la semaine">' + sem.jours.map((j) => {
    const cls = ['j7']; if (j.reel) cls.push('fait'); else cls.push('futur'); if (j.iso === AUJ) cls.push('auj'); if (f.jour === j.iso) cls.push('choisi');
    return '<button type="button" class="' + cls.join(' ') + '" data-action="fdj-jour" data-jour="' + j.iso + '"' + (j.reel ? '' : ' disabled') + ' aria-pressed="' + (f.jour === j.iso) + '"' +
      ' aria-label="' + esc(maj(dLong(j.iso)) + ' : ' + (j.reel ? '' : 'environ ') + eur(j.net)) + '">' +
      '<span class="j7-j">' + maj(J[jour(j.iso).getDay()]).replace('.', '') + '</span><b>' + jour(j.iso).getDate() + '</b><span class="j7-v">' + (j.reel ? '' : '≈') + eurJour(j.net) + '</span></button>';
  }).join('') + '</div>';
  const precedente = ajoute(sem.lundi, -7) >= FDJ_PREMIERE, suivante = ajoute(sem.lundi, 7) <= lundiDe(AUJ);
  const hist = D.releves.fdj.filter((r) => r.du >= FDJ_PREMIERE).slice(-9).map((r) => ({ r, s: fdjSemaineV2(r.du) }));
  const ecartFort = (x) => Math.abs(x.s.tReel.total - x.r.solde) > 4000;
  const lignesHist = hist.slice().reverse().map((x) => {
    const e = Math.round(x.s.tReel.total - x.r.solde);
    return '<tr class="' + (ecartFort(x) ? 'signal' : '') + (x.r.du === sem.lundi ? ' choisie' : '') + '" data-action="fdj-semaine" data-semaine="' + x.r.du + '" tabindex="0"><td class="lib"><b>Semaine ' + x.r.semaine + '</b><span class="sec">' + dNum(x.r.du) + ' au ' + dNum(x.r.au) + '<span class="cache-etroit"> · prélevée le ' + dNum(x.r.prelevement) + '</span></span></td>' +
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
  const grapheH = graphe((w) => svgColonnes({ id: 'fdjh', titre: 'Prélèvements FDJ des dernières semaines', w, h: 240, vals: grapheVals, labels: grapheLabels, largeur: 30, pasLabels: w < 400 ? 2 : 0, dernierLabel: true, margeG: 44,
    prevu: (i) => i === nG - 1, couleur: 'var(--orange)', etiquette: (i) => (i === nG - 1 ? '≈ ' + F1.format(grapheVals[i] / 1000) + NB + 'k€' : ''),
    tips: (i) => '<b>' + grapheLabels[i] + (i === nG - 1 ? ', semaine en cours' : '') + '</b>' + ligneTip('', i === nG - 1 ? 'Atterrissage' : 'Prélevé', eur(grapheVals[i] * 100)) })) +
    '<div class="legende"><span><i style="background:var(--orange)"></i>Prélevé</span><span><i style="background:repeating-linear-gradient(45deg,var(--orange) 0 2px,transparent 2px 5px);box-shadow:inset 0 0 0 1px var(--orange)"></i>Atterrissage de la semaine en cours</span></div>';
  const s41 = hist.find(ecartFort);
  const explication = s41 ? '<div class="explication"><div class="encart att">' + ic('alerte') + '<div><b>Semaine ' + s41.r.semaine + ' : la caisse finit ' + eur2(Math.round(s41.r.solde - s41.s.tReel.total)) + ' sous le relevé.</b> ' +
    eur2(4500) + ' viennent du <b>jeudi 8 octobre à 14 h 31 min 08 s</b> : trois tickets à gratter passés au terminal FDJ, absents de la caisse. Le reste, c’est l’arrondi de la commission.</div></div>' +
    '<button class="lien-bouton" type="button" data-action="fdj-ops" aria-expanded="' + !!f.ops + '">' + (f.ops ? 'Masquer les opérations' : 'Voir les opérations de 14 h 25 à 14 h 40') + ' ' + ic('droite') + '</button>' +
    (f.ops ? '<div class="defile"><table class="tableau compact"><thead><tr><th>Heure</th><th>Jeu</th><th class="n">Montant</th><th>En caisse</th></tr></thead><tbody>' +
      EXPORT_FDJ.map((o) => '<tr class="' + (o.ok ? '' : 'alerte') + '"><td class="mono">' + o.h + '</td><td>' + o.jeu + '</td><td class="n">' + eur2(o.mt) + '</td><td>' + (o.ok ? pastille('ok', 'Oui') : pastille('ko', 'Absent')) + '</td></tr>').join('') + '</tbody></table></div><p class="bloc-note">Export détaillé obtenu avec la collaboration de la FDJ, opération par opération.</p>' : '') + '</div>' : '';
  return pageTete({ titre: 'FDJ', sous: 'Le prélèvement de mercredi, connu par le relevé. Puis l’atterrissage de la semaine en cours, calculé chaque soir à partir des rubriques de la caisse.' }) +
    '<section class="heros anime"><div class="duo"><div class="duo-g">' +
      '<div class="h-eyebrow">' + ic('ticket') + 'Prochain prélèvement FDJ</div>' +
      '<div class="h-montant"><span class="chiffre-xl">' + (prochain ? compte(prochain.solde, 'gros') : '—') + '</span></div>' +
      (prochain ? '<p class="h-ligne"><b>' + maj(dLong(prochain.prelevement)) + '</b>. Relevé de la semaine du ' + jour(prochain.du).getDate() + ' au ' + dLong(prochain.au).replace(/^\S+ /, '') + ', reçu lundi.</p>' +
        '<div class="pills">' + pill('n', 'Sur le compte FDJ : ' + eur(compteFdj), 'banque') + (compteFdj < prochain.solde ? pill('n att', 'À virer avant mercredi : ' + eur(prochain.solde - compteFdj), 'alerte') : pill('n ok', 'Le compte couvre le prélèvement', 'coche')) + '</div>' : '') +
    '</div><div class="duo-d">' + releve + '</div></div></section>' +
    carteP('Semaine de jeux', 'Du lundi au dimanche, prélevée le mercredi suivant',
      '<div class="sem-nav"><button class="bouton petit" type="button" data-action="fdj-sem" data-pas="-1"' + (precedente ? '' : ' disabled') + ' aria-label="Semaine précédente">' + ic('gauche') + '</button>' +
      '<div class="sem-titre"><b>Du ' + jour(sem.lundi).getDate() + ' au ' + dLong(ajoute(sem.lundi, 6)).replace(/^\S+ /, '') + '</b><span>' + (enCours ? 'semaine en cours' : 'semaine ' + (sem.rel ? sem.rel.semaine : '')) + '</span></div>' +
      '<button class="bouton petit" type="button" data-action="fdj-sem" data-pas="1"' + (suivante ? '' : ' disabled') + ' aria-label="Semaine suivante">' + ic('droite') + '</button></div>' +
      '<div class="sem-corps"><div class="sem-gauche"><span class="rep-eyebrow">' + semTitre + '</span><span class="rep-montant">' + semMontant + '</span><p class="rep-ligne">' + semLigne + '</p>' + semBarre + puces7 +
      (f.jour ? '<button class="lien-bouton" type="button" data-action="fdj-jour" data-jour="">' + ic('retour') + 'Revenir à la semaine entière</button>' : '<p class="bloc-note">Touchez un jour pour voir ses rubriques Strator.</p>') + '</div>' +
      '<div class="sem-droite"><h3 class="h3">' + (choisi ? 'Rubriques Strator du ' + dLong(choisi.iso) : 'Le calcul, rubrique par rubrique') + '</h3>' + lignesCalculFdj(tCalc, choisi ? null : sem) + '</div></div>', { id: 'fdj-semaine' }) +
    carteP('La caisse face aux relevés FDJ', 'L’estimation tombe en moyenne à ' + eur(ecartMoy) + ' du relevé',
      '<div class="grille"><div class="s5 pile">' + grapheH + explication + '</div>' +
      '<div class="s7"><div class="defile"><table class="tableau large cliquables"><thead><tr><th>Semaine</th><th class="n cache-etroit">Estimé (caisse)</th><th class="n">Relevé FDJ</th><th class="n">Écart</th></tr></thead><tbody>' + lignesHist + '</tbody></table></div>' +
      '<p class="bloc-note" style="margin-top:12px">Taux de commission calibrés sur les relevés : ' + pct2(FDJ_TX.ji * 100) + ' des jeux instantanés, ' + pct2(FDJ_TX.loto * 100) + ' du Loto. En moyenne sur huit semaines : ' + eur(moy) + ' prélevés par semaine.</p></div></div>',
      { actions: boutonsExport('fdjSemaines', ['xlsx', 'csv']) }) +
    basculeDetail('Profession Jeux face à Strator jour par jour, relevés FDJ et PMU.', detailJeux);
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
    '<div class="g"><div class="c12">' + carte('Relevés FDJ', '<div class="defile"><table class="tableau compact"><thead><tr><th>Semaine</th><th class="n">Ventes</th><th class="n">Gains payés</th><th class="n">Commission</th><th class="n">Prélevé le</th></tr></thead><tbody>' + rel + '</tbody></table></div>', { meta: 'Prélèvement chaque mercredi', actions: boutonsExport('fdj') }) + '</div>' +
    '<div class="c12">' + carte('Relevés PMU', '<div class="defile"><table class="tableau compact"><thead><tr><th>Semaine</th><th class="n">Enjeux</th><th class="n">Gains payés</th><th class="n">Commission</th><th class="n">Prélevé le</th></tr></thead><tbody>' + relP + '</tbody></table></div>', { meta: 'Prélèvement chaque mardi', actions: boutonsExport('pmu') }) + '</div></div>';
}

/* ================================================================== ACCUEIL */
// lundi soir, après Logista : ce qui est vraiment à vous (les jeux, les recharges et les timbres ne le sont pas)
function vraimentAVous() {
  const L19 = '2026-10-19';
  const fdj = Math.round((fdjSemaineV2('2026-10-12').atterrissage + fdjCalcul([fdjMoyenne(L19, 0)]).total) / 100) * 100;
  const pmuSem = D.releves.pmu.slice(-4).reduce((s, r) => s + r.solde, 0) / 4;
  const pmu = Math.round(pmuSem * 8 / 7 / 100) * 100;
  const moyJour = (iso, f) => { const l = [1, 2, 3, 4].map((w) => ZJ[ajoute(iso, -7 * w)]).filter(Boolean); return l.reduce((s, z) => s + f(z), 0) / (l.length || 1); };
  let rech = 0;
  for (let k = '2026-10-12'; k <= L19; k = ajoute(k, 1)) rech += (ZJ[k] && k <= AUJ ? ZJ[k].ventes.recharges : moyJour(k, (z) => z.ventes.recharges)) * (1 - D.taux.recharges);
  rech = Math.round(rech / 100) * 100;
  const timbres = 44000;
  const surComptes = ATT.total - fdj - pmu - rech - timbres;
  const vraiment = ATT.net;
  return { total: ATT.total, fdj, pmu, rech, timbres, surComptes, stock: vraiment - surComptes, vraiment };
}
const VAV = vraimentAVous();
function vueAccueil() {
  const plan = calculPlan();
  const avance = plan.bas / SIM.seuil;
  const especes = joursDepuisCollecte().reduce((s, x) => s + x.net, 0);
  const prochain = D.releves.fdj.find((r) => r.prelevement >= AUJ);
  const compteFdj = D.comptes.fdj;
  const att = pnlDe('att'), sep = pnlDe(9);
  const mAtt = margeTotale(att.produits), rAtt = resultatDe(att), mSep = margeTotale(sep.produits), rSep = resultatDe(sep);
  const V = VAV;
  const parts = [
    { v: V.surComptes, lib: 'à vous, sur vos comptes', coul: 'var(--vert-vif)' },
    { v: V.fdj, lib: 'à reverser à la FDJ', coul: 'var(--orange)' },
    { v: V.pmu, lib: 'au PMU', coul: 'var(--sarcelle)' },
    { v: V.rech, lib: 'à Logista, pour les recharges', coul: 'var(--bleu-2)' },
    { v: V.timbres, lib: 'à l’État, pour les timbres', coul: 'var(--violet)' },
  ];
  const ptsRempl = ptsRemplissage().slice(0, joursDepuisCollecte().length + 1).map((p) => p.v);
  const tuile = (route, icone, coul, lib, valeur, sous, droite) => '<section class="papier lien tuile-soir anime" data-action="aller" data-route="' + route + '" role="link" tabindex="0"><span class="ic-pastille ' + coul + '">' + ic(icone) + '</span>' +
    '<span class="ts-lib">' + lib + '</span><span class="ts-v">' + valeur + '</span><span class="ts-sous">' + sous + '</span><span class="ts-droite">' + ic('droite') + (droite || '') + '</span></section>';
  const SEMV = SEM.map((x) => x.solde / 100);
  const iSoir = SEM.findIndex((x) => x.date === AUJ);
  const semaine = graphe((w) => {
    const etroitG = w < 560;
    return svgColonnes({ id: 'sem', titre: 'Trésorerie chaque soir à 21 h, du dimanche 11 au lundi 19 octobre', w, h: etroitG ? 250 : 300, vals: SEMV, largeur: etroitG ? 22 : 46, basAxe: etroitG ? 46 : 62, margeG: etroitG ? 38 : 50, margeH: 26,
      couleurs: SEM.map((x, i) => (i === 0 ? 'var(--m3)' : i === SEM.length - 1 ? 'var(--rouge)' : 'var(--bleu)')),
      labels: SEM.map((x, i) => (etroitG ? J[jour(x.date).getDay()].charAt(0).toUpperCase() + jour(x.date).getDate() : (i === 0 ? 'Départ, ' : '') + x.jour)), labelClasse: (i) => (i === SEM.length - 1 ? 'rouge' : i === iSoir ? 'fort' : ''),
      prevu: (i) => SEM[i].statut === 'prévu' && i < SEM.length - 1,
      etiquette: (i) => (etroitG ? (i === 0 || i === iSoir || i === SEM.length - 1 ? keur(SEMV[i]) : '') : F0.format(SEMV[i]) + NB + '€'), etiquetteClasse: (i) => (i === SEM.length - 1 ? 'rouge' : 'fort'),
      sous: (i) => (SEM[i].sorties.length ? (etroitG ? (SEM[i].sorties[0][1] >= 500000 ? keur(-SEM[i].sorties[0][1] / 100) : '') : [SEM[i].sorties[0][0], keur(-SEM[i].sorties[0][1] / 100)]) : ''),
      tips: (i) => '<b>' + maj(dLong(SEM[i].date)) + (SEM[i].statut === 'prévu' ? ' (prévu)' : i === iSoir ? ' (ce soir)' : '') + '</b>' + ligneTip('', 'Solde à 21 h', eur(SEM[i].solde)) + (SEM[i].entrees ? ligneTip('', 'Encaissements nets', '+' + eur(SEM[i].entrees)) : '') + SEM[i].sorties.map((s) => ligneTip('', s[0], eur(-s[1]))).join('') });
  });
  const surveiller = [
    { route: 'fdj', ops: true, ic: 'ticket', niv: 'ko', t: 'Écart FDJ : ' + eur2(-4500), s: 'Jeudi 8 octobre, 14 h 31 min 08 s : trois tickets absents de la caisse' },
    { facture: FACT_METRO && FACT_METRO.id, ic: 'facture', niv: 'att', t: 'Coca-Cola : +6,8 % chez Metro', s: 'Prix de vente inchangé : la marge du produit baisse de 3 points' },
    { route: 'rentabilite', ic: 'tasse', niv: 'att', t: 'Café : ' + D.ratios[8].tasses_kg + ' tasses par kilo', s: 'Environ 138 attendues en septembre : cafés offerts ou moulin à régler' },
    { route: 'caisse', ic: 'caisse', niv: 'att', t: '3 annulations après paiement', s: 'Samedi 10 octobre, entre 19 h 52 et 20 h 01, caisse 2' },
  ];
  const vocaux = VOCAUX.slice(0, 3);
  const onde = '<span class="onde" aria-hidden="true">' + [6, 11, 7, 14, 9, 16, 8, 12, 5, 10, 13, 7, 9, 4].map((h) => '<i style="height:' + h + 'px"></i>').join('') + '</span>';
  return pageTete({ titre: 'Bonsoir Julien,', sous: 'Le Z de 21 h 00 et vos banques sont arrivés. Voici votre soirée, et où vous atterrissez lundi.', actions: cielN(plan) }) +
    '<div class="grille">' +
    '<section class="heros anime s7"><div class="h-eyebrow">' + ic('calendrier') + 'Lundi 19 octobre, après la facture tabac ' + (plan.niveau === 'ok' ? pill('n ok', 'Ça passe', 'coche') : pill('n att', 'À anticiper', 'alerte')) + '</div>' +
      '<div class="h-montant"><span class="chiffre-xl">' + compte(V.total, 'grosE') + '</span></div>' +
      '<p class="h-ligne">Sur vos comptes lundi soir, une fois la facture Logista payée (' + eur(2933000) + '). Au plus bas des six prochains mois, il restera <b>' + F1.format(avance) + ' facture Logista d’avance</b>.</p>' +
      '<div class="split"><div class="split-barre" role="img" aria-label="Ce que contiennent vos comptes lundi soir">' + parts.map((p, k) => '<i class="etire-x" style="--k:' + k + ';flex-grow:' + p.v + ';background:' + p.coul + '"' + tip('<b>' + maj(p.lib) + '</b>' + ligneTip(p.coul, 'Lundi soir', (k ? '≈ ' : '') + eur(p.v))) + '></i>').join('') + '</div>' +
      '<div class="split-leg">' + parts.map((p, k) => '<div class="sl"><b><i style="background:' + p.coul + '"></i>' + (k && k < 4 ? '≈ ' : '') + eur(p.v) + '</b><span>' + p.lib + '</span></div>').join('') + '</div></div>' +
      '<div class="vraiment"><span class="chiffre-s">' + compte(V.vraiment, 'grosE') + '</span><span><b>vraiment à vous</b>, avec ' + eur(V.stock) + ' de tabac en stock déjà payé. Le reste attend d’être reversé.</span></div>' +
      '<div class="h-pied"><span class="pill n">' + ic('banque') + 'Ce soir : ' + eur(SEM[iSoir].solde) + ' sur vos comptes</span>' + lienPage('tresorerie', 'La trésorerie') + '</div></section>' +
    '<div class="s5 soir">' +
      tuile('caisse', 'billet', 'ambre', 'À avoir en caisse', compte(especes, 'gros'), 'depuis vendredi 20 h 30 · collecte de vendredi ≈ ' + eur(COLLECTE_ENV), svgEtincelle(ptsRempl, 'var(--vert)', 120, 36)) +
      tuile('fdj', 'ticket', 'rouge', 'Mercredi, la FDJ prélève', compte(prochain.solde, 'gros'), 'compte FDJ : ' + eur(compteFdj) + ' · virer ' + eur(prochain.solde - compteFdj) + ' avant mercredi', pill('att', 'À virer', 'alerte')) +
      tuile('tresorerie', 'courbe', 'bleu', 'Dans six mois, fin avril', compte(plan.fin * 100, 'grosE'), plan.ciel + ', avec vos décisions', svgEtincelle(plan.pts, 'var(--bleu)', 120, 36)) +
    '</div></div>' +
    '<div class="grille">' +
    '<div class="s8 col-semaine">' + carteP('Votre semaine, soir après soir', 'Réel jusqu’à ce soir, puis chaque prélèvement connu est déjà placé', semaine +
      '<div class="legende"><span><i style="background:var(--bleu)"></i>Réel</span><span><i style="background:repeating-linear-gradient(45deg,var(--bleu) 0 2px,transparent 2px 5px);box-shadow:inset 0 0 0 1px var(--bleu)"></i>Prévu</span><span><i style="background:var(--rouge)"></i>Atterrissage, lundi 19</span></div>' + htmlEquationSemaine(), { cls: 'grandit', actions: lienPage('tresorerie', 'Trésorerie') }) + '</div>' +
    '<div class="s4 col-gestes">' + carteP('Cette semaine, 3 gestes', 'Préparés pour vous, à cocher quand c’est fait', htmlGestes() + progresGestes(), { cls: 'grandit colonne' }) + '</div></div>' +
    secTete('Octobre, <em>au Balto</em>', 'Réel jusqu’à ce soir, puis le reste du mois au rythme des quatre dernières semaines.') +
    '<div class="grille">' +
    '<div class="s6">' + carteP('Ce que vous gagnez en octobre', 'Avant votre rémunération et avant impôt',
      '<div class="mois-chiffres"><div class="mc fort"><span>Résultat attendu</span><b>' + compte(rAtt, 'grosE') + '</b><em>' + delta((rAtt - rSep) / Math.abs(rSep) * 100) + ' sur septembre</em></div>' +
      '<div class="mc"><span>Marge brute</span><b>' + compte(mAtt, 'grosE') + '</b><em>' + delta((mAtt - mSep) / mSep * 100) + ' sur septembre</em></div></div>' +
      '<h3 class="h3">Où va la marge</h3>' + htmlOuVaLaMarge('att'), { cls: 'grandit', actions: lienPage('rentabilite', 'Résultat') }) + '</div>' +
    '<div class="s6">' + carteP('Ce que rapporte chaque rayon', 'Marge d’octobre, comparée à septembre', htmlRayons('att', 9), { cls: 'grandit' }) + '</div></div>' +
    '<div class="grille">' +
    '<div class="s4">' + carteP('À surveiller', 'Repéré par le cockpit cette semaine', '<div class="liste alertes-l">' + surveiller.map((x) => '<div class="ligne cliquable" data-action="' + (x.facture ? 'facture' : 'surveiller') + '"' + (x.facture ? ' data-id="' + x.facture + '"' : ' data-route="' + x.route + '"' + (x.ops ? ' data-ops="1"' : '')) + ' role="button" tabindex="0"><span class="puce-ic ' + x.niv + '">' + ic(x.ic) + '</span><div class="l-txt"><b>' + x.t + '</b><span>' + x.s + '</span></div>' + ic('droite') + '</div>').join('') + '</div>', { cls: 'grandit' }) + '</div>' +
    '<div class="s4">' + carteP('Boîte vocale', 'Le téléphone a sonné en plein rush ? Le message est résumé', '<div class="vocal">' + vocaux.map((v) => '<div class="voc"><span class="voc-ic">' + ic('telephone') + '</span><div class="voc-tete"><b>' + esc(v.qui) + '</b><span>' + (v.date === AUJ ? '' : J[jour(v.date).getDay()] + ' ') + v.h + '</span></div><p>' + esc(v.resume) + '</p><span class="voc-pied">' + ic('coche') + 'Envoyé à ' + esc(v.envoye) + '</span></div>').join('') + '</div>', { cls: 'grandit' }) + '</div>' +
    '<div class="s4">' + carteP('Vos sources, ce soir', 'Toute l’information au même endroit, sans aucun mot de passe', htmlSources(4) + '<div class="p-pied"><button class="lien-bouton" type="button" data-action="sources">Toutes vos sources ' + ic('fleche') + '</button></div>', { cls: 'grandit colonne' }) + '</div></div>';
}
function htmlGestes() {
  return '<div class="gestes">' + TACHES.map((t) => {
    const fait = !!ETAT.faits[t.id];
    return '<label class="geste' + (fait ? ' faite' : '') + '" style="--c:' + t.coul + '"><input type="checkbox" data-tache="' + t.id + '"' + (fait ? ' checked' : '') + '><span class="g-coche">' + ic('coche') + '</span>' +
      '<span class="g-lib">' + t.lib + '</span><span class="g-mt">' + (t.environ ? '≈ ' : '') + eur(t.mt) + '</span><span class="g-quand">' + t.quand + '</span></label>';
  }).join('') + '</div>';
}
function progresGestes() {
  const n = TACHES.filter((t) => ETAT.faits[t.id]).length;
  return '<div class="gestes-pied" id="gestes-pied"><div class="gp-barre" role="progressbar" aria-valuemin="0" aria-valuemax="' + TACHES.length + '" aria-valuenow="' + n + '"><i style="width:' + (n / TACHES.length * 100).toFixed(1) + '%"></i></div>' +
    '<span>' + (n === TACHES.length ? ic('coche') + 'Tout est fait pour cette semaine.' : '<b>' + n + ' sur ' + TACHES.length + '</b> faits cette semaine · les suivants arrivent lundi soir') + '</span></div>';
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

/* ================================================================== TRÉSORERIE : comptes, semaine, plan de vol */
const ICONES_LEVIERS = { embauche: 'recrue', credit: 'coche-rond', salaire: 'personne', cbd: 'feuille', agencement: 'boite' };
const moisChoix = (a, b) => MOIS_PLAN.slice(a, b + 1).map((l, j) => [a + j, l]);
// une rangée de choix ; avec « effet », chaque puce montre ce que le choix donne au point bas
function puces(cle, choix, val, lib, effet) {
  return '<div class="lv-reglage"><span class="lv-r-lib">' + lib + (effet ? '<em>point bas</em>' : '') + '</span><div class="puces-m' + (effet ? ' a-effet' : '') + '" role="group" aria-label="' + esc(lib) + '">' +
    choix.map(([v, l]) => {
      const x = effet ? calculPlan(Object.assign({}, ETAT.plan, { [cle]: v })) : null;
      return '<button type="button" class="pm" data-plan="' + cle + '" data-v="' + v + '" aria-pressed="' + (String(val) === String(v)) + '"' + (x ? ' aria-label="' + esc(l + ' : point bas ' + eur(x.bas * 100)) + '"' : '') + '>' + l +
        (x ? '<small class="pm-e ' + x.niveau + '">' + keur(x.bas) + '</small>' : '') + '</button>';
    }).join('') + '</div></div>';
}
// partir d'un scénario : vos mouvements et la date de lecture sont gardés
const SCENARIOS_PLAN = [
  { id: 'prudent', lib: 'Prudent', p: { embauche: false, credit: false, salaire: 1500, salaireMois: 3, cbd: false, agencement: false } },
  { id: 'depart', lib: 'Plan de départ', p: {} },
  { id: 'investir', lib: 'Investir', p: { cbd: true, cbdMois: 1, cbdStock: 6000, agencement: true, agencementMois: 4, agencementHT: 40000, agencementPret: true, aide: true, aideMois: 6 } },
];
const planDe = (sc) => Object.assign(planDefaut(), sc.p, { mouvements: ETAT.plan.mouvements, lecture: ETAT.plan.lecture });
const CLES_PLAN = Object.keys(planDefaut()).filter((k) => k !== 'mouvements' && k !== 'lecture');
function scenarioActif() {
  const s = SCENARIOS_PLAN.find((sc) => { const q = planDe(sc); return CLES_PLAN.every((k) => q[k] === ETAT.plan[k]); });
  return s ? s.id : null;
}
function htmlScenarios() {
  const actif = scenarioActif();
  return '<span class="lv-r-lib">Partir d’un scénario <em>fin avril</em></span><div class="scen" role="group" aria-label="Partir d’un scénario">' + SCENARIOS_PLAN.map((sc) => {
    const r = calculPlan(planDe(sc));
    return '<button type="button" class="sc" data-action="plan-scenario" data-id="' + sc.id + '" aria-pressed="' + (actif === sc.id) + '"><b>' + sc.lib + '</b><span class="sc-v ' + r.niveau + '">' + keur(r.fin) + '</span></button>';
  }).join('') + '</div>' + (actif ? '' : '<p class="lv-note sc-perso">Votre scénario à vous : modifié à la main.</p>');
}
function sousLevier(cle, p) {
  switch (cle) {
    case 'embauche': return 'Dès ' + MOIS_PLAN_L[p.embaucheMois] + ' : salaire et charges, moins les ventes du soir';
    case 'credit': return eur(capitalCredit(p.creditMois) * 100) + ', fin ' + MOIS_PLAN_L[p.creditMois] + ' ; 620 € par mois en moins ensuite';
    case 'salaire': return 'Dès ' + MOIS_PLAN_L[p.salaireMois] + ' : <span id="salaire-lib" class="sal-v">' + (p.salaire ? eur(p.salaire * 100) + ' par mois' : 'aucun salaire') + '</span>';
    case 'cbd': return eur(p.cbdStock * 100) + ' de stock en ' + MOIS_PLAN_L[p.cbdMois] + ', marge qui monte ensuite';
    case 'agencement': return '<span class="ag-ht">' + eur(p.agencementHT * 100) + '</span> HT en ' + MOIS_PLAN_L[p.agencementMois] + (p.agencementPret ? ', prêt sur 5 ans' : ', payé comptant');
  }
  return '';
}
function noteAgencement(p) {
  const ht = p.agencementHT, tva = tvaAgencement(ht), m = MOIS_PLAN_L[p.agencementMois], ma = moisAide(p);
  const paye = p.agencementPret ? 'Apport de <b>' + eur(ht * 20) + '</b> et TVA en ' + m + ', puis <b>' + eur(Math.round(mensualitePret(ht * 0.8)) * 100) + ' par mois</b> pendant 5 ans.' : 'Vous payez <b>' + eur((ht + tva) * 100) + ' TTC</b> en ' + m + '.';
  const tvaTxt = ' La TVA (' + eur(tva * 100) + ') vous revient ' + (p.agencementMois < 6 ? '<b>fin ' + MOIS_PLAN_L[p.agencementMois + 1] + '</b>' : 'en mai') + ', sur votre déclaration.';
  const aide = p.aide ? (ma <= 6 ? ' L’aide (' + eur(aideAgencement(ht) * 100) + ') arrive <b>en ' + MOIS_PLAN_L[ma] + '</b>, si le dossier est accepté.' : ' L’aide arrivera après avril.') : '';
  return '<p class="lv-note">' + paye + tvaTxt + aide + '</p>';
}
function reglagesLevier(cle, p) {
  switch (cle) {
    case 'embauche': return puces('embaucheMois', moisChoix(1, 5), p.embaucheMois, 'Début');
    case 'credit': return puces('creditMois', moisChoix(1, 5), p.creditMois, 'Soldé fin');
    case 'salaire': return puces('salaireMois', moisChoix(1, 6), p.salaireMois, 'À partir de');
    case 'cbd': return puces('cbdStock', [[3000, '3 000 €'], [6000, '6 000 €'], [9000, '9 000 €']], p.cbdStock, 'Stock') + puces('cbdMois', moisChoix(1, 4), p.cbdMois, 'Achat en');
    case 'agencement': {
      const ht = p.agencementHT;
      return '<div class="lv-reglage"><span class="lv-r-lib">Montant des travaux, HT</span><div class="lv-curseur"><input class="curseur" type="range" id="curseur-agencement" min="20000" max="60000" step="5000" value="' + ht + '" style="--p:' + ((ht - 20000) / 400) + '%" aria-label="Montant de l’agencement, hors taxes"><b class="ag-ht">' + eur(ht * 100) + '</b></div></div>' +
        puces('agencementMois', moisChoix(2, 6), p.agencementMois, 'Travaux en', true) +
        puces('agencementPret', [[false, 'Comptant'], [true, 'Prêt sur 5 ans']], p.agencementPret, 'Paiement', true) +
        puces('aide', [[false, 'Sans'], [true, 'Avec l’aide de la douane']], p.aide, 'Aide à la transformation') +
        (p.aide && p.agencementMois < 6 ? puces('aideMois', moisChoix(p.agencementMois + 1, 6), moisAide(p), 'Aide reçue en') : '') +
        '<div id="note-agencement">' + noteAgencement(p) + '</div>';
    }
  }
  return '';
}
function htmlLeviers() {
  const p = ETAT.plan;
  return LEVIERS.map((l) => {
    const actif = l.cle === 'salaire' ? !!p.salaire : !!p[l.cle];
    const tete = '<span class="lv-ic">' + ic(ICONES_LEVIERS[l.cle]) + '</span><b>' + l.titre + '</b><span class="lv-sous">' + sousLevier(l.cle, p) + '</span>';
    if (l.cle === 'salaire') {
      return '<div class="levier salaire' + (actif ? ' actif' : '') + '"><div class="lv-tete">' + tete + '</div>' +
        '<input class="curseur" type="range" id="curseur-salaire" min="0" max="4000" step="250" value="' + p.salaire + '" style="--p:' + (p.salaire / 40) + '%" aria-label="Votre salaire de gérant, par mois">' +
        (actif ? '<div class="lv-reglages">' + reglagesLevier('salaire', p) + '</div>' : '') + '</div>';
    }
    return '<div class="levier' + (actif ? ' actif' : '') + '"><div class="lv-tete" data-levier="' + l.cle + '">' + tete + '<button type="button" class="bascule" role="switch" aria-checked="' + actif + '" aria-label="' + esc(l.titre) + '"></button></div>' +
      (actif ? '<div class="lv-reglages">' + reglagesLevier(l.cle, p) + '</div>' : '') + '</div>';
  }).join('');
}
// vos mouvements : une dépense ou une rentrée connue, à son mois
const IDEES_MVT = [
  { lib: 'Prime de fin d’année', montant: -1500, mois: 2, freq: 'une' },
  { lib: 'Remboursement d’assurance', montant: 3000, mois: 3, freq: 'une' },
  { lib: 'Achat d’un véhicule', montant: -15000, mois: 5, freq: 'une' },
];
function htmlMvtsPlan() {
  const p = ETAT.plan, f = ETAT.planForm;
  const liste = p.mouvements.map((m) => '<div class="mp-l"><span class="mp-ic ' + (m.montant < 0 ? 'neg' : 'pos') + '">' + ic(m.montant < 0 ? 'baisse' : 'hausse') + '</span>' +
    '<div class="mp-txt"><b>' + esc(m.lib) + '</b><span>' + (m.freq === 'mois' ? 'chaque mois, dès ' : 'en ') + MOIS_PLAN_L[m.mois] + '</span></div>' +
    '<span class="mp-mt ' + (m.montant < 0 ? 'negatif' : 'positif') + '">' + eur(m.montant * 100, false, true) + (m.freq === 'mois' ? '<small>/mois</small>' : '') + '</span>' +
    '<button type="button" class="mp-x" data-action="plan-retirer" data-id="' + esc(m.id) + '" aria-label="Retirer ' + esc(m.lib) + '">' + ic('croix') + '</button></div>').join('');
  const form = '<form class="mp-form" id="form-plan-mvt" novalidate>' +
    '<div class="mp-champs"><input class="champ" id="mp-lib" maxlength="40" autocomplete="off" placeholder="Ex. : remboursement d’assurance" value="' + esc(f.lib) + '" data-pfi="lib" aria-label="Ce que c’est">' +
    '<div class="mp-montant"><input class="champ" id="mp-montant" inputmode="decimal" autocomplete="off" placeholder="Montant" value="' + esc(f.montant) + '" data-pfi="montant" aria-label="Montant, en euros"><span>€</span></div></div>' +
    '<div class="lv-reglage"><div class="puces-m">' + [['depense', 'Une dépense'], ['rentree', 'Une rentrée']].map(([v, l]) => '<button type="button" class="pm" data-pf="sens" data-v="' + v + '" aria-pressed="' + (f.sens === v) + '">' + l + '</button>').join('') +
    [['une', 'Une fois'], ['mois', 'Chaque mois']].map(([v, l]) => '<button type="button" class="pm" data-pf="freq" data-v="' + v + '" aria-pressed="' + (f.freq === v) + '">' + l + '</button>').join('') + '</div></div>' +
    '<div class="lv-reglage"><span class="lv-r-lib">' + (f.freq === 'mois' ? 'À partir de' : 'En') + '</span><div class="puces-m">' + moisChoix(0, 6).map(([v, l]) => '<button type="button" class="pm" data-pf="mois" data-v="' + v + '" aria-pressed="' + (f.mois === v) + '">' + l + '</button>').join('') + '</div></div>' +
    '<p class="mp-erreur" id="mp-erreur" hidden>Indiquez un montant, par exemple 1 500.</p>' +
    '<div class="mp-boutons"><button class="bouton petit ambre" type="submit">' + ic('ajout') + '<span>Ajouter au plan</span></button><button class="bouton petit" type="button" data-action="plan-ajout-annuler">Annuler</button></div></form>';
  const plus = p.mouvements.length >= 8 ? '<p class="lv-note">Huit mouvements au plus : retirez-en un pour en ajouter.</p>' :
    '<div class="mp-actions"><button class="bouton petit" type="button" data-action="plan-ajout">' + ic('ajout') + '<span>Ajouter un mouvement</span></button></div>' +
    '<div class="mp-idees"><span>Exemples :</span>' + IDEES_MVT.map((x, i) => '<button type="button" data-action="plan-idee" data-i="' + i + '">' + esc(x.lib) + ', ' + eur(x.montant * 100, false, true) + ' en ' + MOIS_PLAN[x.mois] + '</button>').join('') + '</div>';
  return '<div class="mp-tete"><b>Vos mouvements</b><span>Une dépense ou une rentrée que vous connaissez déjà : ajoutez-la à son mois.</span></div>' +
    (liste ? '<div class="mp-liste">' + liste + '</div>' : '') + (f.ouvert ? form : plus);
}
// l'étiquette du point bas se pose à côté du point quand un événement l'occupe déjà
function marquePointBas(plan, ev) {
  const coul = plan.niveau === 'ok' ? 'var(--bleu)' : 'var(--rouge)', lib = 'Point bas ' + keur(plan.bas);
  if (plan.kb === 0) return { i: 0, lib, dy: 24, ancre: 'start', coul };
  if (ev.some((x) => x.i === plan.kb)) return { i: plan.kb, lib, coul, eviter: true };
  return { i: plan.kb, lib, dy: -14, ancre: 'middle', coul };
}
function svgPlan(pts, plan, w) {
  const etroitG = w < 560;
  const ev = evenementsPlan(ETAT.plan);
  const mg = { g: 54, d: etroitG ? 16 : 92 };
  const ref = PLAN_REF.pts;
  return svgCourbe({ id: 'plan', titre: 'Trésorerie prévue de mi-octobre à fin avril', w, h: etroitG ? 280 : 350, pts: pts.map((v, i) => ({ v, lib: maj(SIM.quand[i]) + ' (' + dCourt(SIM.dates[i]) + ')' })), margeG: mg.g, margeD: mg.d, margeH: ev.length ? 40 : (etroitG ? 20 : 34), serie: 'Avec vos décisions',
    fantome: { vals: ref, lib: 'Sans rien changer' }, curseur: ETAT.plan.lecture,
    seuils: [{ v: SIM.seuil, lib: '1 facture Logista', cls: 'seuil-att', txtCls: 'att' }, { v: SIM.alerte, lib: 'Alerte 5 000 €', txtCls: 'ko' }], seuilsDedans: etroitG, seuilsFin: etroitG,
    axeX: SIM.axe.map((l, k) => ({ i: k * 2, lib: l, ancre: k === 0 ? 'start' : 'middle' })),
    marques: [marquePointBas(plan, ev)],
    finLib: etroitG ? false : keur(pts[pts.length - 1]) + ' fin avril', evenements: ev.map((x, k) => ({ i: x.i, n: k + 1 })) }) +
    '<div class="plan-date" style="margin-left:' + (mg.g - 11) + 'px;margin-right:' + (mg.d - 11) + 'px"><input class="curseur date" type="range" id="plan-date" min="0" max="13" step="1" value="' + ETAT.plan.lecture + '" style="--p:' + (ETAT.plan.lecture / 13 * 100).toFixed(1) + '%" aria-label="Lire la trésorerie à une date" aria-valuetext="' + esc(maj(SIM.quand[ETAT.plan.lecture]) + ', ' + eur(pts[ETAT.plan.lecture] * 100)) + '"></div>' +
    '<p class="plan-date-aide">' + ic('gauche') + 'Touchez la courbe ou glissez pour lire une date' + ic('droite') + '</p>' +
    (ev.length ? '<ol class="evts">' + ev.map((x, k) => '<li><span class="evt-n">' + (k + 1) + '</span><span><b>' + esc(x.txt) + '</b> <small>' + esc(x.sous) + '</small></span></li>').join('') + '</ol>' : '');
}
let PLAN_PTS = null;
const rangeActif = () => !!(document.activeElement && document.activeElement.type === 'range');
function dessinerPlan(anim) {
  const el = $('#plan-graphe');
  if (!el) return;
  const plan = calculPlan();
  const cible = plan.pts.slice();
  const depart = PLAN_PTS && PLAN_PTS.length === cible.length ? PLAN_PTS : cible;
  PLAN_PTS = cible;
  const w = Math.round(el.getBoundingClientRect().width) || 700;
  if (!anim || mouvementReduit() || depart === cible) { el.innerHTML = svgPlan(cible, plan, w); return; }
  const t0 = performance.now(), dur = 560;
  const pas = (t) => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.innerHTML = svgPlan(cible.map((v, i) => depart[i] + (v - depart[i]) * e), plan, w);
    if (k < 1) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
}
// la lecture à une date : le chiffre et le curseur bougent, sans redessiner la courbe
function placerLecture(i) {
  const g = $('#plan-graphe .curseur-g');
  if (g) {
    const xs = g.dataset.xs.split(','), ys = g.dataset.ys.split(',');
    const l = g.querySelector('line'), c = g.querySelector('circle');
    l.setAttribute('x1', xs[i]); l.setAttribute('x2', xs[i]);
    c.setAttribute('cx', xs[i]); c.setAttribute('cy', ys[i]);
  }
  const plan = calculPlan();
  const k = $('#plan-kpis'); if (k) k.innerHTML = htmlKpisPlan(plan);
  const r = $('#plan-date'); if (r) { r.setAttribute('aria-valuetext', maj(SIM.quand[i]) + ', ' + eur(plan.pts[i] * 100)); r.style.setProperty('--p', (i / 13 * 100).toFixed(1) + '%'); }
}
function ecartRef(v, r) {
  const d = Math.round(v - r);
  return Math.abs(d) < 1 ? 'comme sans rien changer' : '<b class="' + (d > 0 ? 'positif' : 'negatif') + '">' + eur(d * 100, false, true) + '</b> face à « sans rien changer »';
}
function htmlKpisPlan(plan) {
  const i = ETAT.plan.lecture;
  return '<div class="plan-kpi lecture-k"><span>' + maj(SIM.quand[i]) + ' <em>' + dCourt(SIM.dates[i]) + '</em></span><b>' + eur(plan.pts[i] * 100) + '</b><small>' + (i === 0 ? 'votre départ, après la facture Logista' : ecartRef(plan.pts[i], PLAN_REF.pts[i])) + '</small></div>' +
    '<div class="plan-kpi"><span>Point bas</span><b>' + eur(plan.bas * 100) + '</b><small>' + SIM.quand[plan.kb] + '</small></div>' +
    '<div class="plan-kpi"><span>Au point bas</span><b>' + F1.format(plan.bas / SIM.seuil) + '</b><small>facture Logista d’avance</small></div>';
}
function htmlResumePlan(plan) {
  return '<span class="ciel-n ' + (plan.niveau === 'ok' ? '' : plan.niveau) + '">' + ic(plan.niveau === 'ok' ? 'soleil' : 'nuage') + plan.ciel + '</span><span>Fin avril <b>' + eur(plan.fin * 100) + '</b></span><span>Point bas <b>' + eur(plan.bas * 100) + '</b></span>';
}
function cielP(plan) { return '<span class="ciel ' + (plan.niveau === 'ok' ? '' : plan.niveau) + '">' + ic(plan.niveau === 'ok' ? 'soleil' : 'nuage') + plan.ciel + '</span>'; }
function majZonesPlan(refaire = true) {
  const zone = $('#plan');
  if (!zone) return false;
  const plan = calculPlan();
  if (refaire) {
    const a = document.activeElement;
    const cle = a && a.dataset ? (a.dataset.plan ? '[data-plan="' + a.dataset.plan + '"][data-v="' + a.dataset.v + '"]' : a.classList && a.classList.contains('bascule') && a.parentNode.dataset.levier ? '[data-levier="' + a.parentNode.dataset.levier + '"] .bascule' : '') : '';
    const l = $('#leviers'); if (l) l.innerHTML = htmlLeviers();
    const sc = $('#plan-scen'); if (sc) sc.innerHTML = htmlScenarios();
    const m = $('#plan-mvts'); if (m) m.innerHTML = htmlMvtsPlan();
    if (cle) { const n = $(cle); if (n) n.focus({ preventScroll: true }); }
  }
  const k = $('#plan-kpis'); if (k) k.innerHTML = htmlKpisPlan(plan);
  const c = $('#plan-ciel'); if (c) c.innerHTML = cielP(plan);
  const r = $('#plan-resume'); if (r) r.innerHTML = htmlResumePlan(plan);
  const t = $('#plan-table'); if (t) t.innerHTML = htmlPlanTable(plan);
  const ai = $('#plan-aide'); if (ai) ai.innerHTML = htmlPlanAide(plan);
  dessinerPlan(!rangeActif());
  const ns = $('#plan-note'); if (ns) ns.innerHTML = notePlan(plan);
  return true;
}
function notePlan(plan) {
  return plan.niveau === 'ok' ? 'Toujours au moins une facture Logista d’avance, même au point bas.' :
    maj(SIM.quand[plan.kb]) + ', il vous resterait ' + eur(plan.bas * 100) + ' : il manquerait ' + eur(plan.manque * 100) + ' pour garder une facture Logista d’avance. Le cockpit vous prévient des semaines avant, le temps de décaler ou de financer.';
}
function vueTresorerieV3() {
  const plan = calculPlan();
  const prochainFdj = D.releves.fdj.find((r) => r.prelevement >= AUJ);
  PLAN_PTS = null;
  const c = D.comptes;
  const cpts = [['bnp', 'BNP', '#3a63d6'], ['bp', 'BP', '#6b4fd1'], ['fdj', 'FDJ', '#d0631f'], ['caisse', null, '#9c5a00', 'billet'], ['cb', null, '#16a596', 'carte']];
  const comptesHtml = '<div class="comptes-l">' + cpts.map(([k, ini, coul, icn]) => '<div class="cpt-l"><span class="src-ic" style="background:' + coul + '">' + (icn ? ic(icn) : ini) + '</span><b>' + COMPTES[k].nom + '</b><span class="src-d">' + COMPTES[k].role + '</span><span class="l-mt">' + eur(c[k]) + '</span></div>').join('') +
    '<div class="cpt-l total"><span class="src-ic" style="background:var(--nuit-2)">' + ic('jauge') + '</span><b>Disponible ce soir</b><span class="src-d">Lundi après Logista : ' + eur(ATT.total) + '</span><span class="l-mt">' + compte(c.total, 'grosE') + '</span></div></div>';
  const SEMV = SEM.map((x) => x.solde / 100);
  const iSoir = SEM.findIndex((x) => x.date === AUJ);
  const semaine = graphe((w) => {
    const etroitG = w < 560;
    return svgColonnes({ id: 'sem2', titre: 'Trésorerie chaque soir', w, h: etroitG ? 250 : 300, vals: SEMV, largeur: etroitG ? 22 : 54, basAxe: etroitG ? 46 : 62, margeG: etroitG ? 38 : 50, margeH: 26,
      couleurs: SEM.map((x, i) => (i === 0 ? 'var(--m3)' : i === SEM.length - 1 ? 'var(--rouge)' : 'var(--bleu)')),
      labels: SEM.map((x, i) => (etroitG ? J[jour(x.date).getDay()].charAt(0).toUpperCase() + jour(x.date).getDate() : (i === 0 ? 'Départ, ' : '') + x.jour)), labelClasse: (i) => (i === SEM.length - 1 ? 'rouge' : i === iSoir ? 'fort' : ''),
      prevu: (i) => SEM[i].statut === 'prévu' && i < SEM.length - 1,
      etiquette: (i) => (etroitG ? (i === 0 || i === iSoir || i === SEM.length - 1 ? keur(SEMV[i]) : '') : F0.format(SEMV[i]) + NB + '€'), etiquetteClasse: (i) => (i === SEM.length - 1 ? 'rouge' : 'fort'),
      sous: (i) => (SEM[i].sorties.length ? (etroitG ? (SEM[i].sorties[0][1] >= 500000 ? keur(-SEM[i].sorties[0][1] / 100) : '') : [SEM[i].sorties[0][0], keur(-SEM[i].sorties[0][1] / 100)]) : ''),
      tips: (i) => '<b>' + maj(dLong(SEM[i].date)) + (SEM[i].statut === 'prévu' ? ' (prévu)' : i === iSoir ? ' (ce soir)' : '') + '</b>' + ligneTip('', 'Solde à 21 h', eur(SEM[i].solde)) + (SEM[i].entrees ? ligneTip('', 'Encaissements nets', '+' + eur(SEM[i].entrees)) : '') + SEM[i].sorties.map((s) => ligneTip('', s[0], eur(-s[1]))).join('') });
  });
  return pageTete({ titre: 'Trésorerie', sous: 'Vos banques lues ce soir à 21 h 02. Chaque prélèvement connu est déjà placé, jusqu’à la facture Logista de lundi, puis sur six mois.', actions: cielN(plan) }) +
    '<div class="grille">' +
    '<section class="heros colonne anime s7"><div class="h-eyebrow">' + ic('calendrier') + 'Lundi 19 octobre, après la facture tabac ' + (plan.niveau === 'ok' ? pill('n ok', 'Ça passe', 'coche') : pill('n att', 'À anticiper', 'alerte')) + '</div>' +
      '<div class="h-montant"><span class="chiffre-xl">' + compte(ATT.total, 'grosE') + '</span></div>' +
      '<p class="h-ligne">Après ' + eur(4010000) + ' de prélèvements connus d’ici lundi, dont la facture Logista de ' + eur(2933000) + '. Au plus bas des six prochains mois : <b>' + F1.format(plan.bas / SIM.seuil) + ' facture Logista d’avance</b>.</p>' +
      '<div class="h-duo"><div class="h-mini ambre"><span class="chiffre-s">' + compte(3240000, 'grosE') + '</span><span>à virer de la BNP vers la Banque Populaire <b>avant jeudi</b>, pour les recharges et Logista</span></div>' +
      '<div class="h-mini"><span class="chiffre-s">' + compte(VAV.vraiment, 'grosE') + '</span><span><b>vraiment à vous</b> lundi soir, une fois les jeux, les recharges et les timbres mis de côté</span></div></div>' +
      (prochainFdj ? '<div class="h-pied" style="margin-top:auto"><span class="pill n">' + ic('ticket') + 'Prélèvement FDJ ' + dCourt(prochainFdj.prelevement) + ' : ' + eur(prochainFdj.solde) + '</span><button class="lien-bouton" type="button" data-action="vers-plan">Votre plan de vol ' + ic('fleche') + '</button></div>' : '') + '</section>' +
    '<div class="s5">' + carteP('Vos comptes, ce soir', 'Lus à 21 h 02, en lecture seule', comptesHtml, { cls: 'grandit' }) + '</div></div>' +
    carteP('Votre semaine, soir après soir', 'Départ dimanche ' + eur(SEM[0].solde) + ', atterrissage lundi ' + eur(SEM[SEM.length - 1].solde), semaine +
      '<div class="legende"><span><i style="background:var(--bleu)"></i>Réel</span><span><i style="background:repeating-linear-gradient(45deg,var(--bleu) 0 2px,transparent 2px 5px);box-shadow:inset 0 0 0 1px var(--bleu)"></i>Prévu</span><span><i style="background:var(--rouge)"></i>Atterrissage</span><span class="discret">Encaissements prévus : 5 090 € par jour, moyenne prudente des quatre dernières semaines</span></div>' + htmlEquationSemaine(), { actions: boutonsExport('semaine') }) +
    secTete('Votre plan de vol, <em>à vous de jouer</em>', 'Chaque décision, à sa date et à son montant. Ajoutez ce que vous savez déjà : le cockpit recalcule les six prochains mois, quinzaine par quinzaine.', 'sec-plan') +
    '<div class="plan anime" id="plan"><div class="verre plan-cmd"><div class="p-tete"><div><h2>Vos décisions</h2><span class="p-sous">Partez d’un scénario, puis réglez chaque décision : son mois, son montant</span></div></div>' +
      '<div class="lv-reglage plan-scen" id="plan-scen">' + htmlScenarios() + '</div><div class="leviers" id="leviers">' + htmlLeviers() + '</div>' +
      '<div class="mp" id="plan-mvts">' + htmlMvtsPlan() + '</div>' +
      '<div class="p-pied" style="border-top-color:var(--verre-bord)"><button class="bouton petit" type="button" data-action="plan-defaut">' + ic('retour') + '<span>Revenir au plan de départ</span></button></div>' +
      '<div class="plan-resume" id="plan-resume" aria-live="polite">' + htmlResumePlan(plan) + '</div></div>' +
    '<section class="papier plan-carte"><div class="p-tete"><div><h2>Votre trésorerie, jusqu’à fin avril</h2><span class="p-sous" id="plan-note">' + notePlan(plan) + '</span></div><div class="p-actions" id="plan-ciel">' + cielP(plan) + '</div></div>' +
      '<div class="plan-kpis" id="plan-kpis">' + htmlKpisPlan(plan) + '</div>' + graphe((w) => { PLAN_PTS = calculPlan().pts.slice(); return svgPlan(PLAN_PTS, calculPlan(), w); }).replace('class="graphe"', 'class="graphe" id="plan-graphe"') +
      '<div class="legende"><span><i class="ligne-cle" style="background:var(--bleu)"></i>Avec vos décisions</span><span><i class="ligne-cle tirets"></i>Sans rien changer</span><span><i class="ligne-cle" style="background:var(--ambre)"></i>Une facture Logista d’avance (29 330 €)</span><span><i class="ligne-cle" style="background:var(--rouge)"></i>Alerte à 5 000 €</span></div></section></div>' +
    '<div id="plan-aide">' + htmlPlanAide(plan) + '</div>' +
    basculeDetail('Quinzaine par quinzaine, 14 semaines d’historique, mouvements bancaires, charges fixes.', detailTresorerieV3);
}
function detailTresorerieV3() {
  const onglets = [['plan', 'Quinzaine par quinzaine'], ['quatorze', '14 semaines'], ['mouvements', 'Mouvements bancaires'], ['fixes', 'Charges fixes']];
  if (!onglets.some((o) => o[0] === ETAT.tabTreso)) ETAT.tabTreso = 'plan';
  let corps = '';
  if (ETAT.tabTreso === 'plan') corps = carte('Quinzaine par quinzaine', '<div id="plan-table">' + htmlPlanTable(calculPlan()) + '</div>', { meta: 'Activité courante : ventes moins achats, charges et échéances connues (URSSAF, TVA, loyer, CFE en décembre)', actions: boutonsExport('plan') });
  if (ETAT.tabTreso === 'quatorze') corps = ongletQuatorze();
  if (ETAT.tabTreso === 'mouvements') corps = ongletMouvements();
  if (ETAT.tabTreso === 'fixes') corps = ongletFixes();
  return '<div class="onglets sur-nuit">' + seg('treso', onglets, ETAT.tabTreso) + '</div>' + corps;
}

/* ================================================================== RÉSULTAT */
function vueResultatV3() {
  const att = pnlDe('att'), sep = pnlDe(9);
  const rAtt = resultatDe(att), rSep = resultatDe(sep);
  const cumul = D.pnl.slice(0, 9).reduce((s, p) => s + resultatDe(p), 0) + rAtt;
  const cbdX = F0.format(D.pnl_att.produits.cbd_ventes / D.pnl[3].produits.cbd_ventes);
  const cles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'att'];
  const X = cles.map(pnlDe);
  const series = ACTIVITES.map((a) => ({ lib: a.lib, coul: a.coul, vals: cles.map((k) => margeActivite(pnlDe(k).produits, a) / 100) }));
  const margeCumul = X.reduce((s, x) => s + margeTotale(x.produits), 0);
  const empile = graphe((w) => svgEmpile({ id: 'marges', titre: 'Marge brute par activité, de janvier à octobre', w, h: w < 560 ? 260 : 320, labels: cles.map((k) => (k === 'att' ? 'oct.*' : M[k - 1])), series, pasLabels: w < 480 ? 3 : 0, largeur: 46,
    titresX: cles.map((k) => (k === 'att' ? 'Octobre, atterrissage' : maj(ML[k - 1]))), hachure: (i) => i === 9, libTotal: 'Marge brute',
    etiquette: (i) => (i === 9 || (w >= 560 && (i === 8 || i === 0)) ? keur(series.reduce((s, se) => s + se.vals[i], 0)) : '') }));
  const resV = X.map((x) => resultatDe(x) / 100);
  const iMax = resV.indexOf(Math.max(...resV.slice(0, 9)));
  const resMois = graphe((w) => svgColonnes({ id: 'mr', titre: 'Votre résultat, mois par mois, de janvier à octobre', w, h: w < 560 ? 240 : 270, vals: resV, largeur: 34, margeH: 28,
    labels: cles.map((k) => (k === 'att' ? 'oct.*' : M[k - 1])), pasLabels: w < 420 ? 3 : 0, dernierLabel: true,
    couleurs: resV.map(() => 'var(--vert)'), prevu: (i) => i === 9,
    etiquette: (i) => (w < 400 ? (i === 9 || i === iMax ? keur(resV[i]) : '') : keur(resV[i])), etiquetteClasse: (i) => (i === 9 ? 'fort ok' : 'fort'),
    tips: (i) => '<b>' + (i === 9 ? 'Octobre, atterrissage' : maj(ML[i])) + '</b>' + ligneTip('var(--vert)', 'Votre résultat', eur(resV[i] * 100)) + ligneTip('', 'Marge brute', eur(margeTotale(X[i].produits))) + ligneTip('', 'Charges', eur(chargesTotales(X[i].charges))) }));
  const R = D.ratios, r9 = R[8];
  const ratio = (icn, coul, lib, val, sous, etat) => '<div class="ligne ratio-l"><span class="ic-pastille ' + coul + '">' + ic(icn) + '</span><div class="l-txt"><b>' + lib + ' : ' + val + '</b><span>' + sous + '</span></div>' + etat + '</div>';
  return pageTete({ titre: 'Résultat', sous: 'Ce que vous gagnez chaque mois, rayon par rayon, sans attendre le bilan.' }) +
    '<div class="grille">' +
    '<section class="heros anime s5"><div class="h-eyebrow">' + ic('resultat') + 'Octobre, résultat attendu ' + pill('n ok', pctS((rAtt - rSep) / Math.abs(rSep) * 100) + ' sur septembre') + '</div>' +
      '<div class="h-montant"><span class="chiffre-xl vert-txt">' + compte(rAtt, 'grosE') + '</span></div>' +
      '<p class="h-ligne">Avant votre rémunération et avant impôt. Réel jusqu’au 13, puis le reste du mois au rythme des quatre dernières semaines.</p>' +
      '<div class="h-duo"><div class="h-mini"><span class="chiffre-s">' + compte(cumul, 'grosE') + '</span><span>de résultat depuis <b>janvier</b>, octobre compris</span></div>' +
      '<div class="h-mini rose"><span class="chiffre-s">×' + cbdX + '</span><span>les ventes de <b>CBD</b> depuis avril, chaque produit suivi par lot</span></div></div></section>' +
    '<div class="s7">' + carteP('Où va la marge d’octobre', eur(margeTotale(att.produits)) + ' de marge brute, partagés ainsi', htmlOuVaLaMarge('att'), { cls: 'grandit' }) + '</div></div>' +
    carteP('Vos ventes, rayon par rayon', 'La marge de chaque mois, et ce qui la compose', '<div class="legende" style="margin-bottom:6px">' + ACTIVITES.map((a) => '<span><i style="background:' + a.coul + '"></i>' + a.lib + '</span>').join('') + '</div>' + empile + '<p class="bloc-note">* Octobre : réel au 13, puis le reste du mois au rythme des quatre dernières semaines.</p>',
      { actions: '<div class="mc" style="padding:8px 14px;gap:2px"><span>Marge cumulée 2026</span><b style="font-size:24px">' + compte(margeCumul, 'grosE') + '</b></div>' }) +
    '<div class="grille">' +
    '<div class="s6">' + carteP('Ce que rapporte chaque rayon', 'Octobre, comparé à septembre', htmlRayons('att', 9), { cls: 'grandit' }) + '</div>' +
    '<div class="s6">' + carteP('Mois par mois, votre résultat', 'Ce qui reste une fois toutes les charges payées, avant votre rémunération', resMois + '<p class="bloc-note">Meilleur mois : ' + ML[iMax] + ', ' + eur(resV[iMax] * 100) + '. * Octobre : atterrissage.</p>', { cls: 'grandit' }) + '</div></div>' +
    carteP('Les ratios qui racontent le mois', 'Septembre : ce que l’administration verra avec la facture électronique, autant que l’histoire soit propre', '<div class="liste">' +
      ratio('tasse', 'ambre', 'Café', r9.tasses_kg + ' tasses par kilo', nb(r9.tasses) + ' cafés vendus pour ' + r9.cafe_kg + ' kg achetés, environ 138 attendues', pastille('att', 'À vérifier')) +
      ratio('euro', 'ambre', 'Boissons', pct(r9.boissons_reel) + ' de marge', pct(r9.boissons_theo) + ' attendus : boissons offertes, casse ou prix de rayon pas à jour', pastille('att', 'À vérifier')) +
      ratio('billet', 'vert', 'Espèces', eur(r9.especes_ecart) + ' d’écart', 'Sur le mois de septembre, collectes rapprochées des Z de caisse', pastille('ok', 'Dans la tolérance')) +
      ratio('ticket', 'vert', 'Jeux FDJ', pct(D.releves.fdj.slice(-8).reduce((s, r) => s + r.commission, 0) / D.releves.fdj.slice(-8).reduce((s, r) => s + r.ventes, 0) * 100, 2) + ' de commission', 'Conforme sur chaque relevé des huit dernières semaines', pastille('ok', 'Conforme')) +
    '</div>') +
    basculeDetail('Le compte de résultat mois par mois, rayon par rayon, tous les ratios, la facture électronique.', detailRentabilite);
}

/* ================================================================== FACTURES : la boîte */
function vueFacturesV3() {
  const f = ETAT.fact;
  const aPayer = D.factures.filter((x) => x.statut === 'À payer');
  const lignes = D.factures.reduce((s, x) => s + x.lignes.length, 0);
  return pageTete({ titre: 'Factures', sous: 'Une seule boîte reçoit tout : Logista, la FDJ, le PMU, vos fournisseurs. Chaque facture est lue ligne par ligne, rangée et rapprochée de la banque, sans saisie.' }) +
    '<div class="puces-resume anime"><span>' + ic('facture') + '<b>' + D.factures.length + '</b> factures depuis juillet</span><span>' + ic('coche') + '<b>' + nb(lignes) + '</b> lignes rangées, 0 saisie</span><span>' + ic('horloge') + '<b>' + aPayer.length + '</b> à payer : ' + eur(aPayer.reduce((s, x) => s + x.ttc, 0)) + '</span><span>' + ic('alerte') + '<b>1</b> hausse de prix repérée</span><span>' + ic('banque') + '<b>100 %</b> rapprochées</span></div>' +
    '<section class="papier anime"><div class="boite">' +
    '<div><div class="outils"><input class="champ grandit" type="search" id="q-fact" placeholder="Fournisseur, produit, montant…" value="' + esc(f.q) + '" data-filtre="fact.q">' + boutonsExport('factures', ['xlsx']) + '</div>' +
    '<div class="outils">' + seg('factstatut', [['tous', 'Toutes'], ['apayer', 'À payer'], ['payee', 'Payées']], f.statut) +
    '<select class="champ grandit" data-filtre="fact.cat" aria-label="Catégorie"><option value="toutes">Catégories</option>' + CATS_FACT.map((c) => '<option' + (f.cat === c ? ' selected' : '') + '>' + esc(c) + '</option>').join('') + '</select></div>' +
    '<div class="boite-liste" id="zone-fact">' + htmlListeFactures() + '</div></div>' +
    '<div class="lecteur cache-etroit" id="lecteur"><div class="papier serre" style="background:var(--papier-blanc)" id="lecteur-corps">' + htmlLecteur(f.choisie) + '</div></div></div></section>';
}

/* ================================================================== STOCK */
function serieRef(r) {
  const avant = r.v4 / (1 + r.tendance / 100);
  let g = 7;
  for (const ch of r.code) g = (g * 31 + ch.charCodeAt(0)) % 9973;
  const pts = [];
  for (let k = 0; k < 8; k++) {
    const t = k / 7;
    const base = (avant + (r.v4 - avant) * (t * t * (3 - 2 * t))) / 4;
    pts.push(Math.max(0.2, base * (1 + (((g * (k + 3)) % 17) - 8) / 70)));
  }
  return pts;
}
function vueStockV3() {
  const refs = D.refs;
  const tri = refs.slice().sort((a, b) => b.tendance - a.tendance);
  const suivies = tri.slice(0, 3).concat(tri.slice(-2).reverse().slice(0, 2).reverse());
  const NIV = { 'À recommander': 'info', 'À arrêter': 'ko', 'À réduire': 'att', 'En rayon': 'ok' };
  const reco = refs.filter((r) => r.statut === 'À recommander').sort((a, b) => b.tendance - a.tendance);
  let totCmd = 0;
  const cmd = reco.map((r) => { const q = ETAT.commande[r.code] != null ? ETAT.commande[r.code] : quantiteCommande(r); totCmd += q * r.pa; return { r, q }; });
  const t = D.stock_tot;
  const pctE = STOCK_ECART / t.theo * 100;
  const lemon = D.cbd_refs[0];
  return pageTete({ titre: 'Stock', sous: 'Le stock théorique (achats lus sur les factures, moins les ventes de la caisse) comparé chaque soir à Strator, référence par référence.' }) +
    '<div class="grille">' +
    '<div class="s5">' + carteP('Votre stock, vérifié chaque soir', 'Au prix d’achat, ce soir à 21 h 04',
      '<div class="stock-duo"><div class="sd"><div class="sd-tete"><span>Stock théorique</span><b>' + compte(t.theo, 'grosE') + '</b></div><div class="sd-barre"><i class="etire-x" style="width:100%;background:var(--bleu)"></i></div></div>' +
      '<div class="sd"><div class="sd-tete"><span>Dans Strator</span><b>' + compte(t.strator, 'grosE') + '</b></div><div class="sd-barre"><i class="etire-x" style="--k:1;width:' + (t.strator / t.theo * 100).toFixed(2) + '%;background:var(--vert)"></i></div></div>' +
      '<div class="tolerance"><b>' + eur(STOCK_ECART) + '</b><span>d’écart, soit <b>' + pct(pctE) + '</b> : sous la tolérance de 2' + NB + '%. Rien ne manque en rayon.</span></div></div>' + htmlTopEcarts(), { cls: 'grandit' }) + '</div>' +
    '<div class="s7">' + carteP('Chaque référence suivie', refs.length + ' références de cigarette électronique, analysées chaque semaine', '<div class="refs-l">' + suivies.map((r) => {
      const s = serieRef(r);
      const coul = r.tendance >= 0 ? 'var(--vert)' : r.statut === 'À arrêter' ? 'var(--rouge)' : 'var(--ambre)';
      return '<div class="ref"><div><b>' + esc(r.designation) + '</b><span class="r-sous">' + r.stock + ' en rayon · ' + r.v4 + ' vendus en 4 semaines</span></div>' + svgEtincelle(s, coul, 120, 32) + '<span class="r-t ' + (r.tendance >= 0 ? 'positif' : 'negatif') + '">' + pctS(r.tendance) + '</span>' + pastille(NIV[r.statut], r.statut) + '</div>';
    }).join('') + '</div>' + '<div class="ref-pied">' + ['En rayon', 'À recommander', 'À réduire', 'À arrêter'].map((st) => pastille(NIV[st], refs.filter((r) => r.statut === st).length + ' ' + st.toLowerCase())).join('') + '</div>', { cls: 'grandit colonne', actions: lienPage('stock', 'Les ' + refs.length + ' références', ' data-onglet="vape"') }) + '</div></div>' +
    '<div class="grille">' +
    '<div class="s7">' + carteP('La commande de jeudi', 'Ce qui part le plus vite, pour trois semaines de ventes · passée par Logista', '<div class="liste">' + cmd.slice(0, 5).map(({ r, q }) =>
      '<div class="ligne"><span class="ic-pastille vert">' + ic('vape') + '</span><div class="l-txt"><b>' + esc(r.designation) + '</b><span>' + r.stock + ' en rayon · ventes <b class="positif">' + pctS(r.tendance, Math.abs(r.tendance) < 10 ? 1 : 0) + '</b> sur 4 semaines</span></div><span class="l-mt empile">' + q + '<small>à commander</small></span></div>').join('') + '</div>' +
      '<div class="p-pied" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span class="discret">' + reco.length + ' références, <b style="color:var(--encre)">' + eur(totCmd) + ' HT</b> au total</span><span style="display:flex;gap:8px"><button class="bouton petit" type="button" data-action="copier-commande">' + ic('copie') + '<span>Copier la commande</span></button></span></div>', { cls: 'grandit' }) + '</div>' +
    '<div class="s5">' + carteP('Votre CBD, étiqueté et suivi', 'Lot, date, traçabilité : chaque produit a sa fiche',
      '<div class="etiq-scene"><div class="etiq"><div><p class="etiq-marque">Comptoir CBD</p><p class="etiq-var">' + esc(lemon.designation) + '</p><p class="etiq-det">Lot ' + esc(lemon.lot) + '<br>Conditionné le ' + dNumA(lemon.conditionne) + '<br>THC ' + F2.format(lemon.thc) + NB + '% · analyse reçue</p></div>' + QR_CBD + '<span class="etiq-code" aria-hidden="true"></span></div></div>' +
      '<div class="p-pied"><span class="discret">' + D.cbd_refs.length + ' produits CBD suivis par lot, ' + nb(D.cbd_refs.reduce((s, r) => s + r.stock, 0)) + ' en stock. Ventes ×' + F0.format(D.pnl_att.produits.cbd_ventes / D.pnl[3].produits.cbd_ventes) + ' depuis avril.</span></div>', { cls: 'grandit' }) + '</div></div>' +
    basculeDetail('Les 148 références vape, le CBD par lot, les écarts par famille, la commande complète.', detailStock);
}

/* ================================================================== MISE EN PLACE */
function vueMiseV3() {
  return pageTete({ titre: 'Mise en place', sous: 'Sans aucun mot de passe. Le cockpit reçoit ce que vous et vos partenaires lui envoyez, et lit vos banques en lecture seule. Chaque accès se coupe en un clic.' }) +
    '<div class="grille">' +
    '<section class="heros colonne anime s7"><div class="h-eyebrow">' + ic('source') + 'Votre cockpit, opérationnel en</div>' +
      '<div class="h-montant"><span class="chiffre-xl">4 semaines</span></div>' +
      '<p class="h-ligne">Comme une grande entreprise : toute l’information au même endroit, la caisse, les banques, la FDJ, le PMU, Logista, vos fournisseurs et l’État. Et chaque mois, une lecture avec votre propre contrôleur de gestion.</p>' +
      '<div class="pills" style="margin-top:16px">' + pill('n ok', '0 mot de passe à donner', 'cadenas') + pill('n', '1 lecture par mois avec vous', 'calendrier') + pill('n', 'Tout s’exporte : Excel, CSV, PDF', 'export') + '</div>' +
      '<div class="semaines4">' + [['Semaine 1', 'Mandat, factures, banques', 'La boîte factures est créée, six mois de banque lus d’un coup'], ['Semaine 2', 'Caisse et jeux', 'Export Strator chaque soir, premiers contrôles FDJ et PMU'], ['Semaine 3', 'Achats et stock', 'Factures lues ligne par ligne, stock face à Strator'], ['Semaine 4', 'Plan de vol', 'Six mois devant vous, et votre première lecture']].map((x) => '<div class="s4-e"><span class="s4-n">' + x[0] + '</span><b>' + x[1] + '</b><span>' + x[2] + '</span></div>').join('') + '</div></section>' +
    '<div class="s5">' + carteP('Vos sources, ce soir', 'Ce que le cockpit a reçu aujourd’hui', htmlSources(), { cls: 'grandit' }) + '</div></div>' +
    '<div class="grille">' +
    '<div class="s6">' + carteP('Chaque mois, une lecture avec vous', 'Comme si votre tabac avait son propre contrôleur de gestion : les outils, et le conseil',
      '<div class="rdv"><span class="ic-pastille nuit">' + ic('calendrier') + '</span><div><b>Jeudi 5 novembre, 10 h</b><span>Lecture d’octobre, 45 minutes</span></div></div>' +
      '<ul class="ordre"><li>Atterrissage d’octobre et marge par rayon</li><li>Agencement : choisir la date et monter le dossier d’aide</li><li>Embauche pour fermer à 23\u00a0h : le bon mois</li></ul>' +
      '<div class="carte-actions"><button class="bouton petit" type="button" data-action="export" data-cle="pack" data-format="pdf">' + ic('pdf') + '<span>Pack de septembre pour le comptable</span></button></div>', { cls: 'grandit' }) + '</div>' +
    '<div class="s6">' + carteP('Ce qui reste à vous', 'Vos accès, vos données, votre décision', '<div class="liste">' +
      '<div class="ligne"><span class="ic-pastille">' + ic('cadenas') + '</span><div class="l-txt"><b>Vos identifiants restent chez vous</b><span>Ni code bancaire, ni mot de passe de caisse ou de jeux.</span></div></div>' +
      '<div class="ligne"><span class="ic-pastille">' + ic('croix') + '</span><div class="l-txt"><b>Chaque accès se coupe en un clic</b><span>Banque, boîte factures, exports : vous arrêtez quand vous voulez.</span></div></div>' +
      '<div class="ligne"><span class="ic-pastille">' + ic('export') + '</span><div class="l-txt"><b>Tout s’exporte</b><span>Excel, CSV et PDF, pour vous ou pour votre comptable.</span></div></div></div>', { cls: 'grandit' }) + '</div></div>' +
    '<section class="verre anime"><div class="p-tete"><div><h2>Pour un réseau de buralistes</h2><span class="p-sous">Un pilote de trois mois avec vingt buralistes volontaires. De leur côté, un simple export, avec l’accord de chaque buraliste. On mesure le temps gagné, les écarts retrouvés et la trésorerie sécurisée.</span></div></div></section>';
}

Object.assign(VUES, { cockpit: vueAccueil, caisse: vueCaisseV3, fdj: vueFdj, tresorerie: vueTresorerieV3, rentabilite: vueResultatV3, factures: vueFacturesV3, stock: vueStockV3, mise: vueMiseV3 });
