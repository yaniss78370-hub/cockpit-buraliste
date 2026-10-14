/* ------------------------------------------------------------------ exports : Excel, CSV, PDF */
const LIBS = window.COCKPIT_LIBS || {
  exceljs: 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js',
  jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js',
  autotable: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.4/jspdf.plugin.autotable.min.js',
};
const CHARGEMENTS = {};
function charger(url) {
  if (!CHARGEMENTS[url]) {
    CHARGEMENTS[url] = new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = url;
      s.async = true;
      s.onload = () => ok();
      s.onerror = () => { delete CHARGEMENTS[url]; ko(new Error('chargement')); };
      document.head.appendChild(s);
    });
  }
  return CHARGEMENTS[url];
}
let CAPA_DL = null;
function capaTelechargement() {
  if (!CAPA_DL) {
    CAPA_DL = window.claude && typeof window.claude.use === 'function'
      ? Promise.resolve(window.claude.use('downloads')).catch(() => null)
      : Promise.resolve(null);
  }
  return CAPA_DL;
}
async function enregistrer(nom, blob, texte) {
  const dl = await capaTelechargement();
  if (dl) {
    try {
      const r = await dl.save({ filename: nom, data: blob });
      toast(r && r.status === 'delivered' ? 'Fichier transmis : ' + nom : 'Fichier enregistré : ' + nom);
    } catch (e) {
      const c = e && e.code;
      toast(c === 'declined' ? 'Enregistrement annulé.' : c === 'rate_limited' ? 'Un enregistrement est déjà en cours : réessayez dans un instant.'
        : c === 'too_large' ? 'Fichier trop lourd pour cette destination.' : 'L’enregistrement n’a pas abouti dans cette vue.');
    }
    return;
  }
  if (!window.claude) {
    // le cockpit sur le site : téléchargement classique du navigateur
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nom;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2500);
    toast('Téléchargement lancé : ' + nom);
    return;
  }
  if (texte) {
    ouvrirModale('<h2>' + esc(nom) + '</h2><p class="discret">L’enregistrement de fichiers n’est pas disponible dans cette vue. Copiez le tableau et collez-le dans Excel.</p><textarea readonly id="txt-export">' + esc(texte) + '</textarea><div class="pied"><button class="bouton" type="button" data-action="fermer">Fermer</button></div>');
    return;
  }
  toast('L’enregistrement de fichiers n’est pas disponible dans cette vue.');
}

/* ---- tableaux exportables : colonnes typées, montants en centimes */
const e2 = (c) => (c == null ? null : c);
const round1 = (x) => Math.round(x * 10) / 10;
const SPECS = {
  semaine: () => ({
    nom: 'Semaine', desc: 'Trésorerie chaque soir à 21 h, du dimanche 11 au lundi 19 octobre',
    cols: [{ lib: 'Date', t: 'date' }, { lib: 'Jour', t: 'txt', l: 10 }, { lib: 'État', t: 'txt', l: 9 }, { lib: 'Encaissements nets', t: 'eur', l: 18 }, { lib: 'Prélèvements', t: 'txt', l: 22 }, { lib: 'Montant prélevé', t: 'eur', l: 16 }, { lib: 'Solde à 21 h', t: 'eur', l: 15 }],
    rows: SEM.map((x) => [x.date, x.jour, x.statut, x.entrees || null, x.sorties.map((s) => s[0]).join(', '), x.sorties.length ? -x.sorties.reduce((a, s) => a + s[1], 0) : null, x.solde]),
  }),
  plan: () => {
    const p = calculPlan();
    const L = ETAT.plan;
    return {
      nom: 'Plan de vol', desc: 'Six mois, quinzaine par quinzaine. Vos décisions : ' + (evenementsPlan(L).map((e) => e.txt + ' (' + e.sous + ')').join(' ; ') || 'aucune'),
      cols: [{ lib: 'Quinzaine', t: 'txt', l: 14 }, { lib: 'Date', t: 'date' }, { lib: 'Activité courante', t: 'eur', l: 17 }, { lib: 'Embauche', t: 'eur' }, { lib: 'Crédit', t: 'eur' }, { lib: 'Salaire du gérant', t: 'eur', l: 16 }, { lib: 'Rayon CBD', t: 'eur' }, { lib: 'Agencement', t: 'eur' }, { lib: 'Aide de la douane', t: 'eur', l: 16 }, { lib: 'Vos mouvements', t: 'eur', l: 15 }, { lib: 'Mouvement net', t: 'eur', l: 15 }, { lib: 'Trésorerie', t: 'eur' }, { lib: 'Sans rien changer', t: 'eur', l: 16 }, { lib: 'Factures Logista d’avance', t: 'dec', l: 22 }],
      rows: [['mi-octobre', SIM.dates[0], null, null, null, null, null, null, null, null, null, SIM.depart * 100, SIM.depart * 100, round1(SIM.depart / SIM.seuil)]].concat(p.det.map((x, i) =>
        [SIM.quand[i + 1], SIM.dates[i + 1], x.base * 100, x.embauche * 100 || null, x.credit * 100 || null, x.salaire * 100 || null, x.cbd * 100 || null, x.agencement * 100 || null, x.aide * 100 || null, x.mouvements * 100 || null, x.total * 100, x.solde * 100, PLAN_REF.pts[i + 1] * 100, round1(x.solde / SIM.seuil)])),
    };
  },
  mouvements: () => ({
    nom: 'Mouvements bancaires', desc: 'BNP, Banque Populaire et compte FDJ, du 8 juillet au 13 octobre, puis la semaine prévue',
    cols: [{ lib: 'Date', t: 'date' }, { lib: 'Compte', t: 'txt', l: 18 }, { lib: 'Libellé', t: 'txt', l: 46 }, { lib: 'Contrepartie', t: 'txt', l: 30 }, { lib: 'Catégorie', t: 'txt', l: 26 }, { lib: 'Montant', t: 'eur' }, { lib: 'État', t: 'txt', l: 8 }, { lib: 'Facture', t: 'txt', l: 10 }],
    rows: MVT.slice().sort((a, b) => (a.date === b.date ? a.i - b.i : a.date < b.date ? -1 : 1)).map((m) => [m.date, COMPTES[m.compte].nom, m.libelle, m.contrepartie, m.categorie, m.montant, m.statut, m.facture || '']),
  }),
  fixes: () => ({
    nom: 'Charges fixes', desc: 'Montants payés chaque mois, TTC, de novembre 2025 à octobre 2026',
    cols: [{ lib: 'Charge', t: 'txt', l: 30 }, { lib: 'Fournisseur', t: 'txt', l: 30 }, { lib: 'Jour', t: 'int', l: 6 }].concat(D.fixes_mois.map((m) => ({ lib: M[+m.slice(5) - 1] + ' ' + m.slice(2, 4), t: 'eur', l: 11 }))).concat([{ lib: 'Total 12 mois', t: 'eur', l: 14 }, { lib: 'À savoir', t: 'txt', l: 60 }]),
    rows: D.fixes.map((f) => [f.libelle, f.fournisseur, f.jour].concat(f.serie).concat([f.serie.reduce((s, x) => s + x, 0), D.notes_fixes[f.cle] || ''])),
  }),
  z: () => ({
    nom: 'Caisse (Z)', desc: 'Z de caisse quotidiens, du 1er janvier au 13 octobre (TTC)',
    cols: [{ lib: 'Date', t: 'date' }, { lib: 'Total encaissé', t: 'eur', l: 15 }, { lib: 'Cartes', t: 'eur' }, { lib: 'Espèces', t: 'eur' }, { lib: 'Gains FDJ payés', t: 'eur', l: 15 }, { lib: 'Gains PMU payés', t: 'eur', l: 15 }, { lib: 'Tickets', t: 'int', l: 8 }, { lib: 'Cafés', t: 'int', l: 8 }]
      .concat(D.ventes_fam.map((f) => ({ lib: LIB_FAM[f], t: 'eur', l: 14 }))),
    rows: Z.map((z) => [z.date, z.total, z.cb, z.especes, z.gains_fdj, z.gains_pmu, z.tickets, z.tasses].concat(D.ventes_fam.map((f) => z.ventes[f]))),
  }),
  annules: () => ({
    nom: 'Tickets annulés', desc: 'Annulations de tickets depuis le 1er septembre',
    cols: [{ lib: 'Date', t: 'date' }, { lib: 'Heure', t: 'txt', l: 8 }, { lib: 'Caisse', t: 'int', l: 8 }, { lib: 'Au comptoir', t: 'txt', l: 12 }, { lib: 'Montant', t: 'eur' }, { lib: 'Motif', t: 'txt', l: 26 }, { lib: 'Moment', t: 'txt', l: 20 }],
    rows: D.annules.map((a) => [a.date, a.heure, a.caisse, a.vendeur, a.montant, a.motif, a.moment]),
  }),
  fdj: () => ({
    nom: 'Relevés FDJ', desc: 'Relevés hebdomadaires FDJ : ventes facturées (le grattage par carnet), gains payés, commission, solde prélevé',
    cols: [{ lib: 'Semaine', t: 'int', l: 9 }, { lib: 'Du', t: 'date' }, { lib: 'Au', t: 'date' }, { lib: 'Ventes facturées', t: 'eur', l: 16 }, { lib: 'Gains payés', t: 'eur' }, { lib: 'Commission', t: 'eur' }, { lib: 'Solde prélevé', t: 'eur' }, { lib: 'Prélevé le', t: 'date' }],
    rows: D.releves.fdj.map((r) => [r.semaine, r.du, r.au, r.ventes, r.gains, r.commission, r.solde, r.prelevement]),
  }),
  pmu: () => ({
    nom: 'Relevés PMU', desc: 'Relevés hebdomadaires PMU',
    cols: [{ lib: 'Semaine', t: 'int', l: 9 }, { lib: 'Du', t: 'date' }, { lib: 'Au', t: 'date' }, { lib: 'Enjeux', t: 'eur' }, { lib: 'Gains payés', t: 'eur' }, { lib: 'Commission', t: 'eur' }, { lib: 'Solde prélevé', t: 'eur' }, { lib: 'Prélevé le', t: 'date' }],
    rows: D.releves.pmu.map((r) => [r.semaine, r.du, r.au, r.ventes, r.gains, r.commission, r.solde, r.prelevement]),
  }),
  collectes: () => ({
    nom: 'Collectes', desc: 'Collectes d’espèces : théorique selon la caisse, compté le soir même, versé à la BNP',
    cols: [{ lib: 'Collecte', t: 'date' }, { lib: 'Heure', t: 'txt', l: 8 }, { lib: 'Théorique', t: 'eur' }, { lib: 'Compté et versé', t: 'eur', l: 16 }, { lib: 'Écart', t: 'eur' }, { lib: 'Versée le', t: 'date' }],
    rows: D.collectes.map((c) => [c.date, c.heure, c.theorique, c.recupere, c.ecart, c.depot]),
  }),
  caisseDepuis: () => ({
    nom: 'Depuis la collecte', desc: 'Espèces nettes jour par jour depuis la collecte du ' + dLong(D.caisse_depuis.date) + ' à ' + D.caisse_depuis.heure.replace(':', ' h '),
    cols: [{ lib: 'Jour', t: 'date' }, { lib: 'Encaissé en espèces', t: 'eur', l: 18 }, { lib: 'Gains de jeux payés', t: 'eur', l: 18 }, { lib: 'Reste en caisse', t: 'eur', l: 16 }],
    rows: joursDepuisCollecte().map((x) => [x.iso, x.esp, -x.gains, x.net]),
  }),
  fdjSemaines: () => ({
    nom: 'FDJ semaine par semaine', desc: 'Prélèvement FDJ : le théorique, à partir des rubriques Strator (commission ' + pct2(FDJ_TX.ji * 100) + ' des jeux instantanés, ' + pct2(FDJ_TX.loto * 100) + ' du Loto et des paris), face au prélèvement réel',
    cols: [{ lib: 'Semaine', t: 'int', l: 9 }, { lib: 'Du', t: 'date' }, { lib: 'Au', t: 'date' }, { lib: 'Prélevé le', t: 'date' }, { lib: 'Jeux instantanés', t: 'eur', l: 16 }, { lib: 'Loto et paris', t: 'eur', l: 14 },
      { lib: 'Gains payés', t: 'eur' }, { lib: 'Commission estimée', t: 'eur', l: 18 }, { lib: 'Théorique (caisse)', t: 'eur', l: 18 }, { lib: 'Réel (FDJ)', t: 'eur' }, { lib: 'Écart', t: 'eur' }],
    rows: D.releves.fdj.filter((r) => r.du >= FDJ_PREMIERE).map((r) => { const x = fdjSemaineV2(r.du), t = x.tReel; return [r.semaine, r.du, r.au, r.prelevement, t.ji, t.loto, -t.gains, -Math.round(t.com), Math.round(t.total), r.solde, Math.round(t.total - r.solde)]; })
      .concat([(() => { const x = fdjSemaineV2(lundiDe(AUJ)); return [D.releves.fdj[D.releves.fdj.length - 1].semaine + 1, x.lundi, ajoute(x.lundi, 6), x.prelev, x.tReel.ji, x.tReel.loto, -x.tReel.gains, -Math.round(x.tReel.com), Math.round(x.atterrissage), null, null]; })()]),
  }),
  fdjJours: () => ({
    nom: 'FDJ jour par jour', desc: 'Rubriques du CA Strator pour les jeux FDJ, depuis le 6 juillet',
    cols: [{ lib: 'Jour', t: 'date' }, { lib: 'Jeux instantanés', t: 'eur', l: 16 }, { lib: 'Loto', t: 'eur' }, { lib: 'Remboursement jeux', t: 'eur', l: 18 }, { lib: 'Remboursement loto', t: 'eur', l: 18 }, { lib: 'Commission estimée', t: 'eur', l: 18 }, { lib: 'À reverser', t: 'eur' }],
    rows: Object.keys(FDJ_JR).filter((k) => k >= FDJ_PREMIERE).sort().map((k) => { const t = fdjCalcul([fdjRubriques(k)]); return [k, t.ji, t.loto, -t.rj, -t.rl, -Math.round(t.com), Math.round(t.total)]; }),
  }),
  controleFdj: () => {
    const C = controleFdj(30);
    let cumul = 0;
    return {
      nom: 'Contrôle FDJ', desc: 'Contrôle à la semaine : le prélèvement théorique (caisse Strator) face au prélèvement réel. Zone normale : ' + eur(-ZONE_FDJ, false, true) + ' à ' + eur(ZONE_FDJ, false, true) + ' par semaine ; les écarts doivent se compenser',
      cols: [{ lib: 'Semaine', t: 'int', l: 9 }, { lib: 'Du', t: 'date' }, { lib: 'Au', t: 'date' }, { lib: 'Théorique (caisse)', t: 'eur', l: 18 }, { lib: 'Réel (FDJ)', t: 'eur' }, { lib: 'Écart', t: 'eur' }, { lib: 'Cumul', t: 'eur' }, { lib: 'Contrôle', t: 'txt', l: 70 }],
      rows: C.sem.map((x) => { cumul += x.ecart; return [x.r.semaine, x.r.du, x.r.au, x.theo, x.reel, x.ecart, cumul,
        x.hors ? (x === C.pari ? 'Hors de la zone : Parions Sport isolé, un pari de 45 € du jeudi 8 octobre à 14:31:08 absent de la caisse. Ticket ajouté : ' + eur2(C.apres, true) : 'Hors de la zone : à rechercher') : 'Dans la zone']; }),
    };
  },
  parionsSport: () => ({
    nom: 'Parions Sport, jeudi 8 octobre', desc: 'Les paris sortis du terminal FDJ de 14 h 25 à 14 h 40, rapprochés un à un des tickets scannés en caisse',
    cols: [{ lib: 'Heure', t: 'txt', l: 10 }, { lib: 'Pari', t: 'txt', l: 24 }, { lib: 'Montant', t: 'eur' }, { lib: 'En caisse', t: 'txt', l: 12 }],
    rows: EXPORT_FDJ.map((o) => [o.h, o.jeu, o.mt, o.ok ? 'Oui' : 'Absent']),
  }),
  tva: () => {
    const t = TVA_SEPT;
    return {
      nom: 'TVA de septembre', desc: 'Collectée sur les ventes de la boutique en caisse, déductible sur les factures d’achat de septembre. Prélevée le mercredi 21 octobre',
      cols: [{ lib: 'Ligne', t: 'txt', l: 18 }, { lib: 'Détail', t: 'txt', l: 64 }, { lib: 'TVA', t: 'eur' }],
      rows: [['TVA collectée', 'Ventes HT de la boutique en caisse : ' + eur2(t.ventes), t.coll]]
        .concat(D.factures.filter((f) => f.date.slice(0, 7) === '2026-09' && f.tva).sort((a, b) => (a.date < b.date ? -1 : 1)).map((f) => ['TVA déductible', f.date.split('-').reverse().join('/') + ' · ' + f.fournisseur + ' · ' + f.objet + ' (' + f.id + ')', -f.tva]))
        .concat([['TVA à payer', 'Prélevée le mercredi 21 octobre', t.du]]),
    };
  },
  factures: () => ({
    nom: 'Factures', desc: 'Factures reçues depuis juillet, rangées et rapprochées',
    cols: [{ lib: 'Pièce', t: 'txt', l: 8 }, { lib: 'Date', t: 'date' }, { lib: 'Fournisseur', t: 'txt', l: 26 }, { lib: 'Objet', t: 'txt', l: 40 }, { lib: 'Catégorie', t: 'txt', l: 22 }, { lib: 'HT', t: 'eur' }, { lib: 'TVA', t: 'eur' }, { lib: 'TTC', t: 'eur' }, { lib: 'Échéance', t: 'date' }, { lib: 'Règlement', t: 'txt', l: 12 }, { lib: 'État', t: 'txt', l: 9 }, { lib: 'Remarque', t: 'txt', l: 50 }],
    rows: D.factures.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).map((f) => [f.id, f.date, f.fournisseur, f.objet, f.categorie, f.ht, f.tva, f.ttc, f.echeance, f.mode, f.statut, f.alerte || '']),
  }),
  lignes: () => {
    const rows = [];
    D.factures.forEach((f) => f.lignes.forEach((l) => rows.push([f.id, f.date, f.fournisseur, l.d, l.pu != null ? l.q : null, l.pu || null, l.tva ? l.tva / 100 : null, l.ht, l.fam])));
    return { nom: 'Lignes de factures', desc: 'Chaque ligne de chaque facture, rangée par famille',
      cols: [{ lib: 'Pièce', t: 'txt', l: 8 }, { lib: 'Date', t: 'date' }, { lib: 'Fournisseur', t: 'txt', l: 24 }, { lib: 'Désignation', t: 'txt', l: 46 }, { lib: 'Quantité', t: 'int', l: 9 }, { lib: 'Prix unitaire HT', t: 'eur', l: 15 }, { lib: 'TVA', t: 'pct', l: 7 }, { lib: 'Montant HT', t: 'eur', l: 13 }, { lib: 'Famille', t: 'txt', l: 26 }], rows };
  },
  vape: () => ({
    nom: 'Références vape', desc: '148 références de cigarette électronique : stock, ventes, tendance',
    cols: [{ lib: 'Réf.', t: 'txt', l: 9 }, { lib: 'Désignation', t: 'txt', l: 42 }, { lib: 'Famille', t: 'txt', l: 18 }, { lib: 'Fournisseur', t: 'txt', l: 16 }, { lib: 'Prix d’achat HT', t: 'eur', l: 15 }, { lib: 'Prix de vente TTC', t: 'eur', l: 16 }, { lib: 'Stock théorique', t: 'int', l: 15 }, { lib: 'Stock Strator', t: 'int', l: 13 }, { lib: 'Ventes 4 sem.', t: 'int', l: 13 }, { lib: '4 sem. précédentes', t: 'int', l: 17 }, { lib: 'Tendance', t: 'pct', l: 10 }, { lib: 'Couverture (jours)', t: 'int', l: 17 }, { lib: 'Statut', t: 'txt', l: 14 }],
    rows: D.refs.map((r) => [r.code, r.designation, r.famille, r.fournisseur, r.pa, r.pv, r.stock, r.stock_strator, r.v4, r.v4p, r.tendance / 100, r.couverture >= 999 ? null : r.couverture, r.statut]),
  }),
  cbd: () => ({
    nom: 'CBD, lots', desc: 'Fiches produits CBD : lot, conditionnement, THC, stock',
    cols: [{ lib: 'Réf.', t: 'txt', l: 9 }, { lib: 'Produit', t: 'txt', l: 32 }, { lib: 'Famille', t: 'txt', l: 14 }, { lib: 'Lot', t: 'txt', l: 10 }, { lib: 'Conditionné le', t: 'date', l: 15 }, { lib: 'THC (%)', t: 'dec', l: 9 }, { lib: 'Prix d’achat HT', t: 'eur', l: 15 }, { lib: 'Prix de vente TTC', t: 'eur', l: 16 }, { lib: 'Stock', t: 'int', l: 8 }, { lib: 'Ventes 4 sem.', t: 'int', l: 13 }, { lib: 'Analyse', t: 'txt', l: 30 }],
    rows: D.cbd_refs.map((r) => [r.code, r.designation, r.famille, r.lot, r.conditionne, r.thc || null, r.pa, r.pv, r.stock, r.v4, r.analyse]),
  }),
  stockFam: () => ({
    nom: 'Stock par famille', desc: 'Stock théorique et valeur dans Strator, au prix d’achat',
    cols: [{ lib: 'Famille', t: 'txt', l: 26 }, { lib: 'Détail', t: 'txt', l: 30 }, { lib: 'Théorique', t: 'eur' }, { lib: 'Strator', t: 'eur' }, { lib: 'Écart', t: 'eur' }],
    rows: D.stock.map((f) => [f.famille, f.detail, f.theo, f.strator, f.strator - f.theo]).concat([['Total', '', D.stock_tot.theo, D.stock_tot.strator, D.stock_tot.strator - D.stock_tot.theo]]),
    gras: [D.stock.length],
  }),
  commande: () => {
    const l = D.refs.filter((r) => r.statut === 'À recommander');
    return { nom: 'Commande de jeudi', desc: 'Références à recommander, trois semaines de ventes',
      cols: [{ lib: 'Réf.', t: 'txt', l: 9 }, { lib: 'Désignation', t: 'txt', l: 42 }, { lib: 'Fournisseur', t: 'txt', l: 16 }, { lib: 'Stock', t: 'int', l: 8 }, { lib: 'Ventes 4 sem.', t: 'int', l: 13 }, { lib: 'Quantité', t: 'int', l: 9 }, { lib: 'Coût HT', t: 'eur' }],
      rows: l.map((r) => { const q = ETAT.commande[r.code] != null ? ETAT.commande[r.code] : quantiteCommande(r); return [r.code, r.designation, r.fournisseur, r.stock, r.v4, q, q * r.pa]; }) };
  },
  resultat: () => {
    const cles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'att'];
    const X = cles.map(pnlDe);
    const rows = [];
    const gras = [];
    const add = (lib, vals, g) => { if (g) gras.push(rows.length); rows.push([lib].concat(vals).concat([vals.reduce((s, v) => s + v, 0)])); };
    ACTIVITES.forEach((a) => add('Marge ' + a.lib.toLowerCase(), X.map((x) => margeActivite(x.produits, a))));
    add('Marge brute', X.map((x) => margeTotale(x.produits)), true);
    RUBRIQUES.forEach((r) => add(r, X.map((x) => -(x.charges[r] || 0))));
    add('Excédent brut d’exploitation', X.map((x) => margeTotale(x.produits) - chargesHorsAmort(x.charges)), true);
    add('Amortissements', X.map((x) => -(x.charges['Amortissements'] || 0)));
    add('Charges financières', X.map((x) => -(x.charges['Charges financières'] || 0)));
    add('Résultat courant, avant rémunération du gérant', X.map((x) => resultatDe(x)), true);
    return { nom: 'Compte de résultat', desc: 'Compte de résultat de gestion, de janvier à octobre (octobre en atterrissage)',
      cols: [{ lib: 'En euros', t: 'txt', l: 44 }].concat(cles.map((k) => ({ lib: k === 'att' ? 'oct. (atterrissage)' : M[k - 1], t: 'eur', l: 13 }))).concat([{ lib: 'Cumul', t: 'eur', l: 14 }]), rows, gras };
  },
  ventes: () => {
    const cles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'att'];
    const X = cles.map(pnlDe);
    return { nom: 'Ventes par rayon', desc: 'Ventes et marge de chaque rayon, mois par mois',
      cols: [{ lib: 'Rayon', t: 'txt', l: 30 }, { lib: 'Mesure', t: 'txt', l: 10 }].concat(cles.map((k) => ({ lib: k === 'att' ? 'oct. (atterrissage)' : M[k - 1], t: 'eur', l: 13 }))),
      rows: D.ventes_fam.flatMap((f) => [[LIB_FAM[f], 'Ventes'].concat(X.map((x) => x.produits[f + '_ventes'])), [LIB_FAM[f], 'Marge'].concat(X.map((x) => x.produits[f + '_marge']))]) };
  },
  ratios: () => ({
    nom: 'Ratios', desc: 'Café, boissons, espèces : les ratios du mois',
    cols: [{ lib: 'Mois', t: 'txt', l: 12 }, { lib: 'Café acheté (kg)', t: 'int', l: 16 }, { lib: 'Cafés vendus', t: 'int', l: 13 }, { lib: 'Tasses par kilo', t: 'int', l: 15 }, { lib: 'Marge boissons attendue', t: 'pct', l: 22 }, { lib: 'Marge boissons réelle', t: 'pct', l: 20 }, { lib: 'Écart de caisse espèces', t: 'eur', l: 22 }, { lib: 'Marge tabac', t: 'pct', l: 12 }],
    rows: D.ratios.map((r) => [maj(ML[r.mois - 1]), r.cafe_kg, r.tasses, r.tasses_kg, r.boissons_theo / 100, r.boissons_reel / 100, r.especes_ecart, r.tabac_marge / 100]),
  }),
  revueRatios: () => ({
    nom: 'Revue des ratios', desc: 'Septembre : chaque ratio qui relie vos achats et vos ventes, passé en revue',
    cols: [{ lib: 'Ratio', t: 'txt', l: 14 }, { lib: 'Septembre', t: 'txt', l: 30 }, { lib: 'Repère', t: 'txt', l: 52 }, { lib: 'Statut', t: 'txt', l: 12 }, { lib: 'Explication', t: 'txt', l: 80 }],
    rows: RATIOS_SEPT.liste.map((x) => [x.lib, x.val, maj(x.att), x.ok ? 'Cohérent' : 'À expliquer', x.pourquoi || '']),
  }),
};
const EXPORTS = {
  semaine: { nom: 'tresorerie-semaine', specs: ['semaine'], titre: 'Trésorerie de la semaine' },
  plan: { nom: 'plan-de-vol', specs: ['plan'], titre: 'Plan de vol à six mois' },
  mouvements: { nom: 'mouvements-bancaires', specs: ['mouvements'], titre: 'Mouvements bancaires' },
  fixes: { nom: 'charges-fixes', specs: ['fixes'], titre: 'Charges fixes sur douze mois' },
  z: { nom: 'caisse', specs: ['z', 'annules'], titre: 'Caisse : Z quotidiens et tickets annulés' },
  fdj: { nom: 'jeux-fdj-pmu', specs: ['fdj', 'pmu', 'controleFdj'], titre: 'Jeux : relevés FDJ et PMU, contrôle à la semaine' },
  pmu: { nom: 'releves-pmu', specs: ['pmu'], titre: 'Relevés PMU' },
  controleFdj: { nom: 'controle-fdj', specs: ['controleFdj', 'parionsSport', 'fdjSemaines'], titre: 'Contrôle FDJ : le théorique face au réel, semaine par semaine' },
  tva: { nom: 'tva-septembre', specs: ['tva'], titre: 'TVA de septembre' },
  collectes: { nom: 'caisse-collectes', specs: ['collectes', 'caisseDepuis'], titre: 'Caisse : collectes et espèces depuis la dernière collecte' },
  fdjSemaines: { nom: 'fdj-estimations', specs: ['fdjSemaines', 'fdjJours'], titre: 'FDJ : estimations et relevés' },
  factures: { nom: 'factures', specs: ['factures', 'lignes'], titre: 'Factures, ligne par ligne' },
  vape: { nom: 'references-vape', specs: ['vape'], titre: 'Références vape' },
  cbd: { nom: 'cbd-lots', specs: ['cbd'], titre: 'CBD : lots et traçabilité' },
  commande: { nom: 'commande-jeudi', specs: ['commande'], titre: 'Commande de jeudi' },
  stock: { nom: 'stock', specs: ['stockFam', 'vape', 'cbd'], titre: 'Stock et références' },
  resultat: { nom: 'compte-de-resultat', specs: ['resultat', 'ventes', 'revueRatios', 'ratios'], titre: 'Compte de résultat et ratios' },
  classeur: { nom: 'le-balto-complet', specs: ['resultat', 'ventes', 'semaine', 'plan', 'mouvements', 'fixes', 'caisseDepuis', 'collectes', 'z', 'annules', 'fdjSemaines', 'fdjJours', 'controleFdj', 'parionsSport', 'fdj', 'pmu', 'tva', 'factures', 'lignes', 'stockFam', 'vape', 'cbd', 'revueRatios', 'ratios'], titre: 'Tout le cockpit' },
};

function valeurCsv(v, t) {
  if (v == null || v === '') return '';
  if (t === 'eur') return (Math.round(v) / 100).toFixed(2).replace('.', ',');
  if (t === 'date') return dNumA(v);
  if (t === 'pct') return (Math.round(v * 1000) / 10).toFixed(1).replace('.', ',');
  if (t === 'dec') return String(v).replace('.', ',');
  if (t === 'int') return String(v);
  const s = String(v);
  return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function versCSV(spec) {
  return '﻿' + [spec.cols.map((c) => c.lib).join(';')].concat(spec.rows.map((r) => r.map((v, i) => valeurCsv(v, spec.cols[i].t)).join(';'))).join('\r\n');
}
function versTSV(spec) {
  return [spec.cols.map((c) => c.lib).join('\t')].concat(spec.rows.map((r) => r.map((v, i) => valeurCsv(v, spec.cols[i].t).replace(/^"|"$/g, '')).join('\t'))).join('\n');
}
function valeurXlsx(v, t) {
  if (v == null || v === '') return null;
  if (t === 'eur') return Math.round(v) / 100;
  if (t === 'date') { const [y, m, d] = v.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); }
  return v;
}
async function construireClasseur(specs, titre) {
  await charger(LIBS.exceljs);
  const wb = new window.ExcelJS.Workbook();
  wb.creator = 'Cockpit Buraliste';
  wb.created = new Date(Date.UTC(2026, 9, 13, 19, 4));
  const g = wb.addWorksheet('À lire');
  g.getColumn(1).width = 30;
  g.getColumn(2).width = 96;
  const t1 = g.addRow(['Cockpit Buraliste']);
  t1.font = { bold: true, size: 16, color: { argb: 'FF0D1830' } };
  g.addRow([titre]).font = { size: 12, color: { argb: 'FF46526A' } };
  g.addRow([]);
  [['Tabac', D.meta.tabac + ' : tabac, presse, jeux (Julien, gérant)'], ['Données au', 'mardi 13 octobre 2026, 21 h 04'],
    ['Montants', 'En euros. Tabac, jeux, timbres et recharges TTC ; boutique HT sauf mention.'],
    ['Sources', 'Banques en lecture seule, boîte mail des factures, export de caisse Strator, relevés FDJ, PMU et Logista.'],
    ['Avertissement', 'Version test : les chiffres, les noms et les situations présentés sont des exemples.']].forEach((r) => { const x = g.addRow(r); x.getCell(1).font = { bold: true }; });
  g.addRow([]);
  g.addRow(['Onglets']).font = { bold: true, size: 12 };
  specs.forEach((s) => g.addRow([s.nom, s.desc || '']));
  specs.forEach((s) => {
    const ws = wb.addWorksheet(s.nom.slice(0, 31), { views: [{ state: 'frozen', ySplit: 1 }] });
    ws.columns = s.cols.map((c, i) => ({ header: c.lib, key: 'c' + i, width: c.l || (c.t === 'txt' ? 24 : c.t === 'date' ? 12 : 14) }));
    s.rows.forEach((r) => ws.addRow(r.map((v, i) => valeurXlsx(v, s.cols[i].t))));
    const h = ws.getRow(1);
    h.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    h.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D1830' } };
    h.alignment = { vertical: 'middle', wrapText: true };
    h.height = 30;
    s.cols.forEach((c, i) => {
      const col = ws.getColumn(i + 1);
      if (c.t === 'eur') col.numFmt = '#,##0.00 "€";[Red]-#,##0.00 "€"';
      if (c.t === 'date') col.numFmt = 'dd/mm/yyyy';
      if (c.t === 'pct') col.numFmt = '0.0%';
      if (c.t === 'int') col.numFmt = '#,##0';
      if (c.t === 'dec') col.numFmt = '0.0#';
    });
    (s.gras || []).forEach((k) => { ws.getRow(k + 2).font = { bold: true }; });
    if (s.rows.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: s.cols.length } };
  });
  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/* ---- le pack du mois, en PDF */
const PDF_T = (s) => String(s).replace(/[  ]/g, ' ').replace(/−/g, '-').replace(/[→]/g, '>');
async function construirePack() {
  await charger(LIBS.jspdf);
  await charger(LIBS.autotable);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, mg = 16;
  const NUIT = [13, 24, 48], ENCRE = [14, 23, 38], GRIS = [105, 117, 138];
  let y = 0;
  // bandeau
  doc.setFillColor(...NUIT);
  doc.rect(0, 0, W, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Cockpit Buraliste', mg, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(PDF_T('Pack de septembre 2026 · ' + D.meta.tabac + ' · tabac, presse, jeux'), mg, 23.5);
  doc.setTextColor(255, 210, 138);
  doc.setFontSize(9);
  doc.text(PDF_T('Version test · données d’exemple · préparé le mardi 13 octobre 2026'), mg, 30);
  y = 46;
  const titre = (txt, sous) => {
    if (y > H - 50) { doc.addPage(); y = 20; }
    doc.setTextColor(...ENCRE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.text(PDF_T(txt), mg, y);
    y += 5;
    if (sous) { doc.setFont('helvetica', 'normal'); doc.setFontSize(8.8); doc.setTextColor(...GRIS); doc.text(PDF_T(sous), mg, y); y += 4.5; }
    y += 1;
  };
  const table = (head, body, opts = {}) => {
    doc.autoTable(Object.assign({
      startY: y, head: [head.map(PDF_T)], body: body.map((r) => r.map((c) => (typeof c === 'object' && c !== null ? Object.assign({}, c, { content: PDF_T(c.content) }) : PDF_T(c)))),
      theme: 'grid', margin: { left: mg, right: mg },
      styles: { font: 'helvetica', fontSize: 8.6, cellPadding: 1.7, textColor: ENCRE, lineColor: [221, 227, 236], lineWidth: 0.2 },
      headStyles: { fillColor: NUIT, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [246, 248, 251] },
    }, opts));
    y = doc.lastAutoTable.finalY + 9;
  };
  const sep = pnlDe(9);
  const zSep = Z.filter((z) => z.date.slice(5, 7) === '09');
  const serieSep = D.serie.filter((x) => x.date.slice(5, 7) === '09');
  const basSep = serieSep.reduce((a, x) => (x.total < a.total ? x : a));
  const finSep = serieSep[serieSep.length - 1];
  const factSep = D.factures.filter((f) => f.date.slice(5, 7) === '09');
  titre('L’essentiel de septembre');
  table(['Indicateur', 'Septembre 2026'], [
    ['Encaissé, toutes activités (TTC)', eur(zSep.reduce((s, z) => s + z.total, 0))],
    ['Marge brute', eur(margeTotale(sep.produits))],
    ['Charges d’exploitation', eur(chargesHorsAmort(sep.charges))],
    ['Résultat courant, avant rémunération du gérant', eur(resultatDe(sep))],
    ['Trésorerie totale au 30 septembre, 21 h', eur(finSep.total)],
    ['Point bas du mois', eur(basSep.total) + ' (' + dCourt(basSep.date) + ')'],
    ['Factures reçues, lues et rangées', factSep.length + ' factures, ' + factSep.reduce((s, f) => s + f.lignes.length, 0) + ' lignes'],
    ['Contrôle FDJ', 'Les semaines se compensent : ' + eur2(ECART_SEPT_FDJ, true) + ' sur le mois, chaque semaine dans la zone normale'],
    ['TVA de septembre', eur2(TVA_SEPT.du) + ', prélevée le 21 octobre (collectée ' + eur2(TVA_SEPT.coll) + ', déductible ' + eur2(TVA_SEPT.ded) + ')'],
    ['Ratios', RATIOS_SEPT.liste.length + ' passés en revue : ' + RATIOS_SEPT.coherents.length + ' cohérents, ' + RATIOS_SEPT.aExpliquer.length + ' à expliquer (' + RATIOS_SEPT.aExpliquer.map((x) => x.nom).join(', ') + ')'],
    ['Café', D.ratios[8].tasses_kg + ' tasses par kilo, environ 138 attendues : à vérifier'],
  ], { columnStyles: { 1: { halign: 'right', cellWidth: 74 } } });
  titre('Ce que rapporte chaque rayon', 'Septembre 2026, comparé à septembre 2025');
  const n1 = n1Produits(9);
  const rayon = (f) => { const v = sep.produits[f + '_ventes'], m = sep.produits[f + '_marge'], mn = n1[f + '_marge']; return [LIB_FAM[f], eur(v), eur(m), pct(m / v * 100), mn ? eur(mn) : 'nouveau', mn ? pctS((m - mn) / mn * 100, 1) : '']; };
  table(['Rayon', 'Ventes', 'Marge', 'Taux', 'Sept. 2025', 'Évolution'], D.ventes_fam.map(rayon).concat([[{ content: 'Marge brute', styles: { fontStyle: 'bold' } }, '', { content: eur(margeTotale(sep.produits)), styles: { fontStyle: 'bold' } }, '', eur(margeTotale(n1)), pctS((margeTotale(sep.produits) - margeTotale(n1)) / margeTotale(n1) * 100, 1)]]),
    { columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } } });
  titre('De la marge au résultat', 'Septembre 2026');
  const mt = margeTotale(sep.produits);
  const ch = sep.charges;
  const lignesCh = [['Marge brute', eur(mt), '100 %']].concat(RUBRIQUES.filter((r) => ch[r]).map((r) => [r, eur(-ch[r]), pct(ch[r] / mt * 100)]))
    .concat([['Excédent brut d’exploitation', eur(mt - chargesHorsAmort(ch)), pct((mt - chargesHorsAmort(ch)) / mt * 100)], ['Amortissements', eur(-(ch['Amortissements'] || 0)), ''], ['Charges financières', eur(-(ch['Charges financières'] || 0)), ''],
      [{ content: 'Résultat courant', styles: { fontStyle: 'bold' } }, { content: eur(resultatDe(sep)), styles: { fontStyle: 'bold' } }, pct(resultatDe(sep) / mt * 100)]]);
  table(['Ligne', 'Montant', 'Part de la marge'], lignesCh, { columnStyles: { 1: { halign: 'right', cellWidth: 40 }, 2: { halign: 'right', cellWidth: 34 } } });
  titre('Trésorerie : la semaine du 11 au 19 octobre', 'Soldes à 21 h, toutes banques, espèces et cartes en attente');
  table(['Jour', 'État', 'Encaissements', 'Prélèvements', 'Solde'], SEM.map((x) => [maj(dLong(x.date)), x.statut, x.entrees ? eur(x.entrees) : '', x.sorties.map((s) => s[0] + ' ' + eur(-s[1])).join(', '), eur(x.solde)]),
    { columnStyles: { 2: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } } });
  const plan = calculPlan();
  titre('Plan de vol à six mois', plan.ciel + ' · point bas ' + eur(plan.bas * 100) + ' (' + SIM.quand[plan.kb] + ') · fin avril ' + eur(plan.fin * 100));
  table(['Quinzaine', 'Date', 'Mouvement net', 'Trésorerie', 'Factures Logista d’avance'], [[maj(SIM.quand[0]), dNumA(SIM.dates[0]), '', eur(SIM.depart * 100), F1.format(SIM.depart / SIM.seuil)]]
    .concat(plan.det.map((x, i) => [maj(SIM.quand[i + 1]), dNumA(SIM.dates[i + 1]), eur(x.total * 100, false, true), eur(x.solde * 100), F1.format(x.solde / SIM.seuil)])),
  { columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right', fontStyle: 'bold' }, 4: { halign: 'right' } } });
  titre('Points d’attention');
  table(['Point', 'Détail'], construireAlertes().filter((a) => !a.traitee).map((a) => [a.titre, a.texte]), { columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' } } });
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(...GRIS);
    doc.text(PDF_T('Cockpit Buraliste · ' + D.meta.tabac + ' · les chiffres, les noms et les situations présentés sont des exemples'), mg, H - 9);
    doc.text('Page ' + i + ' / ' + n, W - mg, H - 9, { align: 'right' });
  }
  return doc.output('blob');
}

async function exporter(cle, format) {
  try {
    if (format === 'pdf') {
      toast('Préparation du PDF…');
      const blob = await construirePack();
      await enregistrer('cockpit-buraliste-pack-septembre-2026.pdf', blob);
      return;
    }
    const def = EXPORTS[cle];
    if (!def) return;
    const specs = def.specs.map((k) => SPECS[k]());
    if (format === 'csv') {
      const csv = versCSV(specs[0]);
      await enregistrer('cockpit-' + def.nom + '.csv', new Blob([csv], { type: 'text/csv;charset=utf-8' }), versTSV(specs[0]));
      return;
    }
    toast('Préparation du fichier Excel…');
    const blob = await construireClasseur(specs, def.titre);
    await enregistrer('cockpit-' + def.nom + '.xlsx', blob);
  } catch (err) {
    toast(err && err.message === 'chargement' ? 'L’outil d’export ne s’est pas chargé. Vérifiez la connexion, puis réessayez.' : 'L’export n’a pas abouti.');
    if (window.console) console.error(err);
  }
}
window.__cockpitTest = { construireClasseur: (cle) => construireClasseur(EXPORTS[cle].specs.map((k) => SPECS[k]()), EXPORTS[cle].titre), construirePack, versCSV: (cle) => versCSV(SPECS[cle]()) };
