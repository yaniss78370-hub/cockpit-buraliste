import os
#!/usr/bin/env python3
"""Jeu de données de la version test Cockpit Buraliste.

Tabac d'exemple « Le Balto », gérant Julien. Tous les montants sont en centimes.
Les chiffres déjà publiés sur cockpit-buraliste.fr et dans les films sont repris tels quels :
atterrissage 47 380 € (dont 37 520 € vraiment à vous), semaine 49 120 → 47 380 €,
Logista 29 330 € (et 29 180 €), FDJ 5 900 € / 5 540 €, recharges 3 470 €, timbres 2 360 €,
URSSAF 1 400 €, écart FDJ −45 € (jeudi, 14:31:08), stock 41 280 / 41 105 €, plan de vol 66 680 €.
"""
import json, random, math, datetime as dt
from collections import defaultdict

R = random.Random(20261013)
D = dt.date
ONE = dt.timedelta(days=1)
TODAY = D(2026, 10, 13)
START = D(2026, 1, 1)
BANK_START = D(2026, 7, 8)   # 14 semaines : du mercredi 8 juillet au mardi 13 octobre
INV_START = D(2026, 7, 1)

def c(e):
    """euros -> centimes (int)"""
    return int(round(e * 100))

def days(a, b):
    d = a
    while d <= b:
        yield d
        d += ONE

def iso(d):
    return d.isoformat()

# ---------------------------------------------------------------- calendrier
FERIES = {D(2026, 1, 1), D(2026, 4, 3), D(2026, 4, 6), D(2026, 5, 1), D(2026, 5, 8), D(2026, 5, 14),
          D(2026, 5, 25), D(2026, 7, 14), D(2026, 8, 15), D(2026, 11, 1), D(2026, 11, 11), D(2026, 12, 25)}
FERME = {D(2026, 1, 1), D(2026, 5, 1)}  # jours où le tabac est fermé

def ouvre_banque(d):
    return d.weekday() < 5 and d not in FERIES

def jour_ouvre_suivant(d, inclus=True):
    if not inclus:
        d += ONE
    while not ouvre_banque(d):
        d += ONE
    return d

def iso_semaine(d):
    return d.isocalendar()[1]

# ---------------------------------------------------------------- modèle de ventes
FAM = ['tabac', 'fdj', 'pmu', 'recharges', 'timbres', 'presse', 'vape', 'cbd', 'boissons', 'cafe',
       'confiserie', 'accessoires', 'divers']
BOUTIQUE = ['vape', 'cbd', 'boissons', 'cafe', 'confiserie', 'accessoires', 'divers']
TVA_VENTE = {'vape': 0.20, 'cbd': 0.20, 'boissons': 0.10, 'cafe': 0.10, 'confiserie': 0.12,
             'accessoires': 0.20, 'divers': 0.20}
COUT = {'vape': 0.60, 'cbd': 0.50, 'boissons': 0.60, 'cafe': 0.35, 'confiserie': 0.68,
        'accessoires': 0.62, 'divers': 0.66}
TAUX = {'tabac': 0.084, 'fdj': 0.05, 'pmu': 0.025, 'recharges': 0.036, 'timbres': 0.017, 'presse': 0.18}
PART_CB = {'tabac': 0.72, 'fdj': 0.25, 'pmu': 0.15, 'recharges': 0.75, 'timbres': 0.65, 'presse': 0.5,
           'vape': 0.8, 'cbd': 0.8, 'boissons': 0.75, 'cafe': 0.55, 'confiserie': 0.7,
           'accessoires': 0.78, 'divers': 0.8}
BASE = {'tabac': 2287, 'fdj': 4150, 'pmu': 600, 'recharges': 515, 'timbres': 343, 'presse': 136,
        'boissons': 118, 'cafe': 58, 'confiserie': 90, 'accessoires': 75, 'divers': 20}
MOIS = {  # facteurs janvier → octobre
    'tabac': [0.95, 0.92, 0.98, 1.00, 1.02, 1.03, 0.98, 0.88, 1.00, 1.00],
    'fdj': [1.00, 0.94, 1.00, 0.98, 1.00, 1.02, 0.95, 0.86, 0.99, 1.00],
    'pmu': [1.00, 0.97, 1.03, 1.02, 1.00, 1.00, 0.94, 0.90, 1.00, 1.00],
    'recharges': [1.00, 0.98, 1.00, 1.00, 1.00, 1.02, 1.05, 0.95, 1.00, 1.00],
    'timbres': [1.05, 1.00, 1.02, 1.00, 0.98, 0.97, 0.90, 0.85, 1.05, 1.00],
    'presse': [1.02, 1.00, 1.00, 0.98, 0.98, 0.97, 0.92, 0.85, 1.00, 1.00],
    'boissons': [0.85, 0.85, 0.95, 1.00, 1.10, 1.25, 1.35, 1.20, 1.05, 1.00],
    'cafe': [1.08, 1.06, 1.03, 1.00, 0.97, 0.94, 0.90, 0.85, 1.00, 1.03],
    'confiserie': [0.95, 0.98, 1.00, 1.02, 1.00, 1.00, 0.95, 0.90, 1.02, 1.03],
    'accessoires': [1, 1, 1, 1, 1, 1, 1, 0.92, 1, 1],
    'divers': [1] * 10,
}
VAPE_HT = [5600, 5200, 5500, 5400, 5700, 5900, 5300, 4800, 5600, 5500]   # € HT par mois
CBD_HT = [650, 700, 780, 900, 1500, 2300, 3100, 3600, 4600, 5400]       # avril 900 € → octobre 5 400 €
WD = {
    'tabac': [1.0, 0.98, 1.0, 1.02, 1.12, 1.15, 0.62],
    'fdj': [0.86, 1.0, 0.95, 1.05, 1.25, 1.36, 0.62],
    'pmu': [0.9, 0.95, 0.95, 1.0, 1.1, 1.35, 0.85],
    'boutique': [0.95, 0.95, 0.98, 1.0, 1.12, 1.3, 0.7],
    'cafe': [1.15, 1.12, 1.1, 1.1, 1.05, 0.8, 0.4],
}
for k, v in WD.items():
    m = sum(v) / 7
    WD[k] = [x / m for x in v]

def wd_of(f):
    if f in WD:
        return WD[f]
    if f in ('recharges', 'timbres', 'presse'):
        return WD['tabac']
    if f == 'cafe':
        return WD['cafe']
    return WD['boutique']

jours_ouverts_mois = defaultdict(int)
for d in days(START, D(2026, 10, 31)):
    if d not in FERME:
        jours_ouverts_mois[d.month] += 1

VENTES = {}  # iso -> dict famille -> centimes TTC
for d in days(START, TODAY):
    if d in FERME:
        VENTES[iso(d)] = {f: 0 for f in FAM}
        continue
    m = d.month - 1
    v = {}
    for f in FAM:
        bruit = R.lognormvariate(0, 0.075)
        if f == 'vape':
            base = VAPE_HT[m] * 1.2 / jours_ouverts_mois[d.month]
            fm = 1
        elif f == 'cbd':
            base = CBD_HT[m] * 1.2 / jours_ouverts_mois[d.month]
            fm = 1
        else:
            base = BASE[f]
            fm = MOIS[f][m]
        v[f] = c(base * fm * wd_of(f)[d.weekday()] * bruit)
    VENTES[iso(d)] = v

# Les jeux de la semaine du 5 octobre, repris du site (lundi → vendredi), puis samedi et dimanche.
FDJ_PJ = {'2026-10-05': c(3412.50), '2026-10-06': c(4105.00), '2026-10-07': c(3870.20),
          '2026-10-08': c(4262.40), '2026-10-09': c(5018.60), '2026-10-10': c(5486.30), '2026-10-11': c(2794.10)}
for k, val in FDJ_PJ.items():
    VENTES[k]['fdj'] = val
# Strator : identique, sauf jeudi 8 octobre (−45 €, trois tickets à gratter absents de la caisse)
# et un ancien écart expliqué le 15 septembre (+12 €, ticket Loto saisi deux fois).
STRATOR_FDJ = {k: v['fdj'] for k, v in VENTES.items()}
STRATOR_FDJ['2026-10-08'] -= c(45)
STRATOR_FDJ['2026-09-15'] += c(12)

# Rubriques du CA Strator pour les jeux FDJ : « Jeux instantanés » (grattage) et « Loto » (tirages et paris sportifs).
# Taux de commission calibrés sur les relevés FDJ (repris de l'outil Atterrissage FDJ) : 6,83 % et 4,11 %.
R2 = random.Random(7707)          # générateur à part : les autres tirages restent identiques
TAUX_FDJ = {'ji': 0.0683, 'loto': 0.0411}
PART_JI = [0.70, 0.72, 0.69, 0.76, 0.70, 0.68, 0.78]   # lun → dim (Loto lun., mer., sam. ; EuroMillions mar., ven.)
JI_PJ, LOTO_PJ = {}, {}
for d in days(START, TODAY):
    k = iso(d)
    t = VENTES[k]['fdj']
    JI_PJ[k] = round(t * (PART_JI[d.weekday()] + R2.uniform(-0.02, 0.02)))
    LOTO_PJ[k] = t - JI_PJ[k]
JI_ST, LOTO_ST = dict(JI_PJ), dict(LOTO_PJ)
JI_ST['2026-10-08'] -= c(45)      # trois tickets à gratter passés au terminal FDJ, absents de la caisse
LOTO_ST['2026-09-15'] += c(12)    # ticket Loto saisi deux fois en caisse
def com_fdj(ji, lo):
    return ji * TAUX_FDJ['ji'] + lo * TAUX_FDJ['loto']
TAUX['fdj'] = round(com_fdj(sum(JI_PJ.values()), sum(LOTO_PJ.values())) / sum(JI_PJ[k] + LOTO_PJ[k] for k in JI_PJ), 4)

# ---------------------------------------------------------------- gains payés (jeux), semaines FDJ / PMU
GAINS_FDJ = {}
GAINS_PMU = {}
for d in days(START, TODAY):
    k = iso(d)
    GAINS_FDJ[k] = c(VENTES[k]['fdj'] / 100 * R.uniform(0.70, 0.785))
    GAINS_PMU[k] = c(VENTES[k]['pmu'] / 100 * R.uniform(0.64, 0.73))

def lundi(d):
    return d - dt.timedelta(days=d.weekday())

def semaines():
    d = lundi(START)
    out = []
    while d <= TODAY:
        out.append(d)
        d += dt.timedelta(days=7)
    return out

def somme(dic, a, b, f=None):
    t = 0
    for d in days(max(a, START), min(b, TODAY)):
        t += dic[iso(d)][f] if f else dic[iso(d)]
    return t

# soldes forcés (repris du site)
FORCE_FDJ = {D(2026, 9, 28): c(5640), D(2026, 10, 5): c(5900)}      # S40 → prélevé mer. 7, S41 → mer. 14
FORCE_PMU = {D(2026, 10, 5): c(1240)}                                # S41 → prélevé mar. 13
FORCE_RECH = {D(2026, 10, 5): c(3470)}                               # S41 → prélevé jeu. 15
FORCE_TIMB = {D(2026, 10, 5): c(2360)}                               # S41 → prélevé lun. 12

RELEVES = {'fdj': [], 'pmu': [], 'recharges': [], 'timbres': []}
for s in semaines():
    fin = s + dt.timedelta(days=6)
    if fin > TODAY:
        continue
    # FDJ
    ventes = somme(VENTES, s, fin, 'fdj')
    ji_w, lo_w = somme(JI_PJ, s, fin), somme(LOTO_PJ, s, fin)
    ji_st, lo_st = somme(JI_ST, s, fin), somme(LOTO_ST, s, fin)
    eps = c(R2.uniform(-35, 35))
    if s == D(2026, 10, 5):
        # S41 : l'estimation Strator doit finir 46,80 € sous le relevé (les 45 € de tickets absents, et l'arrondi de commission)
        eps = round(-c(46.80) - ((ji_st + lo_st) - (ji_w + lo_w)) + (com_fdj(ji_st, lo_st) - com_fdj(ji_w, lo_w)))
    com = round(com_fdj(ji_w, lo_w)) + eps
    gains = somme(GAINS_FDJ, s, fin)
    if s in FORCE_FDJ:
        cible = FORCE_FDJ[s]
        delta = (ventes - com - cible) - gains
        GAINS_FDJ[iso(fin)] += delta
        gains += delta
    solde = ventes - gains - com
    RELEVES['fdj'].append({'semaine': iso_semaine(s), 'du': iso(s), 'au': iso(fin), 'ventes': ventes, 'gains': gains,
                           'commission': com, 'solde': solde, 'prelevement': iso(s + dt.timedelta(days=9)),
                           'ji': ji_w, 'loto': lo_w})
    # PMU
    enj = somme(VENTES, s, fin, 'pmu')
    comp = c(enj / 100 * TAUX['pmu'])
    gp = somme(GAINS_PMU, s, fin)
    if s in FORCE_PMU:
        delta = (enj - comp - FORCE_PMU[s]) - gp
        GAINS_PMU[iso(fin)] += delta
        gp += delta
    RELEVES['pmu'].append({'semaine': iso_semaine(s), 'du': iso(s), 'au': iso(fin), 'ventes': enj, 'gains': gp,
                           'commission': comp, 'solde': enj - gp - comp, 'prelevement': iso(s + dt.timedelta(days=8))})
    # recharges (Logista) : jeudi suivant
    vr = somme(VENTES, s, fin, 'recharges')
    if s in FORCE_RECH:
        cible = FORCE_RECH[s]
        com_r = c(vr / 100 * TAUX['recharges'])
        # on ajuste les ventes du dimanche pour tomber juste
        vr_cible = round(cible / (1 - TAUX['recharges']))
        VENTES[iso(fin)]['recharges'] += vr_cible - vr
        vr = vr_cible
        com_r = vr - cible
    else:
        com_r = c(vr / 100 * TAUX['recharges'])
    RELEVES['recharges'].append({'semaine': iso_semaine(s), 'du': iso(s), 'au': iso(fin), 'ventes': vr,
                                 'commission': com_r, 'solde': vr - com_r, 'prelevement': iso(s + dt.timedelta(days=10))})
    # timbres (État) : lundi suivant
    vt = somme(VENTES, s, fin, 'timbres')
    if s in FORCE_TIMB:
        cible = FORCE_TIMB[s]
        vt_cible = round(cible / (1 - TAUX['timbres']))
        VENTES[iso(fin)]['timbres'] += vt_cible - vt
        vt = vt_cible
        com_t = vt - cible
    else:
        com_t = c(vt / 100 * TAUX['timbres'])
    RELEVES['timbres'].append({'semaine': iso_semaine(s), 'du': iso(s), 'au': iso(fin), 'ventes': vt,
                               'commission': com_t, 'solde': vt - com_t, 'prelevement': iso(s + dt.timedelta(days=7))})

def releve(nom, lundi_sem):
    for r in RELEVES[nom]:
        if r['du'] == iso(lundi_sem):
            return r
    return None

# ---------------------------------------------------------------- caisse : espèces / CB
# Encaissements nets visés (site) : lundi 12 → 5 090 €, mardi 13 → 6 330 € (dont PMU 1 240 € prélevé).
# Espèces au coffre, de samedi 10 à mardi 13 : 5 020 €.
def total_ventes(k):
    return sum(VENTES[k].values())

def ajuste_net(k, cible):
    """Ajuste les gains FDJ payés du jour pour que (ventes − gains) = cible."""
    net = total_ventes(k) - GAINS_FDJ[k] - GAINS_PMU[k]
    GAINS_FDJ[k] += net - cible

ajuste_net('2026-10-12', c(5090))
ajuste_net('2026-10-13', c(6330))
RJ, RL = {}, {}
for d in days(START, TODAY):
    k = iso(d)
    RL[k] = round(GAINS_FDJ[k] * R2.uniform(0.08, 0.14))
    RJ[k] = GAINS_FDJ[k] - RL[k]
# recalcule le relevé FDJ de la semaine en cours n'est pas nécessaire (semaine non close)

CB = {}
ESP = {}
for d in days(START, TODAY):
    k = iso(d)
    cb = 0
    esp = 0
    for f in FAM:
        part = PART_CB[f] * R.uniform(0.96, 1.04)
        x = round(VENTES[k][f] * min(part, 0.97))
        cb += x
        esp += VENTES[k][f] - x
    CB[k] = cb
    ESP[k] = esp - GAINS_FDJ[k] - GAINS_PMU[k]   # espèces nettes du jour (gains payés en espèces)

# espèces de samedi 10 → mardi 13 = 5 020 € : on déplace l'écart entre CB et espèces le mardi
acc = sum(ESP[k] for k in ['2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13'])
delta = c(5020) - acc
ESP['2026-10-13'] += delta
CB['2026-10-13'] -= delta
assert CB['2026-10-13'] > 0

# ---------------------------------------------------------------- tabac : livraisons Logista
LIVRAISONS = []
d = D(2026, 1, 14)
while d <= D(2026, 10, 21):
    LIVRAISONS.append(d)
    d += dt.timedelta(days=14)
FACT_TABAC = {}
for liv in LIVRAISONS:
    if liv > TODAY:
        continue
    vt = somme(VENTES, liv - dt.timedelta(days=14), liv - ONE, 'tabac')
    FACT_TABAC[liv] = c(vt / 100 * (1 - TAUX['tabac']) * R.uniform(0.985, 1.02))
FACT_TABAC[D(2026, 9, 23)] = c(29180)
FACT_TABAC[D(2026, 10, 7)] = c(29330)
# stock tabac théorique au 13 octobre (prix d'achat) : 27 940 €
achats_tabac = sum(v for k, v in FACT_TABAC.items())
cout_ventes_tabac = c(sum(VENTES[iso(d)]['tabac'] for d in days(START, TODAY)) / 100 * (1 - TAUX['tabac']))
STOCK_TABAC_FIN = c(27940)
STOCK_TABAC_DEBUT = STOCK_TABAC_FIN - achats_tabac + cout_ventes_tabac

# ---------------------------------------------------------------- charges (P&L + banque)
# montant mensuel en centimes, jour de prélèvement, compte, libellé bancaire, contrepartie, rubrique P&L
CHARGES = [
    # (cle, libellé, rubrique, montant mensuel HT, tva, jour, compte, libellé banque, fournisseur, mode)
    ('loyer', 'Loyer et charges locatives', 'Loyer et charges', 3100, 0.0, 5, 'bnp', 'PRLV SEPA SCI DES TILLEULS LOYER', 'SCI des Tilleuls (bailleur)', 'Prélèvement'),
    ('credit', 'Échéance de prêt (agencement 2022)', 'Charges financières', 620, 0.0, 5, 'bnp', 'ECHEANCE PRET N 0058 7712', 'BNP Paribas, prêt agencement', 'Prélèvement'),
    ('edf', 'Électricité', 'Énergie', 448, 0.2, 20, 'bnp', 'PRLV SEPA EDF ENTREPRISES', 'Fournisseur d’électricité', 'Prélèvement'),
    ('assurance', 'Assurance multirisque commerce', 'Assurances', 295, 0.0, 9, 'bnp', 'PRLV SEPA ASSURANCE MULTIRISQUE PRO', 'Assureur multirisque', 'Prélèvement'),
    ('honoraires', 'Honoraires de l’expert-comptable', 'Honoraires', 440, 0.2, 9, 'bnp', 'PRLV SEPA CABINET COMPTABLE', 'Cabinet comptable', 'Prélèvement'),
    ('strator', 'Logiciel de caisse Strator', 'Logiciels et télécoms', 129, 0.2, 1, 'bnp', 'PRLV SEPA STRATOR ABONNEMENT', 'Strator', 'Prélèvement'),
    ('orange', 'Internet et téléphone', 'Logiciels et télécoms', 62, 0.2, 8, 'bnp', 'PRLV SEPA OPERATEUR TELECOM PRO', 'Opérateur télécom', 'Prélèvement'),
    ('telesurv', 'Télésurveillance et alarme', 'Logiciels et télécoms', 59, 0.2, 2, 'bnp', 'PRLV SEPA TELESURVEILLANCE', 'Société de télésurveillance', 'Prélèvement'),
    ('tpe', 'Location du terminal de paiement', 'Banque et monétique', 38, 0.2, 1, 'bnp', 'LOCATION TPE', 'BNP Paribas', 'Prélèvement'),
    ('frais_bnp', 'Frais de tenue de compte', 'Banque et monétique', 48, 0.0, 1, 'bnp', 'FRAIS TENUE DE COMPTE PRO', 'BNP Paribas', 'Prélèvement'),
    ('frais_bp', 'Frais de tenue de compte', 'Banque et monétique', 32, 0.0, 1, 'bp', 'COTISATION OFFRE PRO', 'Banque Populaire', 'Prélèvement'),
    ('syndicat', 'Chambre syndicale des buralistes', 'Cotisations professionnelles', 35, 0.0, 7, 'bnp', 'PRLV SEPA CHAMBRE SYNDICALE', 'Chambre syndicale', 'Prélèvement'),
    ('ssi', 'Cotisations sociales du gérant', 'Cotisations du gérant', 2380, 0.0, 20, 'bnp', 'PRLV SEPA URSSAF TRAVAILLEURS INDEP', 'URSSAF (indépendants)', 'Prélèvement'),
    ('urssaf', 'Cotisations sociales des salariés', 'Personnel', 1400, 0.0, 16, 'bnp', 'PRLV SEPA URSSAF', 'URSSAF', 'Prélèvement'),
    ('retraite', 'Retraite complémentaire et prévoyance', 'Personnel', 268, 0.0, 26, 'bnp', 'PRLV SEPA RETRAITE COMPLEMENTAIRE', 'Caisse de retraite complémentaire', 'Prélèvement'),
]
SALAIRES = [('Inès', 'temps plein', 1704), ('Mehdi', '30 h', 1286), ('Léa', 'week-ends', 862)]   # nets versés
SALAIRES_BRUT = 2190 + 1650 + 1105
# hausses dans l'année (indexation)
def montant_charge(cle, mois):
    base = dict((x[0], x[3]) for x in CHARGES)[cle]
    if cle == 'loyer' and mois >= 7:
        base = round(base * 1.032)           # indexation ILC en juillet
    if cle == 'edf' and mois <= 1:
        base = round(base / 1.18 * 1.02)     # avant la hausse de février
    if cle == 'edf' and mois in (6, 7, 8):
        base = round(base * 1.12)            # climatisation l'été
    if cle == 'urssaf' and mois < 6:
        base = 1120                          # avant l'embauche de Léa
    return base

# ---------------------------------------------------------------- P&L mensuel
def mois_jours(m):
    a = D(2026, m, 1)
    b = (D(2026, m + 1, 1) - ONE) if m < 12 else D(2026, 12, 31)
    return a, b

def pnl_periode(a, b, prorata=1.0):
    """Compte de résultat de gestion entre deux dates (centimes)."""
    v = {f: somme(VENTES, a, min(b, TODAY), f) for f in FAM}
    r = {}
    r['tabac_ventes'] = v['tabac']
    r['tabac_cout'] = round(v['tabac'] * (1 - TAUX['tabac']))
    r['tabac_marge'] = r['tabac_ventes'] - r['tabac_cout']
    for f in ('fdj', 'pmu', 'recharges', 'timbres', 'presse'):
        r[f + '_ventes'] = v[f]
        r[f + '_marge'] = round(v[f] * TAUX[f])
    r['fdj_marge'] = round(com_fdj(somme(JI_PJ, a, min(b, TODAY)), somme(LOTO_PJ, a, min(b, TODAY))))
    for f in BOUTIQUE:
        ht = round(v[f] / (1 + TVA_VENTE[f]))
        r[f + '_ventes'] = ht
        cr = COUT[f]
        r[f + '_cout'] = round(ht * cr)
        r[f + '_marge'] = ht - r[f + '_cout']
    return r

PNL = []
NOISE_CH = {}
for m in range(1, 11):
    a, b = mois_jours(m)
    if m == 10:
        b = TODAY
    r = pnl_periode(a, b)
    jours = (b - a).days + 1
    frac = jours / ((mois_jours(m)[1] - a).days + 1)
    ch = {}
    def add(rub, x):
        ch[rub] = ch.get(rub, 0) + x
    for cle, lib, rub, mt, tva, jour, cpt, lb, four, mode in CHARGES:
        if cle == 'credit':
            add('Charges financières', c(24 - (m - 1) * 1.2) * frac)  # intérêts seulement
            continue
        if cle in ('urssaf', 'retraite'):
            continue
        add(rub, c(montant_charge(cle, m)) * frac)
    if m >= 6:
        add('Personnel', c(SALAIRES_BRUT + 690 + 140) * frac)     # salaires bruts + charges patronales + mutuelle (Léa depuis juin)
    else:
        add('Personnel', c(2190 + 1650 + 545 + 112) * frac)
    add('Entretien et fournitures', c(R.uniform(240, 320)) * frac)
    add('Impôts et taxes', c(205) * frac)
    add('Démarque et écarts', c(R.uniform(230, 340)) * frac)
    add('Publicité et divers', c(R.uniform(120, 210)) * frac)
    add('Banque et monétique', c(CB_COM := 0) * 0)
    cb_mois = sum(CB[iso(d)] for d in days(a, b))
    add('Banque et monétique', round(cb_mois * 0.0025))
    add('Amortissements', c(720) * frac)
    for k in ch:
        ch[k] = round(ch[k])
    PNL.append({'mois': m, 'du': iso(a), 'au': iso(b), 'partiel': m == 10, 'produits': r, 'charges': ch})

# N-1 (même mois 2025) : coefficients simples par ligne
# 2026 par rapport à 2025 (même mois) : N-1 = N / coefficient
N1 = {'tabac': 1.025, 'fdj': 0.965, 'pmu': 0.98, 'recharges': 0.95, 'timbres': 0.94, 'presse': 0.92,
      'vape': 1.08, 'cbd': None, 'boissons': 1.03, 'cafe': 1.05, 'confiserie': 1.0, 'accessoires': 1.02, 'divers': 1.0}
CBD_2025 = [0, 0, 0, 0, 0, 0, 0, 0, 380, 520]   # rayon lancé en septembre 2025

# ---------------------------------------------------------------- banque (1er juillet → 13 octobre, réel)
MOUV = []   # mouvements bancaires
def mv(date, compte, libelle, montant, cat, contre, statut='réel', facture=None, note=None):
    MOUV.append({'date': iso(date), 'compte': compte, 'libelle': libelle, 'montant': montant,
                 'categorie': cat, 'contrepartie': contre, 'statut': statut, 'facture': facture, 'note': note})

FACTURES = []
def facture(**kw):
    kw.setdefault('lignes', [])
    kw['id'] = 'F' + str(len(FACTURES) + 1).zfill(4)
    FACTURES.append(kw)
    return kw['id']

# remises CB (jour ouvré suivant), dépôts d'espèces (vendredi)
cb_en_attente = []
caisse = 0
# espèces déjà au coffre au 1er juillet (depuis le vendredi 26 juin)
for d in days(D(2026, 7, 4), D(2026, 7, 7)):
    caisse += ESP[iso(d)]
CAISSE_DEBUT = caisse
for d in days(D(2026, 6, 26), D(2026, 6, 30)):
    pass

def remise_cb(dvente):
    return jour_ouvre_suivant(dvente, inclus=False)

for d in days(D(2026, 6, 26), TODAY):
    k = iso(d)
    if CB[k] and d >= D(2026, 6, 26):
        dc = remise_cb(d)
        if BANK_START <= dc <= TODAY:
            mv(dc, 'bnp', 'REMISE CB DU ' + d.strftime('%d/%m') + ' TPE 4471205', CB[k], 'Encaissements CB', 'Ventes par carte')

# collectes : chaque vendredi à 20 h 30, après la fermeture ; les espèces comptées sont versées à la BNP.
# Écart = compté − théorique (Z de caisse, gains de jeux payés déduits).
ECART_COLLECTE = {'2026-07-17': -c(8.50), '2026-07-31': c(3.20), '2026-08-21': -c(12.40),
                  '2026-09-11': -c(19.60), '2026-09-25': -c(12.40)}
COLLECTES = []
for d in days(BANK_START, TODAY):
    k = iso(d)
    caisse += ESP[k]
    if d.weekday() == 4 and d <= D(2026, 10, 9):
        jd = jour_ouvre_suivant(d)
        e = ECART_COLLECTE.get(k, 0)
        mv(jd, 'bnp', 'VERSEMENT ESPECES AGENCE', caisse + e, 'Dépôt d’espèces', 'Caisse du tabac')
        COLLECTES.append({'date': k, 'heure': '20:30', 'theorique': caisse, 'recupere': caisse + e, 'ecart': e, 'depot': iso(jd)})
        caisse = 0
CAISSE_FIN = caisse
assert CAISSE_FIN == c(5020), CAISSE_FIN

# relevés hebdomadaires : FDJ (mer.), PMU (mar.), recharges (jeu.), timbres (lun.)
for r in RELEVES['fdj']:
    dp = jour_ouvre_suivant(D.fromisoformat(r['prelevement']))
    r['prelevement'] = iso(dp)
    if BANK_START <= dp <= TODAY:
        fid = facture(date=iso(D.fromisoformat(r['au']) + ONE), fournisseur='FDJ', objet='Relevé hebdomadaire, semaine ' + str(r['semaine']),
                      categorie='Jeux FDJ', ttc=r['solde'], ht=r['solde'], tva=0, echeance=iso(dp), mode='Prélèvement', statut='Payée',
                      lignes=[{'d': 'Ventes de jeux (Profession Jeux)', 'q': 1, 'ht': r['ventes'], 'tva': 0, 'fam': 'Jeux FDJ'},
                              {'d': 'Gains payés en point de vente', 'q': 1, 'ht': -r['gains'], 'tva': 0, 'fam': 'Jeux FDJ'},
                              {'d': 'Commission du détaillant', 'q': 1, 'ht': -r['commission'], 'tva': 0, 'fam': 'Commissions'}])
        mv(dp, 'fdj', 'PRLV SEPA LA FRANCAISE DES JEUX RELEVE S' + str(r['semaine']), -r['solde'], 'Jeux FDJ', 'FDJ', facture=fid)
for r in RELEVES['pmu']:
    dp = jour_ouvre_suivant(D.fromisoformat(r['prelevement']))
    r['prelevement'] = iso(dp)
    if BANK_START <= dp <= TODAY:
        fid = facture(date=iso(D.fromisoformat(r['au']) + ONE), fournisseur='PMU', objet='Relevé hebdomadaire, semaine ' + str(r['semaine']),
                      categorie='Jeux PMU', ttc=r['solde'], ht=r['solde'], tva=0, echeance=iso(dp), mode='Prélèvement', statut='Payée',
                      lignes=[{'d': 'Enjeux enregistrés', 'q': 1, 'ht': r['ventes'], 'tva': 0, 'fam': 'Jeux PMU'},
                              {'d': 'Gains payés', 'q': 1, 'ht': -r['gains'], 'tva': 0, 'fam': 'Jeux PMU'},
                              {'d': 'Commission du point de vente', 'q': 1, 'ht': -r['commission'], 'tva': 0, 'fam': 'Commissions'}])
        mv(dp, 'bnp', 'PRLV SEPA PMU RELEVE HEBDO S' + str(r['semaine']), -r['solde'], 'Jeux PMU', 'PMU', facture=fid)
for r in RELEVES['recharges']:
    dp = jour_ouvre_suivant(D.fromisoformat(r['prelevement']))
    r['prelevement'] = iso(dp)
    if BANK_START <= dp <= TODAY:
        fid = facture(date=iso(D.fromisoformat(r['au']) + ONE), fournisseur='Logista', objet='Recharges et cartes prépayées, semaine ' + str(r['semaine']),
                      categorie='Recharges', ttc=r['solde'], ht=r['solde'], tva=0, echeance=iso(dp), mode='Prélèvement', statut='Payée',
                      lignes=[{'d': 'Recharges téléphoniques et cartes prépayées vendues', 'q': 1, 'ht': r['ventes'], 'tva': 0, 'fam': 'Recharges'},
                              {'d': 'Commission', 'q': 1, 'ht': -r['commission'], 'tva': 0, 'fam': 'Commissions'}])
        mv(dp, 'bp', 'PRLV SEPA LOGISTA FRANCE RECHARGES S' + str(r['semaine']), -r['solde'], 'Recharges', 'Logista', facture=fid)
for r in RELEVES['timbres']:
    dp = jour_ouvre_suivant(D.fromisoformat(r['prelevement']))
    r['prelevement'] = iso(dp)
    if BANK_START <= dp <= TODAY:
        fid = facture(date=iso(D.fromisoformat(r['au']) + ONE), fournisseur='DGFiP', objet='Timbres fiscaux et amendes, semaine ' + str(r['semaine']),
                      categorie='Timbres', ttc=r['solde'], ht=r['solde'], tva=0, echeance=iso(dp), mode='Prélèvement', statut='Payée',
                      lignes=[{'d': 'Timbres vendus', 'q': 1, 'ht': r['ventes'], 'tva': 0, 'fam': 'Timbres'},
                              {'d': 'Remise du débitant', 'q': 1, 'ht': -r['commission'], 'tva': 0, 'fam': 'Commissions'}])
        mv(dp, 'bp', 'PRLV SEPA DGFIP TIMBRES S' + str(r['semaine']), -r['solde'], 'Timbres', 'État (DGFiP)', facture=fid)

# Logista tabac : facture à la livraison (mercredi), prélèvement le lundi 12 jours après
TABAC_LIGNES = [('Cigarettes', 0.846), ('Tabac à rouler', 0.104), ('Cigares et cigarillos', 0.028), ('Tabac à chauffer', 0.022)]
for liv, mt in FACT_TABAC.items():
    dp = jour_ouvre_suivant(liv + dt.timedelta(days=12))
    if liv >= D(2026, 6, 20):
        lignes = []
        reste = mt
        for i, (lib, part) in enumerate(TABAC_LIGNES):
            x = round(mt * part) if i < len(TABAC_LIGNES) - 1 else reste
            reste -= x
            lignes.append({'d': lib + ' (prix de cession, remise déduite)', 'q': 1, 'ht': x, 'tva': 0, 'fam': 'Tabac'})
        statut = 'Payée' if dp <= TODAY else 'À payer'
        fid = facture(date=iso(liv), fournisseur='Logista', objet='Livraison cadencée du ' + liv.strftime('%d/%m'), categorie='Tabac',
                      ttc=mt, ht=mt, tva=0, echeance=iso(dp), mode='Prélèvement', statut=statut, lignes=lignes,
                      note='Droits et TVA compris dans le prix de cession.')
        if BANK_START <= dp <= TODAY:
            mv(dp, 'bp', 'PRLV SEPA LOGISTA FRANCE FACT ' + liv.strftime('%Y%m%d'), -mt, 'Tabac (Logista)', 'Logista', facture=fid)

# presse : relevé mensuel du dépositaire, prélevé le 8 du mois suivant
for m in range(6, 10):
    a, b = mois_jours(m)
    vp = somme(VENTES, a, b, 'presse')
    solde = vp - round(vp * TAUX['presse'])
    dp = jour_ouvre_suivant(D(2026, m + 1, 8))
    fid = facture(date=iso(D(2026, m + 1, 3)), fournisseur='Dépositaire de presse', objet='Relevé mensuel ' + a.strftime('%m/%Y'),
                  categorie='Presse', ttc=solde, ht=solde, tva=0, echeance=iso(dp), mode='Prélèvement', statut='Payée',
                  lignes=[{'d': 'Journaux et magazines vendus', 'q': 1, 'ht': vp, 'tva': 0, 'fam': 'Presse'},
                          {'d': 'Commission du diffuseur (18 %)', 'q': 1, 'ht': -(vp - solde), 'tva': 0, 'fam': 'Commissions'}])
    if BANK_START <= dp <= TODAY:
        mv(dp, 'bnp', 'PRLV SEPA DEPOSITAIRE PRESSE RELEVE ' + a.strftime('%m/%Y'), -solde, 'Presse', 'Dépositaire de presse', facture=fid)

# charges mensuelles
for m in range(7, 11):
    for cle, lib, rub, mt, tva, jour, cpt, lb, four, mode in CHARGES:
        dj = jour_ouvre_suivant(D(2026, m, jour))
        if not (BANK_START <= dj <= TODAY):
            continue
        ttc = c(montant_charge(cle, m) * (1 + tva))
        fid = None
        if cle not in ('frais_bnp', 'frais_bp', 'credit'):
            fid = facture(date=iso(D(2026, m, 1)), fournisseur=four, objet=lib + ', ' + D(2026, m, 1).strftime('%m/%Y'), categorie=rub,
                          ttc=ttc, ht=c(montant_charge(cle, m)), tva=ttc - c(montant_charge(cle, m)), echeance=iso(dj), mode=mode,
                          statut='Payée', lignes=[{'d': lib, 'q': 1, 'ht': c(montant_charge(cle, m)), 'tva': round(tva * 100, 1), 'fam': rub}])
        mv(dj, cpt, lb, -ttc, rub if cle != 'credit' else 'Emprunt', four, facture=fid)
    # commissions CB du mois précédent (le 2)
    a, b = mois_jours(m - 1)
    com = round(sum(CB[iso(d)] for d in days(a, b)) * 0.0025)
    dcom = jour_ouvre_suivant(D(2026, m, 2))
    if BANK_START <= dcom <= TODAY:
        mv(dcom, 'bnp', 'COMMISSIONS CB ' + a.strftime('%m/%Y'), -com, 'Banque et monétique', 'BNP Paribas')
    # salaires (dernier jour ouvré du mois), sauf octobre (à venir)
    if m <= 9:
        fin = mois_jours(m)[1]
        while not ouvre_banque(fin):
            fin -= ONE
        for nom, contrat, net in SALAIRES:
            mv(fin, 'bnp', 'VIR SEPA SALAIRE ' + D(2026, m, 1).strftime('%m/%Y') + ' ' + nom.upper(), -c(net), 'Salaires', nom + ' (' + contrat + ')')
    # TVA (CA3 du mois précédent, le 21)
    if m - 1 >= 6:
        p = PNL[m - 2]['produits']
        coll = sum(p[f + '_ventes'] * TVA_VENTE[f] for f in BOUTIQUE)
        ded = sum(p[f + '_cout'] * (0.2 if f in ('vape', 'cbd', 'accessoires', 'divers') else 0.09) for f in BOUTIQUE)
        ded += sum(c(montant_charge(x[0], m - 1) * x[4]) for x in CHARGES)
        tva_due = round(coll - ded)
        dj = jour_ouvre_suivant(D(2026, m, 21))
        if BANK_START <= dj <= TODAY:
            mv(dj, 'bnp', 'PRLV SEPA DGFIP TVA CA3 ' + a.strftime('%m/%Y'), -tva_due, 'TVA', 'État (DGFiP)')

# ---------------------------------------------------------------- fournisseurs de la boutique (factures lues ligne par ligne)
CATALOGUE = {
    'Metro': [
        ('Papier toilette, 12 rouleaux', 6.40, 0.20, 'Entretien'), ('Liquide vaisselle 1 L', 2.35, 0.20, 'Entretien'),
        ('Sacs poubelle 100 L, rouleau de 25', 5.90, 0.20, 'Entretien'), ('Essuie-tout, 4 rouleaux', 4.80, 0.20, 'Entretien'),
        ('Gobelets carton 10 cl, ×100', 3.95, 0.20, 'Café'), ('Sucre en bûchettes, ×500', 7.20, 0.055, 'Café'),
        ('Agitateurs en bois, ×1 000', 4.10, 0.20, 'Café'), ('Lait demi-écrémé UHT 1 L, ×6', 5.94, 0.055, 'Café'),
        ('Coca-Cola 33 cl, ×24', 9.84, 0.055, 'Boissons sans alcool'), ('Eau de source 50 cl, ×24', 4.32, 0.055, 'Boissons sans alcool'),
        ('Boisson énergisante 25 cl, ×24', 26.40, 0.055, 'Boissons sans alcool'), ('Thé glacé pêche 33 cl, ×24', 10.80, 0.055, 'Boissons sans alcool'),
        ('Bière blonde 50 cl, ×24', 27.60, 0.20, 'Boissons alcoolisées'), ('Cidre brut 33 cl, ×12', 11.40, 0.20, 'Boissons alcoolisées'),
        ('Chewing-gums menthe, ×50', 22.50, 0.20, 'Confiserie et snacking'), ('Bonbons assortis, ×100 sachets', 31.00, 0.20, 'Confiserie et snacking'),
        ('Chips nature 45 g, ×20', 8.60, 0.055, 'Confiserie et snacking'), ('Biscuits fourrés, ×24', 9.36, 0.055, 'Confiserie et snacking'),
    ],
    'Boissons Express': [
        ('Coca-Cola 50 cl, ×24', 19.20, 0.055, 'Boissons sans alcool'), ('Eau minérale 1,5 L, ×6', 3.18, 0.055, 'Boissons sans alcool'),
        ('Jus d’orange 25 cl, ×24', 14.40, 0.055, 'Boissons sans alcool'), ('Boisson énergisante 50 cl, ×12', 18.60, 0.055, 'Boissons sans alcool'),
        ('Limonade 33 cl, ×24', 11.50, 0.055, 'Boissons sans alcool'), ('Bière blonde 25 cl, ×24', 16.80, 0.20, 'Boissons alcoolisées'),
        ('Bière IPA 33 cl, ×24', 31.20, 0.20, 'Boissons alcoolisées'), ('Consigne fûts et caisses', 0.0, 0.20, 'Boissons sans alcool'),
    ],
    'Brûlerie du Canal': [
        ('Café en grains, assemblage maison 1 kg', 16.90, 0.055, 'Café'), ('Décaféiné en grains 500 g', 9.80, 0.055, 'Café'),
        ('Chocolat en poudre 1 kg', 8.40, 0.055, 'Café'), ('Pastilles détartrantes machine, ×10', 12.50, 0.20, 'Entretien'),
    ],
    'Liquideo': [],          # rempli plus bas à partir des références vape
    'Grossiste vape': [],
    'Chanvre Distribution': [],
    'Grossiste accessoires': [
        ('Feuilles à rouler slim, boîte de 50', 24.00, 0.20, 'Accessoires fumeurs'), ('Filtres slim, boîte de 34', 19.00, 0.20, 'Accessoires fumeurs'),
        ('Briquets électroniques, présentoir de 50', 21.50, 0.20, 'Accessoires fumeurs'), ('Briquets tempête, ×24', 38.40, 0.20, 'Accessoires fumeurs'),
        ('Étuis à cigarettes, ×12', 27.60, 0.20, 'Accessoires fumeurs'), ('Grinders, ×10', 32.00, 0.20, 'Accessoires fumeurs'),
    ],
}

def exact(refs, cible):
    """Ajuste un prix d'achat (et au besoin un stock) pour que la valeur du stock tombe au centime."""
    for essai in range(60):
        val = sum(r['stock'] * r['pa'] for r in refs)
        rem = cible - val
        if rem == 0:
            return
        for r in refs:
            if r['stock'] and rem % r['stock'] == 0 and abs(rem // r['stock']) < r['pa'] // 3:
                r['pa'] += rem // r['stock']
                return
        refs[essai % len(refs)]['stock'] += 1 if rem > 0 else -1
    raise SystemExit('valeur de stock impossible à caler')

# ---- références vape (148) : e-liquides et matériel
SAVEURS = ['Fraise glacée', 'Classic blond', 'Vanille caramel', 'Menthe polaire', 'Mangue passion', 'Fruits rouges', 'Classic brun',
           'Pomme verte', 'Cerise noire', 'Pastèque', 'Myrtille', 'Citron givré', 'Tabac miel', 'Fraise kiwi', 'Litchi',
           'Café crème', 'Pêche abricot', 'Cola', 'Framboise bleue', 'Ananas coco', 'Menthe chlorophylle', 'Raisin frais',
           'Caramel beurre salé', 'Noisette', 'Grenade', 'Citron fraise', 'Melon', 'Fruit du dragon', 'Tabac blond doux', 'Réglisse']
REFS = []
code = 1
def ref(designation, famille, fournisseur, pa, pv, stock, v4, v4p, cle=None):
    global code
    tendance = 0 if v4p == 0 else (v4 - v4p) / v4p
    couverture = 999 if v4 == 0 else round(stock / (v4 / 28))
    if tendance <= -0.25:
        statut = 'À arrêter'
    elif tendance <= -0.15:
        statut = 'À réduire'
    elif couverture <= 10 or (tendance >= 0.25 and couverture <= 21):
        statut = 'À recommander'
    else:
        statut = 'En rayon'
    REFS.append({'code': 'VAP-' + str(code).zfill(3), 'designation': designation, 'famille': famille, 'fournisseur': fournisseur,
                 'pa': pa, 'pv': pv, 'stock': stock, 'stock_strator': stock, 'v4': v4, 'v4p': v4p,
                 'tendance': round(tendance * 100), 'couverture': couverture, 'statut': statut, 'cle': cle})
    code += 1

for s in SAVEURS:
    if s in ('Classic blond', 'Menthe polaire', 'Fraise glacée', 'Tabac blond doux'):
        niveaux = [3, 6, 11, 16]
    elif s in ('Mangue passion', 'Fruits rouges', 'Classic brun', 'Pomme verte', 'Cerise noire', 'Pastèque', 'Myrtille', 'Citron givré'):
        niveaux = [6, 11, 16]
    else:
        niveaux = [6, 11]
    for taux in niveaux:
        v4p = R.randint(6, 34)
        v4 = max(0, round(v4p * R.uniform(0.86, 1.14)))
        stock = R.randint(8, 40)
        ref(s + ' 10 ml, ' + str(taux) + ' mg', 'E-liquide 10 ml', 'Liquideo', c(3.15), c(5.90), stock, v4, v4p)
# 50 ml (sans nicotine, à booster)
for s in SAVEURS:
    v4p = R.randint(3, 16)
    v4 = max(0, round(v4p * R.uniform(0.85, 1.15)))
    ref(s + ' 50 ml, à booster', 'E-liquide 50 ml', 'Liquideo', c(9.40), c(19.90), R.randint(4, 14), v4, v4p)
# sels de nicotine
for s in ['Fraise glacée', 'Classic blond', 'Menthe polaire', 'Mangue passion', 'Fruits rouges', 'Pastèque', 'Myrtille', 'Citron givré']:
    for t in (10, 20):
        v4p = R.randint(5, 22)
        v4 = max(0, round(v4p * R.uniform(0.88, 1.12)))
        ref(s + ' sel de nicotine 10 ml, ' + str(t) + ' mg', 'Sel de nicotine', 'Liquideo', c(3.40), c(6.50), R.randint(6, 26), v4, v4p)
MAT = [('Kit pod 1 000 mAh', 14.20, 29.90), ('Kit pod 1 500 mAh', 18.60, 39.90), ('Kit tube 2 000 mAh', 22.40, 44.90),
       ('Box 80 W', 31.50, 64.90), ('Batterie 18650 3 000 mAh', 4.90, 11.90), ('Chargeur USB-C double', 6.20, 14.90),
       ('Cartouches pod 2 ml 0,8 Ω, ×2', 3.10, 7.90), ('Cartouches pod 2 ml 1,2 Ω, ×2', 3.10, 7.90), ('Cartouches pod 3 ml 0,6 Ω, ×3', 4.40, 10.90),
       ('Résistances mesh 0,4 Ω, ×5', 6.80, 15.90), ('Résistances 0,8 Ω, ×5', 6.10, 13.90), ('Résistances 1,2 Ω, ×5', 6.10, 13.90),
       ('Clearomiseur 2 ml', 8.40, 19.90), ('Clearomiseur 4 ml', 11.20, 24.90), ('Drip tip, ×3', 1.90, 5.90),
       ('Étui silicone pour kit', 2.10, 6.90), ('Booster nicotine 20 mg, ×10', 7.40, 15.90), ('Coton pour reconstructible', 2.80, 6.90)]
for lib, pa, pv in MAT:
    for var in (['noir', 'gris', 'bleu'] if lib.startswith('Kit') or lib.startswith('Box') else ['']):
        nom = lib + (', ' + var if var else '')
        v4p = R.randint(2, 14)
        v4 = max(0, round(v4p * R.uniform(0.85, 1.15)))
        ref(nom, 'Matériel', 'Grossiste vape', c(pa), c(pv), R.randint(2, 12), v4, v4p)
# les trois références du site
for r in REFS:
    if r['designation'] == 'Fraise glacée 10 ml, 11 mg':
        r.update(stock=14, stock_strator=14, v4=67, v4p=50, cle='fraise')
    if r['designation'] == 'Classic blond 10 ml, 11 mg':
        r.update(stock=26, stock_strator=26, v4=27, v4p=33, cle='classic')
    if r['designation'] == 'Vanille caramel 50 ml, à booster':
        r.update(stock=11, stock_strator=11, v4=8, v4p=11, cle='vanille')
for r in REFS:
    r['tendance'] = 0 if r['v4p'] == 0 else round((r['v4'] - r['v4p']) / r['v4p'] * 100)
    r['couverture'] = 999 if r['v4'] == 0 else round(r['stock'] / (r['v4'] / 28))
    t = r['tendance'] / 100
    if t <= -0.25:
        r['statut'] = 'À arrêter'
    elif t <= -0.15:
        r['statut'] = 'À réduire'
    elif r['couverture'] <= 10 or (t >= 0.25 and r['couverture'] <= 21):
        r['statut'] = 'À recommander'
    else:
        r['statut'] = 'En rayon'
# réduire à 148 références exactement
while len(REFS) > 148:
    # retire une référence ordinaire au hasard (jamais les trois du site)
    cand = [i for i, r in enumerate(REFS) if not r['cle'] and r['famille'] in ('E-liquide 10 ml', 'Matériel')]
    REFS.pop(R.choice(cand))
assert len(REFS) == 148, len(REFS)
for i, r in enumerate(REFS):
    r['code'] = 'VAP-' + str(i + 1).zfill(3)

# valeur du stock vape au prix d'achat : 6 210 € théoriques, 6 095 € dans Strator (écart 115 €)
val = sum(r['stock'] * r['pa'] for r in REFS)
cible = c(6210)
# ajuste les stocks du matériel pour atteindre la cible
it = 0
while val != cible and it < 20000:
    it += 1
    diff = cible - val
    cand = [r for r in REFS if not r['cle']]
    r = R.choice(cand)
    if diff > 0 and diff >= r['pa']:
        r['stock'] += 1
        val += r['pa']
    elif diff < 0 and r['stock'] > 3:
        r['stock'] -= 1
        val -= r['pa']
    elif 0 < abs(diff) < min(x['pa'] for x in cand):
        break
exact([x for x in REFS if not x['cle'] and x['famille'] == 'Matériel'] + [x for x in REFS if not x['cle'] and x['famille'] != 'Matériel'],
      cible - sum(x['stock'] * x['pa'] for x in REFS if x['cle']))
val = sum(x['stock'] * x['pa'] for x in REFS)
VAPE_STOCK_THEO = val
for r in REFS:
    r['stock_strator'] = r['stock']
# écarts Strator : quelques références, −115 € au total (recherche exacte au centime)
CIBLE_ECART = c(115)
cands = [r for r in REFS if not r['cle'] and r['stock'] >= 5]
R.shuffle(cands)
cands = cands[:60]
# recherche du plus petit nombre de références (couches successives), quantités de 1 à 4
cands = [r for r in REFS if not r['cle'] and r['stock'] >= 5]
couche = {0: []}
vus = {0}
choix = None
for k in range(1, 7):
    suivante = {}
    for montant, chemin in couche.items():
        utilises = {id(x[0]) for x in chemin}
        for r in cands:
            if id(r) in utilises:
                continue
            for q in (1, 2, 3, 4):
                m2 = montant + q * r['pa']
                if m2 > CIBLE_ECART or m2 in vus:
                    continue
                suivante[m2] = chemin + [(r, q)]
    if CIBLE_ECART in suivante:
        choix = suivante[CIBLE_ECART]
        break
    vus.update(suivante.keys())
    couche = suivante
assert choix, 'pas de combinaison exacte'
for r, q in choix:
    r['stock_strator'] = r['stock'] - q
VAPE_STOCK_STRATOR = sum(r['stock_strator'] * r['pa'] for r in REFS)
assert VAPE_STOCK_STRATOR == c(6210) - c(115), VAPE_STOCK_STRATOR
print('Écarts vape :', [(r['designation'], -q) for r, q in choix])

# ---- CBD : fiches produits et lots
CBD = [
    ('Fleur Lemon Haze, 5 g', 'Fleur', '26-10-B', '2026-10-12', 0.21, 12.50, 34.90, 18, 41),
    ('Fleur Lemon Haze, 2 g', 'Fleur', '26-10-B', '2026-10-12', 0.21, 5.40, 15.90, 24, 63),
    ('Fleur Amnesia, 5 g', 'Fleur', '26-09-D', '2026-09-28', 0.18, 12.90, 34.90, 14, 32),
    ('Fleur Gelato, 3 g', 'Fleur', '26-09-C', '2026-09-21', 0.24, 8.70, 24.90, 16, 29),
    ('Fleur Orange Bud, 5 g', 'Fleur', '26-09-A', '2026-09-07', 0.19, 11.80, 32.90, 9, 18),
    ('Fleur Strawberry, 2 g', 'Fleur', '26-10-A', '2026-10-05', 0.22, 5.10, 14.90, 21, 44),
    ('Huile CBD 10 %, 10 ml', 'Huile', 'H-2609', '2026-09-15', 0.0, 14.80, 34.90, 12, 22),
    ('Huile CBD 20 %, 10 ml', 'Huile', 'H-2609', '2026-09-15', 0.0, 24.50, 54.90, 7, 11),
    ('Huile CBD 30 %, 10 ml', 'Huile', 'H-2608', '2026-08-26', 0.0, 33.00, 74.90, 4, 5),
    ('Infusion CBD camomille, 25 g', 'Infusion', 'I-2609', '2026-09-10', 0.0, 4.20, 11.90, 15, 17),
    ('Infusion CBD menthe, 25 g', 'Infusion', 'I-2609', '2026-09-10', 0.0, 4.20, 11.90, 13, 12),
    ('Baume CBD 500 mg, 30 ml', 'Cosmétique', 'B-2607', '2026-07-30', 0.0, 9.60, 24.90, 8, 6),
    ('Bonbons CBD, sachet de 10', 'Confiserie CBD', 'G-2610', '2026-10-01', 0.0, 5.80, 14.90, 19, 26),
]
CBD_REFS = []
for i, (des, fam, lot, cond, thc, pa, pv, stock, v4) in enumerate(CBD):
    CBD_REFS.append({'code': 'CBD-' + str(i + 1).zfill(3), 'designation': des, 'famille': fam, 'lot': lot, 'conditionne': cond,
                     'thc': thc, 'pa': c(pa), 'pv': c(pv), 'stock': stock, 'stock_strator': stock, 'v4': v4,
                     'analyse': 'Certificat d’analyse du lot reçu' })
val = sum(r['stock'] * r['pa'] for r in CBD_REFS)
# ajuste à 3 120 € théoriques / 3 105 € Strator
cible = c(3120)
k = 0
while val < cible - c(5) and k < 500:
    r = CBD_REFS[k % len(CBD_REFS)]
    if val + r['pa'] <= cible:
        r['stock'] += 1
        val += r['pa']
    k += 1
bonbons = [r for r in CBD_REFS if r['designation'].startswith('Bonbons CBD')][0]
bonbons['pa'] = c(5.00)
exact([r for r in CBD_REFS if r is not bonbons], cible - bonbons['stock'] * bonbons['pa'])
CBD_STOCK_THEO = sum(r['stock'] * r['pa'] for r in CBD_REFS)
for r in CBD_REFS:
    r['stock_strator'] = r['stock']
bonbons['stock_strator'] = bonbons['stock'] - 3     # 3 sachets vendus sans scan : −15 €
# écart Strator : −15 € (un sachet de 2 g mal scanné + arrondis)
CBD_STOCK_STRATOR = sum(r['stock_strator'] * r['pa'] for r in CBD_REFS)
assert CBD_STOCK_STRATOR == CBD_STOCK_THEO - c(15)

# ---- stock par famille (au prix d'achat)
STOCK = [
    {'famille': 'Tabac', 'detail': 'Cigarettes, tabac à rouler, cigares', 'theo': c(27940), 'strator': c(27940)},
    {'famille': 'Cigarette électronique', 'detail': '148 références', 'theo': VAPE_STOCK_THEO, 'strator': VAPE_STOCK_STRATOR},
    {'famille': 'CBD', 'detail': str(len(CBD_REFS)) + ' produits, lots tracés', 'theo': CBD_STOCK_THEO, 'strator': CBD_STOCK_STRATOR},
    {'famille': 'Boissons', 'detail': 'Sans alcool et alcoolisées', 'theo': c(1480), 'strator': c(1470)},
    {'famille': 'Confiserie et snacking', 'detail': '', 'theo': c(1260), 'strator': c(1245)},
    {'famille': 'Accessoires fumeurs', 'detail': 'Briquets, feuilles, filtres', 'theo': c(1270), 'strator': c(1250)},
]
TOT_THEO = sum(x['theo'] for x in STOCK)
TOT_STRATOR = sum(x['strator'] for x in STOCK)

# ---- factures fournisseurs boutique (juillet → octobre), lignes détaillées
def lignes_depuis(catalogue, cible_ht, imposees=()):
    """Construit des lignes (quantités entières) dont le total HT approche la cible."""
    lignes = []
    total = 0
    for (lib, pu, tva, fam, q) in imposees:
        lignes.append({'d': lib, 'q': q, 'pu': c(pu), 'ht': c(pu) * q, 'tva': round(tva * 100, 1), 'fam': fam})
        total += c(pu) * q
    imposes = {x[0] for x in imposees}
    items = [x for x in catalogue if x[1] > 0 and x[0] not in imposes]
    R.shuffle(items)
    i = 0
    while total < cible_ht and i < 400:
        lib, pu, tva, fam = items[i % len(items)]
        i += 1
        pu_c = c(pu)
        if pu_c == 0:
            continue
        q = max(1, min(12, int((cible_ht - total) / pu_c / R.uniform(1.5, 4))))
        ex = [l for l in lignes if l['d'] == lib]
        if ex:
            ex[0]['q'] += q
            ex[0]['ht'] += ex[0]['pu'] * q
            pu_c = ex[0]['pu']
        else:
            lignes.append({'d': lib, 'q': q, 'pu': pu_c, 'ht': pu_c * q, 'tva': round(tva * 100, 1), 'fam': fam})
        total += pu_c * q
        if len(lignes) > 14 and total > cible_ht * 0.97:
            break
    return lignes

def ttc_de(lignes):
    return sum(round(l['ht'] * (1 + l['tva'] / 100)) for l in lignes)

def paye_le(dfact, delai, eviter=True):
    dp = jour_ouvre_suivant(dfact + dt.timedelta(days=delai))
    # pas de paiement fournisseur du 12 au 19 octobre (semaine affichée sur le site)
    if eviter and D(2026, 10, 12) <= dp <= D(2026, 10, 19):
        dp = jour_ouvre_suivant(D(2026, 10, 20))
    return dp

def facture_boutique(dfact, four, cat, cible_ht, delai, mode, imposees=(), compte='bnp', libb=None, note=None, alerte=None):
    lignes = lignes_depuis(CATALOGUE[four], cible_ht, imposees)
    ht = sum(l['ht'] for l in lignes)
    ttc = ttc_de(lignes)
    dp = paye_le(dfact, delai) if mode != 'Carte' else dfact
    statut = 'Payée' if dp <= TODAY else 'À payer'
    fid = facture(date=iso(dfact), fournisseur=four, objet=cat, categorie=cat, ttc=ttc, ht=ht, tva=ttc - ht, echeance=iso(dp),
                  mode=mode, statut=statut, lignes=lignes, note=note, alerte=alerte)
    if dp <= TODAY and dp >= BANK_START:
        mv(dp, compte, libb or ('PRLV SEPA ' + four.upper()), -ttc, 'Achats ' + cat.lower(), four, facture=fid)
    return fid

# Metro : un vendredi sur deux, payé par carte
dm = D(2026, 7, 17)
while dm <= TODAY:
    imposees = [('Papier toilette, 12 rouleaux', 6.40, 0.20, 'Entretien', 2)]
    alerte = None
    if dm == D(2026, 10, 9):
        imposees = [('Papier toilette, 12 rouleaux', 6.40, 0.20, 'Entretien', 2),
                    ('Coca-Cola 33 cl, ×24', 10.51, 0.055, 'Boissons sans alcool', 4)]
        alerte = 'Coca-Cola 33 cl, ×24 : 10,51 € HT contre 9,84 € HT le 25 septembre (+6,8 %).'
    facture_boutique(dm, 'Metro', 'Boissons, café, entretien et confiserie', c(R.uniform(1050, 1350)), 0, 'Carte', imposees,
                     libb='CB METRO CASH ET CARRY ' + dm.strftime('%d/%m'), alerte=alerte)
    dm += dt.timedelta(days=14)
# Boissons Express : livraison un jeudi sur deux, prélèvement à 15 jours
db = D(2026, 7, 2)
while db <= TODAY:
    if not (D(2026, 10, 12) <= db <= D(2026, 10, 19)):
        facture_boutique(db, 'Boissons Express', 'Boissons', c(R.uniform(420, 640)), 15, 'Prélèvement')
    db += dt.timedelta(days=14)
# Brûlerie : café en grains, le 1er jour ouvré du mois, prélèvement à 20 jours
KG_CAFE = {7: 6, 8: 5, 9: 7, 10: 7}
for m in (7, 8, 9, 10):
    dfc = jour_ouvre_suivant(D(2026, m, 1))
    kg = KG_CAFE[m]
    facture_boutique(dfc, 'Brûlerie du Canal', 'Café', c(30), 20, 'Prélèvement',
                     [('Café en grains, assemblage maison 1 kg', 16.90, 0.055, 'Café', kg),
                      ('Chocolat en poudre 1 kg', 8.40, 0.055, 'Café', 1)])
# vape : Liquideo (e-liquides) tous les quinze jours, Grossiste vape (matériel) mensuel
CATALOGUE['Liquideo'] = [(r['designation'], r['pa'] / 100, 0.20, 'Cigarette électronique') for r in REFS if r['fournisseur'] == 'Liquideo']
CATALOGUE['Grossiste vape'] = [(r['designation'], r['pa'] / 100, 0.20, 'Cigarette électronique') for r in REFS if r['fournisseur'] == 'Grossiste vape']
VAPE_ACHATS = {}
for m in (7, 8, 9, 10):
    a, b = mois_jours(m)
    cout = round(PNL[m - 1]['produits']['vape_cout']) / 100
    if m == 9:
        cout += 1840   # septembre : 14 nouvelles références mises en rayon
    if m == 10:
        cout = 2440
    dates = [jour_ouvre_suivant(D(2026, m, 3)), jour_ouvre_suivant(D(2026, m, 17))]
    if m == 10:
        dates = [jour_ouvre_suivant(D(2026, 10, 5)), D(2026, 10, 12)]
    parts = [0.38, 0.32]
    for dl, p in zip(dates, parts):
        if dl > TODAY:
            continue
        if m == 10 and dl == D(2026, 10, 12):
            # la facture du site : 1 240 € TTC
            lignes = []
            fraise = [r for r in REFS if r['cle'] == 'fraise'][0]
            imposees = [('Fraise glacée 10 ml, 11 mg', fraise['pa'] / 100, 0.20, 'Cigarette électronique', 60)]
            cible_ht = c(1240 / 1.2)
            lg = lignes_depuis(CATALOGUE['Liquideo'], cible_ht, imposees)
            # ajuste au centime : 1 240,00 € TTC
            ht = sum(l['ht'] for l in lg)
            ttc = ttc_de(lg)
            if ttc != c(1240):
                lg.append({'d': 'Remise commerciale', 'q': 1, 'pu': 0, 'ht': round((c(1240) - ttc) / 1.2), 'tva': 20.0, 'fam': 'Cigarette électronique'})
                ht = sum(l['ht'] for l in lg)
                ttc = ttc_de(lg)
                if ttc != c(1240):
                    lg[-1]['ht'] += c(1240) - ttc
                    ttc = ttc_de(lg)
            dp = D(2026, 10, 26)
            fid = facture(date=iso(dl), fournisseur='Liquideo', objet='E-liquides', categorie='Cigarette électronique', ttc=ttc,
                          ht=sum(l['ht'] for l in lg), tva=ttc - sum(l['ht'] for l in lg), echeance=iso(dp), mode='Virement',
                          statut='À payer', lignes=lg, note='Stock mis à jour automatiquement dans Strator.')
            VAPE_ACHATS[m] = VAPE_ACHATS.get(m, 0) + sum(l['ht'] for l in lg)
            continue
        fid = facture_boutique(dl, 'Liquideo', 'Cigarette électronique', c(cout * p), 21, 'Virement', libb='VIR SEPA LIQUIDEO FACTURE')
        VAPE_ACHATS[m] = VAPE_ACHATS.get(m, 0) + [f for f in FACTURES if f['id'] == fid][0]['ht']
    dg = jour_ouvre_suivant(D(2026, m, 8))
    if dg <= TODAY:
        fid = facture_boutique(dg, 'Grossiste vape', 'Cigarette électronique', c(cout * 0.30), 10, 'Virement', libb='VIR SEPA GROSSISTE VAPE')
        VAPE_ACHATS[m] = VAPE_ACHATS.get(m, 0) + [f for f in FACTURES if f['id'] == fid][0]['ht']
# CBD : commande mensuelle, payée à la commande
CATALOGUE['Chanvre Distribution'] = [(r['designation'], r['pa'] / 100, 0.20, 'CBD') for r in CBD_REFS]
for m in (7, 8, 9, 10):
    cout = PNL[m - 1]['produits']['cbd_cout'] / 100 * (1.25 if m < 10 else 1.0)
    if m == 10:
        cout = 1350
    dcbd = jour_ouvre_suivant(D(2026, m, 6))
    facture_boutique(dcbd, 'Chanvre Distribution', 'CBD', c(cout), 0, 'Virement', libb='VIR SEPA CHANVRE DISTRIBUTION',
                     note='Certificats d’analyse des lots joints (THC inférieur à 0,3 %).')
# accessoires : mensuel
for m in (7, 8, 9, 10):
    da = jour_ouvre_suivant(D(2026, m, 14)) if m < 10 else D(2026, 10, 6)
    if da <= TODAY:
        cout = PNL[m - 1]['produits']['accessoires_cout'] / 100 if m < 10 else 640
        facture_boutique(da, 'Grossiste accessoires', 'Accessoires fumeurs', c(cout), 15, 'Prélèvement')

# dépenses exceptionnelles de l'été
fid = facture(date='2026-08-11', fournisseur='Agenceur', objet='Corner CBD : vitrine éclairée et présentoir mural', categorie='Investissement',
              ttc=c(5400), ht=c(4500), tva=c(900), echeance='2026-08-18', mode='Virement', statut='Payée',
              lignes=[{'d': 'Vitrine éclairée 120 cm, serrure', 'q': 1, 'pu': c(2650), 'ht': c(2650), 'tva': 20.0, 'fam': 'Investissement'},
                      {'d': 'Présentoir mural, 6 tablettes', 'q': 1, 'pu': c(1350), 'ht': c(1350), 'tva': 20.0, 'fam': 'Investissement'},
                      {'d': 'Pose et éclairage LED', 'q': 1, 'pu': c(500), 'ht': c(500), 'tva': 20.0, 'fam': 'Investissement'}],
              note='Immobilisé et amorti sur 5 ans.')
mv(D(2026, 8, 18), 'bnp', 'VIR SEPA AGENCEUR CORNER CBD', -c(5400), 'Investissement', 'Agenceur', facture=fid)
mv(D(2026, 9, 22), 'bnp', 'PRLV SEPA URSSAF INDEP REGULARISATION 2025', -c(2900), 'Cotisations du gérant', 'URSSAF (indépendants)',
   note='Régularisation des cotisations 2025 sur le revenu définitif.')
fid = facture(date='2026-07-15', fournisseur='Froid commercial', objet='Vitrine réfrigérée boissons (remplacement)', categorie='Investissement',
              ttc=c(2280), ht=c(1900), tva=c(380), echeance='2026-07-20', mode='Virement', statut='Payée',
              lignes=[{'d': 'Vitrine réfrigérée 2 portes vitrées, 600 L', 'q': 1, 'pu': c(1780), 'ht': c(1780), 'tva': 20.0, 'fam': 'Investissement'},
                      {'d': 'Livraison et reprise de l’ancienne', 'q': 1, 'pu': c(120), 'ht': c(120), 'tva': 20.0, 'fam': 'Investissement'}],
              note='Immobilisée et amortie sur 5 ans.')
mv(D(2026, 7, 20), 'bnp', 'VIR SEPA FROID COMMERCIAL VITRINE', -c(2280), 'Investissement', 'Froid commercial', facture=fid)
fid = facture(date='2026-07-22', fournisseur='Strator', objet='Deuxième poste de caisse', categorie='Investissement',
              ttc=c(1980), ht=c(1650), tva=c(330), echeance='2026-07-28', mode='Virement', statut='Payée',
              lignes=[{'d': 'Poste de caisse tactile avec tiroir', 'q': 1, 'pu': c(1390), 'ht': c(1390), 'tva': 20.0, 'fam': 'Investissement'},
                      {'d': 'Installation et paramétrage', 'q': 1, 'pu': c(260), 'ht': c(260), 'tva': 20.0, 'fam': 'Investissement'}],
              note='Caisse 2, en service depuis le 29 juillet.')
mv(D(2026, 7, 28), 'bnp', 'VIR SEPA STRATOR CAISSE 2', -c(1980), 'Investissement', 'Strator', facture=fid)
fid = facture(date='2026-09-01', fournisseur='SCI des Tilleuls (bailleur)', objet='Régularisation des charges locatives 2025', categorie='Loyer et charges',
              ttc=c(1640), ht=c(1640), tva=0, echeance='2026-09-08', mode='Prélèvement', statut='Payée',
              lignes=[{'d': 'Charges réelles 2025 (copropriété, eau, ordures ménagères)', 'q': 1, 'pu': c(4420), 'ht': c(4420), 'tva': 0, 'fam': 'Loyer et charges'},
                      {'d': 'Provisions déjà versées en 2025', 'q': 1, 'pu': -c(2780), 'ht': -c(2780), 'tva': 0, 'fam': 'Loyer et charges'}])
mv(D(2026, 9, 8), 'bnp', 'PRLV SEPA SCI DES TILLEULS REGUL CHARGES 2025', -c(1640), 'Loyer et charges', 'SCI des Tilleuls (bailleur)', facture=fid)

# ---------------------------------------------------------------- virements internes (BNP → FDJ, BNP → BP)
MOUV.sort(key=lambda x: (x['date'], 0 if x['montant'] > 0 else 1))

def solde_par_jour(compte):
    sol = defaultdict(int)
    for x in MOUV:
        if x['compte'] == compte:
            sol[x['date']] += x['montant']
    return sol

# FDJ : chaque mercredi matin, virement = prélèvement du jour − solde (arrondi à la centaine supérieure, sauf exception)
fdj_solde = 0
fdj_debits = solde_par_jour('fdj')
for d in days(BANK_START, TODAY):
    k = iso(d)
    besoin = -fdj_debits.get(k, 0)
    if besoin > 0:
        if d == D(2026, 10, 7):
            vir = besoin - fdj_solde + c(360)   # laisse 360 € sur le compte FDJ
        else:
            vir = max(0, math.ceil((besoin - fdj_solde) / 10000) * 10000)
        if vir:
            mv(d, 'bnp', 'VIR INTERNE VERS COMPTE FDJ', -vir, 'Virement interne', 'Compte FDJ')
            mv(d, 'fdj', 'VIR INTERNE DEPUIS BNP PRINCIPAL', vir, 'Virement interne', 'BNP Paribas')
            fdj_solde += vir
        fdj_solde -= besoin
assert fdj_solde == c(360), fdj_solde

BP_DEBUT_EUR = 0
# BP : virement le mercredi (ou jour ouvré précédent jeudi) pour couvrir recharges du jeudi + timbres et Logista du lundi suivant
bp_debits = solde_par_jour('bp')
def debits_bp(a, b):
    return -sum(bp_debits.get(iso(x), 0) for x in days(a, b))
bp_solde = c(BP_DEBUT_EUR)
VIR_BP = {}
def vir_bp(d, vir):
    VIR_BP[iso(d)] = VIR_BP.get(iso(d), 0) + vir
    mv(d, 'bnp', 'VIR INTERNE VERS BANQUE POPULAIRE', -vir, 'Virement interne', 'Banque Populaire')
    mv(d, 'bp', 'VIR INTERNE DEPUIS BNP PRINCIPAL', vir, 'Virement interne', 'BNP Paribas')
LOGISTA_DATES = set(x['date'] for x in MOUV if x['categorie'] == 'Tabac (Logista)')
def besoin_hors_logista(a, b):
    return -sum(x['montant'] for x in MOUV if x['compte'] == 'bp' and a.isoformat() <= x['date'] <= b.isoformat()
                and x['categorie'] != 'Tabac (Logista)' and x['montant'] < 0)
def besoin_logista(a, b):
    return -sum(x['montant'] for x in MOUV if x['compte'] == 'bp' and a.isoformat() <= x['date'] <= b.isoformat()
                and x['categorie'] == 'Tabac (Logista)')
for d in days(BANK_START, TODAY):
    k = iso(d)
    if d.weekday() == 2:   # mercredi : recharges du jeudi et timbres du lundi
        besoin = besoin_hors_logista(d, d + dt.timedelta(days=5))
        if d == D(2026, 10, 7):
            vir = besoin - bp_solde + c(400)     # laisse 400 € après les timbres du lundi 12
        else:
            vir = max(0, math.ceil((besoin - min(bp_solde, besoin)) / 10000) * 10000)
        if vir:
            vir_bp(d, vir)
            bp_solde += vir
    if d.weekday() == 4:   # vendredi : facture Logista du lundi
        besoin = besoin_logista(d, d + dt.timedelta(days=3))
        if besoin:
            dispo = bp_solde - besoin_hors_logista(d, d + dt.timedelta(days=3))
            vir = max(0, math.ceil((besoin - max(dispo, 0)) / 10000) * 10000)
            if vir:
                vir_bp(d, vir)
                bp_solde += vir
    bp_solde += bp_debits.get(k, 0)
    if bp_solde < 0:
        raise SystemExit('BP négatif le ' + k)
assert bp_solde == c(400), bp_solde / 100
BP_DEBUT = c(BP_DEBUT_EUR)

MOUV.sort(key=lambda x: (x['date'], 0 if x['montant'] > 0 else 1, x['compte']))
assert all(BANK_START.isoformat() <= x['date'] <= TODAY.isoformat() for x in MOUV), [x for x in MOUV if x['date'] < BANK_START.isoformat()][:3]

# ---------------------------------------------------------------- soldes et trésorerie totale au 13 octobre, 21 h 04
CB_ATTENTE_FIN = CB['2026-10-13']
TOTAL_CIBLE = c(56940)
BNP_FIN = TOTAL_CIBLE - c(5020) - c(360) - c(400) - CB_ATTENTE_FIN
flux_bnp = sum(x['montant'] for x in MOUV if x['compte'] == 'bnp')
BNP_DEBUT = BNP_FIN - flux_bnp
# remises CB du 26 au 30 juin créditées en juillet : elles sont dans les flux, il faut donc les compter comme « en attente » au 30 juin
cb_attente_debut = sum(CB[iso(d)] for d in days(BANK_START - dt.timedelta(days=7), BANK_START - ONE) if remise_cb(d) >= BANK_START)

def soldes_quotidiens():
    sol = {'bnp': BNP_DEBUT, 'bp': BP_DEBUT, 'fdj': 0}
    caisse = CAISSE_DEBUT
    attente = cb_attente_debut
    par_jour = defaultdict(lambda: defaultdict(int))
    for x in MOUV:
        par_jour[x['date']][x['compte']] += x['montant']
    serie = []
    for d in days(BANK_START, TODAY):
        k = iso(d)
        for cpt in ('bnp', 'bp', 'fdj'):
            sol[cpt] += par_jour[k].get(cpt, 0)
        # remises CB créditées aujourd'hui sortent de « en attente »
        cred = sum(x['montant'] for x in MOUV if x['date'] == k and x['categorie'] == 'Encaissements CB')
        attente += CB[k] - cred
        dep = sum(x['montant'] for x in MOUV if x['date'] == k and x['categorie'] == 'Dépôt d’espèces')
        caisse += ESP[k] - dep + (ECART_COLLECTE.get(k, 0) if dep else 0)
        serie.append({'date': k, 'bnp': sol['bnp'], 'bp': sol['bp'], 'fdj': sol['fdj'], 'caisse': caisse, 'cb': attente,
                      'total': sol['bnp'] + sol['bp'] + sol['fdj'] + caisse + attente})
    return serie

SERIE = soldes_quotidiens()
fin = SERIE[-1]
assert fin['total'] == TOTAL_CIBLE, (fin['total'], TOTAL_CIBLE)
assert fin['caisse'] == c(5020)
assert fin['bp'] == c(400) and fin['fdj'] == c(360)
s11 = [x for x in SERIE if x['date'] == '2026-10-11'][0]
s12 = [x for x in SERIE if x['date'] == '2026-10-12'][0]
assert s12['total'] - s11['total'] == c(2730), (s12['total'] - s11['total'])
assert fin['total'] - s12['total'] == c(5090), (fin['total'] - s12['total'])
DELTA11 = c(49120) - s11['total']   # doit être nul si tout est cohérent
mini = min(SERIE, key=lambda x: x['bnp'])

# ---------------------------------------------------------------- semaine (site) et prévisions
SEMAINE = [
    {'date': '2026-10-11', 'jour': 'dim. 11', 'solde': c(49120), 'statut': 'réel', 'sorties': [], 'entrees': 0},
    {'date': '2026-10-12', 'jour': 'lun. 12', 'solde': c(51850), 'statut': 'réel', 'sorties': [['Timbres', c(2360)]], 'entrees': c(5090)},
    {'date': '2026-10-13', 'jour': 'mar. 13', 'solde': c(56940), 'statut': 'réel', 'sorties': [['PMU', c(1240)]], 'entrees': c(6330)},
    {'date': '2026-10-14', 'jour': 'mer. 14', 'solde': c(56130), 'statut': 'prévu', 'sorties': [['FDJ', c(5900)]], 'entrees': c(5090)},
    {'date': '2026-10-15', 'jour': 'jeu. 15', 'solde': c(57750), 'statut': 'prévu', 'sorties': [['Recharges', c(3470)]], 'entrees': c(5090)},
    {'date': '2026-10-16', 'jour': 'ven. 16', 'solde': c(61440), 'statut': 'prévu', 'sorties': [['URSSAF', c(1400)]], 'entrees': c(5090)},
    {'date': '2026-10-17', 'jour': 'sam. 17', 'solde': c(66530), 'statut': 'prévu', 'sorties': [], 'entrees': c(5090)},
    {'date': '2026-10-18', 'jour': 'dim. 18', 'solde': c(71620), 'statut': 'prévu', 'sorties': [], 'entrees': c(5090)},
    {'date': '2026-10-19', 'jour': 'lun. 19', 'solde': c(47380), 'statut': 'prévu', 'sorties': [['Logista', c(29330)]], 'entrees': c(5090)},
]
for i in range(1, len(SEMAINE)):
    s = SEMAINE[i]
    assert SEMAINE[i - 1]['solde'] + s['entrees'] - sum(x[1] for x in s['sorties']) == s['solde'], s

# mouvements prévus (14 → 19 octobre)
PREVUS = [
    ('2026-10-14', 'bnp', 'VIR INTERNE VERS COMPTE FDJ', -c(5540), 'Virement interne', 'Compte FDJ'),
    ('2026-10-14', 'fdj', 'VIR INTERNE DEPUIS BNP PRINCIPAL', c(5540), 'Virement interne', 'BNP Paribas'),
    ('2026-10-14', 'fdj', 'PRLV SEPA LA FRANCAISE DES JEUX RELEVE S41', -c(5900), 'Jeux FDJ', 'FDJ'),
    ('2026-10-14', 'bnp', 'VIR INTERNE VERS BANQUE POPULAIRE', -c(32400), 'Virement interne', 'Banque Populaire'),
    ('2026-10-14', 'bp', 'VIR INTERNE DEPUIS BNP PRINCIPAL', c(32400), 'Virement interne', 'BNP Paribas'),
    ('2026-10-15', 'bp', 'PRLV SEPA LOGISTA FRANCE RECHARGES S41', -c(3470), 'Recharges', 'Logista'),
    ('2026-10-16', 'bnp', 'PRLV SEPA URSSAF', -c(1400), 'Personnel', 'URSSAF'),
    ('2026-10-19', 'bp', 'PRLV SEPA LOGISTA FRANCE FACT 20261007', -c(29330), 'Tabac (Logista)', 'Logista'),
]
for p in PREVUS:
    mv(D.fromisoformat(p[0]), p[1], p[2], p[3], p[4], p[5], statut='prévu')

# ---------------------------------------------------------------- caisse : Z quotidiens, tickets annulés, heures
Z = []
VENDEURS = {0: ('Julien', 'Inès'), 1: ('Julien', 'Inès'), 2: ('Mehdi', 'Inès'), 3: ('Julien', 'Inès'), 4: ('Julien', 'Mehdi'),
            5: ('Mehdi', 'Inès'), 6: ('Julien', 'Julien')}
for d in days(START, TODAY):
    k = iso(d)
    v = VENTES[k]
    tot = sum(v.values())
    nb = 0 if tot == 0 else round(tot / 100 / R.uniform(14.5, 17.5))
    cafe_tasses = round(v['cafe'] / 100 / 1.45)
    Z.append({'date': k, 'ventes': v, 'total': tot, 'cb': CB[k], 'especes': tot - CB[k], 'gains_fdj': GAINS_FDJ[k],
              'gains_pmu': GAINS_PMU[k], 'tickets': nb, 'tasses': cafe_tasses, 'fdj_strator': STRATOR_FDJ[k]})

ANNULES = []
MOTIFS = ['Erreur de saisie', 'Client a changé d’avis', 'Mauvais produit scanné', 'Paiement refusé', 'Article en double']
for d in days(D(2026, 9, 1), TODAY):
    for _ in range(R.choice([1, 1, 2, 2, 2, 3, 3, 4])):
        h = R.randint(6 * 60 + 45, 20 * 60 + 20)
        caisse_n = R.choice([1, 1, 2])
        vendeur = VENDEURS[d.weekday()][0 if h < 13 * 60 + 30 else 1]
        ANNULES.append({'date': iso(d), 'heure': '%02d:%02d' % (h // 60, h % 60), 'caisse': caisse_n, 'vendeur': vendeur,
                        'montant': c(R.choice([2.2, 5, 5, 10.5, 12.9, 15.9, 24.9, 3.5, 7.8, 11.4, 34.9])),
                        'motif': R.choice(MOTIFS), 'moment': 'Avant encaissement', 'suspect': False})
for h, mt in (('19:52', 21.60), ('19:57', 18.40), ('20:01', 24.80)):
    ANNULES.append({'date': '2026-10-10', 'heure': h, 'caisse': 2, 'vendeur': 'Mehdi', 'montant': c(mt), 'motif': 'Annulation après paiement',
                    'moment': 'Après encaissement', 'suspect': True})
ANNULES.sort(key=lambda x: (x['date'], x['heure']))

# ventes par heure, aujourd'hui (6 h 30 → 20 h 30)
PROFIL = [0.035, 0.085, 0.09, 0.07, 0.06, 0.065, 0.075, 0.06, 0.05, 0.055, 0.07, 0.085, 0.09, 0.075, 0.035]
HEURES = []
tot = Z[-1]['total']
acc = 0
for i, p in enumerate(PROFIL):
    x = round(tot * p / sum(PROFIL)) if i < len(PROFIL) - 1 else tot - acc
    acc += x
    HEURES.append({'h': 6 + i, 'montant': x})

# ---------------------------------------------------------------- ratios mensuels
RATIOS = []
KG = {}
for m in range(1, 10):
    a_, b_ = mois_jours(m)
    t = sum(z['tasses'] for z in Z if a_.isoformat() <= z['date'] <= b_.isoformat())
    KG[m] = max(1, round(t / (118 if m == 9 else R.uniform(134, 142))))
for m in range(1, 10):
    a, b = mois_jours(m)
    tasses = sum(z['tasses'] for z in Z if a.isoformat() <= z['date'] <= b.isoformat())
    kg = KG[m]
    p = PNL[m - 1]['produits']
    marge_boissons_theo = round((1 - COUT['boissons']) * 100, 1)
    marge_boissons_reelle = round(marge_boissons_theo - R.uniform(0.6, 2.4), 1)
    if m == 9:
        marge_boissons_reelle = round(marge_boissons_theo - 2.1, 1)
    ecart_especes = c(R.choice([-12, -8, -4, 0, 3, 6, -18, -32])) if m != 9 else -c(32)
    if m >= 7:
        ecart_especes = sum(x['ecart'] for x in COLLECTES if int(x['date'][5:7]) == m)
    RATIOS.append({'mois': m, 'cafe_kg': kg, 'tasses': tasses, 'tasses_kg': round(tasses / kg),
                   'boissons_theo': marge_boissons_theo, 'boissons_reel': marge_boissons_reelle,
                   'especes_ecart': ecart_especes, 'tabac_marge': round(TAUX['tabac'] * 100 + R.uniform(-0.08, 0.06), 2)})

# factures de café : quantités = kilos des ratios (juillet → septembre), octobre au rythme normal
for f in FACTURES:
    if f['fournisseur'] == 'Brûlerie du Canal':
        mo = int(f['date'][5:7])
        kg = KG.get(mo, 7)
        for l in f['lignes']:
            if l['d'].startswith('Café en grains'):
                l['q'] = kg
                l['ht'] = l['pu'] * kg
        f['ht'] = sum(l['ht'] for l in f['lignes'])
        f['ttc'] = ttc_de(f['lignes'])
        f['tva'] = f['ttc'] - f['ht']
        for x in MOUV:
            if x['facture'] == f['id']:
                x['montant'] = -f['ttc']

# atterrissage d'octobre : réel au 13 + reste du mois au rythme des 28 derniers jours (même jour de semaine)
att = {'produits': {}, 'charges': {}}
reel = PNL[9]
p_oct = reel['produits']
ref28 = [D(2026, 10, 13) - dt.timedelta(days=i) for i in range(28)]
moy_jour = defaultdict(lambda: defaultdict(int))
for d0 in ref28:
    for f_ in FAM:
        moy_jour[d0.weekday()][f_] += VENTES[iso(d0)][f_] / 4
reste = {f_: sum(moy_jour[d0.weekday()][f_] for d0 in days(D(2026, 10, 14), D(2026, 10, 31))) for f_ in FAM}
for k_, v_ in p_oct.items():
    fam_ = k_.rsplit('_', 1)[0]
    typ = k_.rsplit('_', 1)[1]
    add_ttc = reste[fam_]
    if fam_ in BOUTIQUE:
        add_ventes = add_ttc / (1 + TVA_VENTE[fam_])
        add = {'ventes': add_ventes, 'cout': add_ventes * COUT[fam_], 'marge': add_ventes * (1 - COUT[fam_])}[typ]
    elif fam_ == 'tabac':
        add = {'ventes': add_ttc, 'cout': add_ttc * (1 - TAUX['tabac']), 'marge': add_ttc * TAUX['tabac']}[typ]
    else:
        add = {'ventes': add_ttc, 'marge': add_ttc * TAUX[fam_]}[typ]
    att['produits'][k_] = round(v_ + add)
for k_, v_ in reel['charges'].items():
    att['charges'][k_] = round(v_ * 31 / 13) if k_ in ('Banque et monétique',) else round(PNL[8]['charges'].get(k_, v_ * 31 / 13))
PNL_ATT = att

# charges fixes, vue longue : novembre 2025 → octobre 2026 (montants payés, TTC)
MOIS12 = [(2025, 11), (2025, 12)] + [(2026, m) for m in range(1, 11)]
FIXES = []
def ttc_charge(cle, an, mo):
    base = dict((x[0], x[3]) for x in CHARGES)[cle]
    tva = dict((x[0], x[4]) for x in CHARGES)[cle]
    if an == 2026:
        mt = montant_charge(cle, mo)
    else:
        mt = {'edf': round(448 / 1.18), 'assurance': 284, 'honoraires': 430, 'loyer': 3100, 'urssaf': 1120}.get(cle, base)
    return c(mt * (1 + tva))
LIB_FIXES = {'loyer': 'Loyer et charges', 'credit': 'Échéance de prêt', 'edf': 'Électricité', 'assurance': 'Assurance multirisque',
             'honoraires': 'Expert-comptable', 'strator': 'Logiciel de caisse', 'orange': 'Internet et téléphone',
             'telesurv': 'Télésurveillance', 'tpe': 'Terminal de paiement', 'frais_bnp': 'Frais bancaires BNP',
             'frais_bp': 'Frais bancaires Banque Populaire', 'syndicat': 'Chambre syndicale', 'ssi': 'Cotisations du gérant',
             'urssaf': 'URSSAF salariés', 'retraite': 'Retraite complémentaire'}
for x in CHARGES:
    cle = x[0]
    serie = [ttc_charge(cle, an, mo) for an, mo in MOIS12]
    FIXES.append({'cle': cle, 'libelle': LIB_FIXES[cle], 'rubrique': x[2], 'fournisseur': x[8], 'jour': x[5], 'compte': x[6],
                  'mode': x[9], 'serie': serie})
FIXES.append({'cle': 'salaires', 'libelle': 'Salaires nets (3 salariés)', 'rubrique': 'Personnel', 'fournisseur': 'Inès, Mehdi, Léa',
              'jour': 30, 'compte': 'bnp', 'mode': 'Virement',
              'serie': [c(2990)] * 7 + [c(3852)] * 5})   # Léa embauchée en juin 2026
NOTES_FIXES = {
    'edf': 'Hausse du prix de l’électricité en février (+18 % sur un an). Contrat à remettre en concurrence avant le 31 décembre.',
    'telesurv': 'Contrat de 48 mois jusqu’au 31 décembre 2026, reconduit tacitement. Le préavis de 3 mois est dépassé : négocier le tarif plutôt que résilier.',
    'salaires': 'Embauche de Léa en juin, pour les week-ends.',
    'urssaf': 'En hausse depuis l’embauche de Léa, en juin.',
    'loyer': 'Indexation annuelle en juillet (ILC, +3,2 %).',
    'credit': 'Capital restant dû : 8 400 € au 13 octobre, 7 200 € fin décembre.',
    'tpe': 'Location 38 € HT par mois : un terminal acheté coûte environ 450 € HT.',
}

# ---------------------------------------------------------------- export
data = {
    'meta': {'aujourdhui': iso(TODAY), 'heure': '21:04', 'tabac': 'Le Balto', 'gerant': 'Julien', 'activite': 'Tabac, presse, jeux',
             'genere': '2026-10-13'},
    'ventes_fam': FAM, 'boutique': BOUTIQUE, 'tva_vente': TVA_VENTE, 'cout': COUT, 'taux': TAUX,
    'z': Z, 'heures': HEURES, 'annules': ANNULES,
    'releves': RELEVES, 'pnl': PNL, 'n1': N1, 'cbd_2025': CBD_2025,
    'mouvements': MOUV, 'factures': FACTURES, 'serie': SERIE,
    'comptes': {'bnp': fin['bnp'], 'bp': fin['bp'], 'fdj': fin['fdj'], 'caisse': fin['caisse'], 'cb': fin['cb'], 'total': fin['total']},
    'semaine': SEMAINE, 'refs': REFS, 'cbd_refs': CBD_REFS, 'stock': STOCK,
    'stock_tot': {'theo': TOT_THEO, 'strator': TOT_STRATOR},
    'ratios': RATIOS, 'vape_achats': VAPE_ACHATS, 'charges_def': [list(x[:10]) for x in CHARGES],
    'salaires': SALAIRES, 'salaires_brut': SALAIRES_BRUT, 'livraisons': [iso(x) for x in LIVRAISONS],
    'fact_tabac': {iso(k): v for k, v in FACT_TABAC.items()}, 'stock_tabac_debut': STOCK_TABAC_DEBUT,
    'pnl_att': PNL_ATT, 'fixes': FIXES, 'fixes_mois': ['%04d-%02d' % x for x in MOIS12], 'notes_fixes': NOTES_FIXES,
    'fdj': {'taux': TAUX_FDJ, 'jours': {iso(d): [JI_PJ[iso(d)], LOTO_PJ[iso(d)], JI_ST[iso(d)], LOTO_ST[iso(d)], RJ[iso(d)], RL[iso(d)]]
                                         for d in days(D(2026, 6, 1), TODAY)}},
    'collectes': COLLECTES, 'caisse_depuis': {'date': '2026-10-09', 'heure': '20:30'},
}
json.dump(data, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json'), 'w'), ensure_ascii=False, separators=(',', ':'))

# ---------------------------------------------------------------- contrôles
def e(x):
    return '{:,.2f}'.format(x / 100).replace(',', ' ')
tots = [x['total'] for x in SERIE]
print('Trésorerie totale 7 juil. :', e(SERIE[0]['total'] - 0), ' min', e(min(tots)), [x['date'] for x in SERIE if x['total']==min(tots)], ' max', e(max(tots)))
print('BP min', e(min(x['bp'] for x in SERIE)), ' FDJ min', e(min(x['fdj'] for x in SERIE)))
print('Taille JSON :', len(json.dumps(data, ensure_ascii=False, separators=(',', ':'))) // 1024, 'Ko')
print('Mouvements :', len(MOUV), ' Factures :', len(FACTURES), ' Lignes :', sum(len(f['lignes']) for f in FACTURES))
print('Comptes au 13/10 :', {k: e(v) for k, v in data['comptes'].items()})
print('Écart sur le solde du dim. 11 (doit être 0) :', e(DELTA11))
print('BNP au 1er juillet :', e(BNP_DEBUT), ' plus bas BNP :', e(mini['bnp']), mini['date'])
print('Stock :', e(TOT_THEO), e(TOT_STRATOR), ' écart', e(TOT_THEO - TOT_STRATOR))
print('Stock tabac au 1er janvier (calc.) :', e(STOCK_TABAC_DEBUT))
print('Vape stock :', e(VAPE_STOCK_THEO), e(VAPE_STOCK_STRATOR), ' CBD :', e(CBD_STOCK_THEO))
for r in RELEVES['fdj'][-3:]:
    print('FDJ', r['semaine'], e(r['ventes']), 'gains', e(r['gains']), 'com', e(r['commission']), 'solde', e(r['solde']), r['prelevement'])
for nom in ('pmu', 'recharges', 'timbres'):
    r = RELEVES[nom][-1]
    print(nom, r['semaine'], 'solde', e(r['solde']), r['prelevement'])
# moyenne des encaissements nets sur 28 jours
last = [iso(d) for d in days(TODAY - dt.timedelta(days=27), TODAY)]
net = [total_ventes(k) - GAINS_FDJ[k] - GAINS_PMU[k] for k in last]
print('Encaissements nets moyens (28 j) :', e(sum(net) / 28))
for p in PNL:
    pr = p['produits']
    marge = sum(v for k, v in pr.items() if k.endswith('_marge'))
    ch = sum(p['charges'].values())
    print('Mois', p['mois'], 'marge', e(marge), 'charges', e(ch), 'résultat', e(marge - ch), ' CBD HT', e(pr['cbd_ventes']), ' vape HT', e(pr['vape_ventes']))
