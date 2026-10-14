/* ==================================================================
   L'assistant : une question, une réponse calculée sur les chiffres du tabac.
   Démonstration : les réponses viennent des données d'exemple du Balto.
   ================================================================== */
const AS = { fil: [] };
const IDEES = ['Combien on a fait aujourd’hui ?', 'Où j’atterris lundi ?', 'Le contrôle FDJ est bon ?', 'Combien de TVA ce mois-ci ?', 'Il reste combien de Fraise glacée ?', 'Qui a appelé ce soir ?', 'Combien je vire à la FDJ ?', 'Combien d’espèces en caisse ?', 'Mon résultat d’octobre ?'];
const sansAccent = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const lienAs = (route, lib, extra = '') => '<br><button class="lien-bouton" type="button" data-action="aller" data-route="' + route + '"' + extra + '>' + lib + ' ' + ic('fleche') + '</button>';
function chercherRef(q) {
  const mots = sansAccent(q).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((m) => m.length > 3 && !['reste', 'combien', 'stock', 'flacons', 'flacon', 'encore', 'avez', 'avons', 'quelle', 'quel'].includes(m));
  if (!mots.length) return null;
  let meilleur = null, score = 0;
  D.refs.concat(D.cbd_refs.map((r) => Object.assign({ cbd: true }, r))).forEach((r) => {
    const d = sansAccent(r.designation);
    // à égalité, la référence la plus vendue (puis celle que le cockpit suit de près)
    const s = mots.filter((m) => d.includes(m)).length * 1000 + (r.cle ? 500 : 0) + Math.min(499, r.v4 || 0);
    if (mots.some((m) => d.includes(m)) && s > score) { score = s; meilleur = r; }
  });
  return meilleur;
}
function phrasePlanAs() {
  const pl = calculPlan();
  return pl.niveau === 'ok' ? 'Ça passe : au plus bas des six prochains mois, il restera ' + F1.format(pl.bas / SIM.seuil) + ' facture Logista d’avance.'
    : 'Lundi, ça passe. Mais avec votre plan de vol, ' + pl.ciel.charAt(0).toLowerCase() + pl.ciel.slice(1) + ' : ' + SIM.quand[pl.kb] + ', il resterait <b>' + eur(pl.bas * 100) + '</b>.';
}
function repondre(q) {
  const t = sansAccent(q);
  const a = (re) => re.test(t);
  const z = ZAUJ;
  const especes = joursDepuisCollecte().reduce((s, x) => s + x.net, 0);
  const prochain = D.releves.fdj.find((r) => r.prelevement >= AUJ);
  if (a(/bonjour|bonsoir|salut|coucou|hello/)) return 'Bonsoir Julien. Je réponds avec vos chiffres de ce soir : la caisse, la FDJ, la trésorerie, le stock, les factures et la boîte vocale. Que voulez-vous savoir ?';
  if (a(/merci/)) return 'Avec plaisir. Bonne soirée, et à demain pour le Z de 21 h.';
  if (a(/appel|message|vocal|repondeur|telephone|qui a/)) {
    const v = VOCAUX.filter((x) => x.date === AUJ);
    return '<b>' + v.length + ' messages aujourd’hui :</b><br>' + v.map((x) => '· ' + heureFr(x.h) + ', ' + esc(x.qui) + ' : ' + esc(x.resume)).join('<br>');
  }
  if (a(/fraise|menthe|vanille|classic|grenade|melon|kit|pod|lemon|haze|amnesia|gelato|e-?liquide|coton|batterie|resistance|reste combien|en stock|stock de/)) {
    const r = chercherRef(q);
    if (r && r.cbd) return '<b>' + esc(r.designation) + '</b> : ' + r.stock + ' en stock, lot ' + esc(r.lot) + ', conditionné le ' + dNumA(r.conditionne) + '. ' + r.v4 + ' vendus en quatre semaines.' + lienAs('stock', 'Voir le stock');
    if (r) {
      const q4 = quantiteCommande(r);
      const jours = r.v4 ? Math.round(r.stock / (r.v4 / 28)) : null;
      return '<b>' + esc(r.designation) + '</b> : ' + r.stock + ' en rayon. Ventes ' + pctS(r.tendance) + ' sur quatre semaines (' + r.v4 + ' vendus)' + (jours != null ? ', rupture dans environ ' + jours + ' jours' : '') + '. ' +
        (r.statut === 'À recommander' ? '<b>' + q4 + ' à commander jeudi</b>, pour trois semaines de ventes.' : r.statut === 'À arrêter' ? 'À arrêter : écoulez le stock restant.' : r.statut === 'À réduire' ? 'À réduire à la prochaine commande.' : 'Rien à commander cette semaine.') + lienAs('stock', 'Voir la commande de jeudi');
    }
    return 'Je n’ai pas trouvé ce produit. Essayez avec son nom, par exemple « Fraise glacée » ou « Lemon Haze ».';
  }
  if (a(/vire|virer|virement|alimenter|compte fdj/)) return 'Mercredi 14, la FDJ prélève <b>' + eur2(prochain.solde) + '</b> (relevé de la semaine ' + prochain.semaine + '). Le compte FDJ a ' + eur(D.comptes.fdj) + ' : <b>virez ' + eur(prochain.solde - D.comptes.fdj) + ' de la BNP avant mercredi</b>. Et ' + eur(3240000) + ' vers la Banque Populaire avant jeudi, pour les recharges et Logista.' + lienAs('tresorerie', 'Voir la semaine');
  if (a(/\btva\b|ca3|dgfip|impot/)) {
    const t = TVA_SEPT;
    return 'La TVA de septembre : <b>' + eur2(t.du) + '</b>, prélevée le mercredi 21 octobre. ' + eur2(t.coll) + ' collectés sur vos ventes de la boutique en caisse, moins ' + eur2(t.ded) + ' de TVA sur vos ' + t.n + ' factures d’achat. Elle est déjà dans votre plan de vol.' + lienAs('tresorerie', 'Voir la trésorerie');
  }
  if (a(/ratio|histoire|propre|administration|controle fiscal|facture electronique/)) {
    const R = RATIOS_SEPT;
    return '<b>' + R.liste.length + ' ratios passés en revue</b> en septembre : ' + R.coherents.length + ' cohérents, ' + R.aExpliquer.length + ' à expliquer. ' + R.aExpliquer.map((x) => maj(x.nom) + ' : ' + x.val + ', ' + x.att).join('. ') + '.' + lienAs('rentabilite', 'Voir les ratios');
  }
  if (a(/fdj|profession jeux|ecart|jeux|loto|grattage|prelev|parions|carnet/)) {
    const s = fdjSemaineV2(lundiDe(AUJ));
    const C = CTRL_FDJ;
    return 'Le contrôle à la semaine : la FDJ facture le grattage par carnet, donc chaque semaine a son petit écart. Sur septembre, ils se compensent : <b>' + eur2(ECART_SEPT_FDJ, true) + '</b>.' +
      (C.pari ? '<br>La semaine 41 est sortie de la zone (' + eur2(C.pari.ecart, true) + ') : en isolant Parions Sport, un pari de <b>' + eur2(PARIONS.montant) + '</b> du jeudi 8 octobre à 14 h 31 min 08 s, absent de la caisse.' : '') +
      '<br>Atterrissage du prélèvement du mercredi 21 : <b>≈ ' + eur(s.atterrissage) + '</b>.' + lienAs('fdj', 'Voir le contrôle FDJ');
  }
  if (a(/espece|liquide|collecte|tiroir|coffre|caisse contient|en caisse/)) return '<b>' + eur2(especes) + '</b> à avoir en caisse depuis la collecte du vendredi 9 octobre, 20 h 30, gains de jeux payés déduits. Collecte de vendredi 16 : <b>≈ ' + eur(COLLECTE_ENV) + '</b>.' + lienAs('caisse', 'Compter la caisse');
  if (a(/atterri|lundi|tresorerie|logista|passe|banque|compte/)) return 'Lundi soir, après la facture Logista (' + eur(2933000) + ') : <b>' + eur(ATT.total) + '</b>, dont <b>' + eur(VAV.vraiment) + ' vraiment à vous</b>. ' + phrasePlanAs() + lienAs('tresorerie', 'Voir la trésorerie');
  if (a(/resultat|benef|gagne|rentab|marge/)) {
    const att = pnlDe('att'), sep = pnlDe(9);
    const r = resultatDe(att), rs = resultatDe(sep);
    const top = ACTIVITES.map((x) => ({ x, m: margeActivite(att.produits, x) })).sort((u, v) => v.m - u.m)[0];
    return 'Octobre : <b>' + eur(r) + '</b> de résultat attendu, ' + pctS((r - rs) / Math.abs(rs) * 100) + ' sur septembre, avant votre rémunération. Marge brute : ' + eur(margeTotale(att.produits)) + '. Ce qui rapporte le plus : ' + top.x.lib.toLowerCase() + ', ' + eur(top.m) + '.' + lienAs('rentabilite', 'Voir le résultat');
  }
  if (a(/cbd/)) return 'CBD : ' + eur(D.pnl_att.produits.cbd_ventes) + ' de ventes attendues en octobre, <b>×' + F0.format(D.pnl_att.produits.cbd_ventes / D.pnl[3].produits.cbd_ventes) + ' depuis avril</b>. ' + D.cbd_refs.length + ' produits suivis par lot, avec leur analyse.' + lienAs('stock', 'Voir le stock CBD');
  if (a(/coca|prix|hausse|metro|fournisseur|facture/)) return 'Metro, 9 octobre : <b>Coca-Cola 33 cl +6,8 %</b> (10,51 € HT le pack de 24, contre 9,84 €). Prix de vente inchangé : la marge du produit baisse de 3 points. À revoir en rayon.' + (FACT_METRO ? '<br><button class="lien-bouton" type="button" data-action="facture" data-id="' + FACT_METRO.id + '">Lire la facture ' + ic('fleche') + '</button>' : '');
  if (a(/commande|commander|jeudi/)) {
    const reco = D.refs.filter((r) => r.statut === 'À recommander').sort((u, v) => v.tendance - u.tendance);
    const tot = reco.reduce((s, r) => s + quantiteCommande(r) * r.pa, 0);
    return 'La commande de jeudi : <b>' + reco.length + ' références</b>, ' + eur(tot) + ' HT. En tête : ' + reco.slice(0, 3).map((r) => esc(r.designation.split(',')[0]) + ' (' + quantiteCommande(r) + ')').join(', ') + '.' + lienAs('stock', 'Voir la commande');
  }
  if (a(/pmu|turf|course/)) { const r = D.releves.pmu[D.releves.pmu.length - 1]; return 'PMU, semaine ' + r.semaine + ' : <b>' + eur2(r.solde) + '</b> prélevés ' + dLong(r.prelevement) + '. Commission : ' + eur2(r.commission) + '.'; }
  if (a(/cafe|tasse/)) { const r9 = D.ratios[8]; return 'Café en septembre : <b>' + r9.tasses_kg + ' tasses par kilo</b> (' + nb(r9.tasses) + ' cafés pour ' + r9.cafe_kg + ' kg achetés). Environ 138 attendues : cafés offerts, réglage du moulin ou ventes oubliées en caisse.'; }
  if (a(/aujourd|on a fait|j.ai fait|ai fait|chiffre|ventes? (du jour|de ce soir)|\bz\b|journee|combien.*(vendu|encaisse)/)) return 'Aujourd’hui : <b>' + eur2(z.total) + '</b> de ventes, dont ' + eur(z.ventes.fdj) + ' de jeux FDJ et ' + eur(z.ventes.cbd) + ' de CBD. ' + nb(z.tickets) + ' tickets, panier moyen ' + eur2(Math.round(z.total / z.tickets)) + '. Marge du jour : <b>' + eur(MARGE_AUJ) + '</b>.' + lienAs('caisse', 'Voir la caisse');
  return 'Je n’ai pas trouvé ça dans vos chiffres. Je réponds sur la caisse, la FDJ, la trésorerie, le stock, les factures et la boîte vocale. Essayez : « Combien on a fait aujourd’hui ? »';
}
function htmlFil() {
  return '<span class="as-jour">Aujourd’hui</span>' + AS.fil.map((m) => '<div class="bulle ' + m.qui + '">' + m.html + '<small>' + m.h + (m.qui === 'moi' ? ' ✓✓' : '') + '</small></div>').join('');
}
function majFil(tape = false) {
  const f = $('#as-fil');
  if (!f) return;
  f.innerHTML = htmlFil() + (tape ? '<div class="bulle lui tape" aria-label="L’assistant écrit"><i></i><i></i><i></i></div>' : '');
  f.scrollTop = f.scrollHeight;
}
function ouvrirAssistant(question) {
  fermerTout();
  if (!AS.fil.length) AS.fil.push({ qui: 'lui', html: 'Bonsoir Julien. Posez-moi une question sur vos chiffres de ce soir, ou touchez une idée juste en dessous.', h: HEURE });
  document.body.insertAdjacentHTML('beforeend', voile(true) + '<aside class="assistant" role="dialog" aria-modal="true" aria-label="Assistant">' +
    '<div class="as-tete"><span class="as-av">' + LOGO + '</span><div><b>Assistant du Balto</b><span><span class="point-vif"></span>répond avec vos chiffres</span></div><button class="btn-icone" type="button" data-action="fermer" aria-label="Fermer">' + ic('croix') + '</button></div>' +
    '<div class="as-fil" id="as-fil" aria-live="polite"></div>' +
    '<div class="as-idees">' + IDEES.map((q) => '<button type="button" data-action="as-q" data-q="' + esc(q) + '">' + esc(q) + '</button>').join('') + '</div>' +
    '<form class="as-form" id="as-form" autocomplete="off"><input id="as-q" type="text" placeholder="Votre question…" aria-label="Votre question"><button type="submit" aria-label="Envoyer">' + ic('envoyer') + '</button></form>' +
    '<p class="as-note">Démonstration : les réponses sont calculées sur les chiffres d’exemple du Balto. Le même assistant répond aussi sur WhatsApp.</p></aside>');
  majFil();
  if (question) poserQuestion(question);
  else { const i = $('#as-q'); if (i && !window.matchMedia('(max-width: 760px)').matches) i.focus(); }
}
let minuterieAs = null;
function poserQuestion(q) {
  q = String(q || '').trim();
  if (!q) return;
  if (!$('.assistant')) { ouvrirAssistant(q); return; }
  AS.fil.push({ qui: 'moi', html: esc(q), h: HEURE });
  majFil(true);
  clearTimeout(minuterieAs);
  minuterieAs = setTimeout(() => { AS.fil.push({ qui: 'lui', html: repondre(q), h: HEURE }); majFil(false); }, mouvementReduit() ? 0 : 750);
}
