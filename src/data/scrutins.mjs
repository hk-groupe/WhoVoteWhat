// Scrutins publics de l'Assemblée nationale — 17e législature.
// Source unique et officielle : les pages « Analyse du scrutin » de
// l'Assemblée nationale (https://www.assemblee-nationale.fr/dyn/17/scrutins/...)
// Données consolidées le 16 octobre 2026. Aucune donnée provenant d'un tiers.

export const SOURCE_SCRUTINS = 'https://www.assemblee-nationale.fr/dyn/17/scrutins'
export const DATE_MAJ_SCRUTINS = '16 octobre 2026'
export const LEGISLATURE = '17e'

// Groupes parlementaires — libellés officiels, couleurs indicatives.
export const GROUPES = {
  RN: { nom: 'Rassemblement National', couleur: '#0d3b66' },
  EPR: { nom: 'Ensemble pour la République', couleur: '#009fe3' },
  'LFI-NFP': { nom: 'La France insoumise - Nouveau Front Populaire', couleur: '#ce1126' },
  SOC: { nom: 'Socialistes et apparentés', couleur: '#f4762a' },
  DR: { nom: 'Droite Républicaine', couleur: '#4056a1' },
  ECOS: { nom: 'Écologiste et Social', couleur: '#00b57f' },
  DEM: { nom: 'Les Démocrates', couleur: '#f5a623' },
  HOR: { nom: 'Horizons & Indépendants', couleur: '#14357f' },
  LIOT: { nom: 'Libertés, Indépendants, Outre-mer et Territoires', couleur: '#c9b100' },
  GDR: { nom: 'Gauche Démocrate et Républicaine', couleur: '#9b1b30' },
  UDDPLR: { nom: 'Union des droites pour la République', couleur: '#7d2181' },
  UDR: { nom: 'UDR', couleur: '#4a148c' },
  NI: { nom: 'Députés non inscrits', couleur: '#8d8d8d' },
}

export const THEMES_VOTES = {
  budget: { emoji: '💰', label: 'Budget & impôts' },
  sante: { emoji: '🏥', label: 'Santé & fin de vie' },
  enfance: { emoji: '👶', label: 'Enfance & protection' },
}

const A = (pour = 0, contre = 0, abst = 0, nv = 0) => ({ pour, contre, abstention: abst, nonVotant: nv })

export const SCRUTINS = [
  {
    numero: 8764,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 363 de M. Le Fur après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: true,
    votants: 124,
    exprimes: 73,
    majorite: 37,
    groupes: {
      RN: A(0, 0, 47), EPR: A(0, 15, 0, 1), 'LFI-NFP': A(14), SOC: A(14), DR: A(1, 6),
      ECOS: A(10), DEM: A(0, 5), HOR: A(0, 0, 1), LIOT: A(4), GDR: A(2),
      UDDPLR: A(0, 0, 3), NI: A(2),
    },
  },
  {
    numero: 8763,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 3864 de M. Attal après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: true,
    votants: 115,
    exprimes: 115,
    majorite: 58,
    groupes: {
      RN: A(46), EPR: A(13, 0, 0, 1), 'LFI-NFP': A(0, 11), SOC: A(1, 10), DR: A(6),
      ECOS: A(0, 9), DEM: A(6), HOR: A(1), LIOT: A(5, 1), GDR: A(0, 1),
      UDDPLR: A(3), NI: A(2),
    },
  },
  {
    numero: 8762,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 1055 de M. Pilato après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: true,
    votants: 117,
    exprimes: 64,
    majorite: 33,
    groupes: {
      RN: A(0, 1, 49), EPR: A(0, 12, 0, 1), 'LFI-NFP': A(11), SOC: A(9), DR: A(0, 6),
      ECOS: A(10), DEM: A(0, 6), HOR: A(0, 1), LIOT: A(3, 3), GDR: A(1),
      UDDPLR: A(0, 0, 3), NI: A(0, 1, 1),
    },
  },
  {
    numero: 8761,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 3431 de Mme Erodi après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 104,
    exprimes: 52,
    majorite: 27,
    groupes: {
      RN: A(0, 0, 43), EPR: A(0, 12, 0, 1), 'LFI-NFP': A(10), SOC: A(2, 1, 5), DR: A(0, 6),
      ECOS: A(10), DEM: A(0, 6), HOR: A(0, 1), LIOT: A(0, 3), GDR: A(1),
      UDDPLR: A(0, 0, 3), NI: A(0, 0, 1),
    },
  },
  {
    numero: 8760,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 662 de M. Jean-Philippe Tanguy après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 124,
    exprimes: 124,
    majorite: 63,
    groupes: {
      RN: A(57), EPR: A(0, 12, 0, 1), 'LFI-NFP': A(0, 12), SOC: A(1, 8), DR: A(0, 6),
      ECOS: A(0, 10), DEM: A(0, 6), HOR: A(0, 1), LIOT: A(1, 4), GDR: A(0, 1),
      UDDPLR: A(3), NI: A(0, 2),
    },
  },
  {
    numero: 8759,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 639 de M. Jean-Philippe Tanguy après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 129,
    exprimes: 129,
    majorite: 65,
    groupes: {
      RN: A(57), EPR: A(0, 14, 0, 1), 'LFI-NFP': A(0, 16), SOC: A(0, 10), DR: A(0, 6),
      ECOS: A(0, 9), DEM: A(0, 6), HOR: A(0, 1), LIOT: A(0, 4), GDR: A(0, 1),
      UDDPLR: A(3), NI: A(1, 1),
    },
  },
  {
    numero: 8758,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 1054 de Mme Legrain après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 112,
    exprimes: 108,
    majorite: 55,
    groupes: {
      RN: A(2, 42, 4), EPR: A(0, 11, 0, 1), 'LFI-NFP': A(16), SOC: A(8), DR: A(0, 7),
      ECOS: A(7), DEM: A(0, 6), HOR: A(0, 2), LIOT: A(0, 1), GDR: A(2),
      UDDPLR: A(0, 3), NI: A(0, 1),
    },
  },
  {
    numero: 8757,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 935 de M. Falcon après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 116,
    exprimes: 116,
    majorite: 59,
    groupes: {
      RN: A(50), EPR: A(0, 10, 0, 1), 'LFI-NFP': A(0, 14), SOC: A(0, 12), DR: A(0, 6),
      ECOS: A(0, 7), DEM: A(0, 7), HOR: A(0, 2), LIOT: A(0, 2), GDR: A(0, 2),
      UDDPLR: A(3), NI: A(1),
    },
  },
  {
    numero: 8756,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 931 de M. Falcon après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 110,
    exprimes: 110,
    majorite: 56,
    groupes: {
      RN: A(49), EPR: A(0, 10, 0, 1), 'LFI-NFP': A(0, 11), SOC: A(0, 13), DR: A(1, 5),
      ECOS: A(0, 6), DEM: A(0, 6), HOR: A(0, 2), LIOT: A(0, 1), GDR: A(0, 2),
      UDDPLR: A(3), NI: A(1),
    },
  },
  {
    numero: 8755,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 3695 de M. Jean-Philippe Tanguy après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 121,
    exprimes: 121,
    majorite: 61,
    groupes: {
      RN: A(48), EPR: A(0, 12, 0, 1), 'LFI-NFP': A(0, 13), SOC: A(0, 13), DR: A(0, 6),
      ECOS: A(0, 7), DEM: A(0, 8), HOR: A(0, 2), LIOT: A(0, 4), GDR: A(0, 2),
      UDDPLR: A(5), NI: A(1),
    },
  },
  {
    numero: 8754,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 2627 de Mme Feld après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 89,
    exprimes: 89,
    majorite: 45,
    groupes: {
      RN: A(0, 28), EPR: A(0, 11, 0, 1), 'LFI-NFP': A(10), SOC: A(7), DR: A(0, 7),
      ECOS: A(6), DEM: A(0, 8), HOR: A(0, 1), LIOT: A(0, 4), GDR: A(1),
      UDDPLR: A(0, 5), NI: A(0, 1),
    },
  },
  {
    numero: 8753,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 3650 de M. Attal après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: true,
    votants: 88,
    exprimes: 43,
    majorite: 22,
    groupes: {
      RN: A(0, 0, 26), EPR: A(13, 0, 1, 1), 'LFI-NFP': A(0, 0, 8), SOC: A(7, 1), DR: A(7),
      ECOS: A(0, 6), DEM: A(7), HOR: A(0, 0, 1), LIOT: A(1, 1, 2), GDR: A(0, 0, 1),
      UDDPLR: A(0, 0, 5), NI: A(0, 0, 1),
    },
  },
  {
    numero: 8752,
    date: '2026-10-15',
    seance: 'Deuxième séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 226 de M. Ciotti après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 33,
    exprimes: 31,
    majorite: 16,
    groupes: {
      RN: A(8), EPR: A(0, 10, 0, 1), 'LFI-NFP': A(0, 0, 0, 1), SOC: A(0, 2, 2), DR: A(2, 2),
      ECOS: A(), DEM: A(0, 2), LIOT: A(), GDR: A(),
      UDDPLR: A(5), NI: A(),
    },
  },
  {
    numero: 8751,
    date: '2026-10-15',
    seance: 'Première séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 2211 de M. Verny après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: true,
    votants: 126,
    exprimes: 114,
    majorite: 58,
    groupes: {
      RN: A(46), EPR: A(4, 0, 4, 1), 'LFI-NFP': A(0, 17), SOC: A(0, 19), DR: A(6),
      ECOS: A(0, 6), DEM: A(0, 4, 5), HOR: A(1, 0, 0, 1), LIOT: A(0, 1, 2), GDR: A(0, 3),
      UDDPLR: A(7), NI: A(0, 0, 1),
    },
  },
  {
    numero: 8750,
    date: '2026-10-15',
    seance: 'Première séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 3649 de M. Attal après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 128,
    exprimes: 66,
    majorite: 34,
    groupes: {
      RN: A(0, 0, 45), EPR: A(13, 0, 0, 1), 'LFI-NFP': A(0, 17), SOC: A(0, 19), DR: A(4),
      ECOS: A(0, 6), DEM: A(1, 1, 7), HOR: A(0, 1, 0, 1), LIOT: A(0, 1, 2), GDR: A(0, 3),
      UDDPLR: A(0, 0, 7), NI: A(0, 0, 1),
    },
  },
  {
    numero: 8749,
    date: '2026-10-15',
    seance: 'Première séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 3185 de M. Bruneau après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 135,
    exprimes: 77,
    majorite: 39,
    groupes: {
      RN: A(0, 0, 48), EPR: A(1, 13, 4, 1), 'LFI-NFP': A(0, 17), SOC: A(0, 18), DR: A(3, 2),
      ECOS: A(0, 7), DEM: A(0, 9), HOR: A(0, 1, 0, 1), LIOT: A(3), GDR: A(0, 2),
      UDDPLR: A(0, 0, 6), NI: A(1),
    },
  },
  {
    numero: 8748,
    date: '2026-10-15',
    seance: 'Première séance du jeudi 15 octobre 2026',
    intitule: "Sous-amendement n° 3984 de M. Juvin à l'amendement n° 3185 de M. Bruneau après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 129,
    exprimes: 73,
    majorite: 37,
    groupes: {
      RN: A(1, 0, 45), EPR: A(16, 0, 0, 1), 'LFI-NFP': A(0, 17), SOC: A(0, 19), DR: A(5),
      ECOS: A(0, 2, 3), DEM: A(2, 7), HOR: A(0, 0, 1, 1), LIOT: A(3), GDR: A(0, 0, 1),
      UDDPLR: A(0, 0, 6), NI: A(1),
    },
  },
  {
    numero: 8747,
    date: '2026-10-15',
    seance: 'Première séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 640 de M. Jean-Philippe Tanguy après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 151,
    exprimes: 151,
    majorite: 76,
    groupes: {
      RN: A(61), EPR: A(0, 17, 0, 1), 'LFI-NFP': A(0, 16), SOC: A(0, 19), DR: A(0, 4),
      ECOS: A(0, 7), DEM: A(0, 11), HOR: A(0, 1, 0, 1), LIOT: A(0, 3), GDR: A(0, 5),
      UDDPLR: A(6), NI: A(0, 1),
    },
  },
  {
    numero: 8746,
    date: '2026-10-15',
    seance: 'Première séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 661 de M. Renault après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: false,
    votants: 129,
    exprimes: 127,
    majorite: 64,
    groupes: {
      RN: A(50), EPR: A(0, 17, 0, 1), 'LFI-NFP': A(0, 14), SOC: A(0, 16), DR: A(1, 2, 2),
      ECOS: A(1, 4), DEM: A(0, 10), HOR: A(0, 1, 0, 1), LIOT: A(0, 3), GDR: A(0, 2),
      UDDPLR: A(5), NI: A(0, 1),
    },
  },
  {
    numero: 8745,
    date: '2026-10-15',
    seance: 'Première séance du jeudi 15 octobre 2026',
    intitule: "Amendement n° 638 de M. Jean-Philippe Tanguy après l'article 3 du projet de loi de finances pour 2027 (première lecture)",
    theme: 'budget',
    adopte: true,
    votants: 124,
    exprimes: 117,
    majorite: 59,
    groupes: {
      RN: A(61), EPR: A(0, 10, 4, 1), 'LFI-NFP': A(0, 0, 1), SOC: A(0, 13), DR: A(0, 6),
      ECOS: A(0, 4), DEM: A(1, 8, 1), HOR: A(0, 1, 1, 1), LIOT: A(0, 4), GDR: A(1, 1),
      UDDPLR: A(6), NI: A(0, 1),
    },
  },
  {
    numero: 2107,
    date: '2025-05-27',
    seance: 'Première séance du mardi 27 mai 2025',
    intitule: "Ensemble de la proposition de loi relative au droit à l'aide à mourir (première lecture)",
    theme: 'sante',
    adopte: true,
    votants: 561,
    exprimes: 504,
    majorite: 253,
    groupes: {
      RN: A(19, 101, 3), EPR: A(64, 11, 14), 'LFI-NFP': A(62, 1, 3), SOC: A(59, 4, 2),
      DR: A(7, 34, 8), ECOS: A(33, 1, 1), DEM: A(20, 9, 7), HOR: A(14, 13, 6),
      LIOT: A(11, 3, 9), GDR: A(12, 1, 3), UDR: A(0, 16), NI: A(4, 5, 1),
    },
  },
  {
    numero: 8430,
    date: '2026-07-21',
    seance: 'Première séance du mardi 21 juillet 2026',
    intitule: "Ensemble du projet de loi relatif à la protection des enfants (première lecture)",
    theme: 'enfance',
    adopte: true,
    votants: 558,
    exprimes: 385,
    majorite: 193,
    groupes: {
      RN: A(119), EPR: A(86, 0, 2, 1), 'LFI-NFP': A(0, 0, 69), SOC: A(0, 0, 63), DR: A(48),
      ECOS: A(3, 0, 33), DEM: A(33, 0, 1), HOR: A(35), LIOT: A(23), GDR: A(5, 7, 5),
      UDDPLR: A(17), NI: A(9),
    },
  },
]

export function tousPourGroupe(groupe, scrutins = SCRUTINS) {
  return scrutins.reduce(
    (acc, s) => {
      const g = s.groupes[groupe]
      if (!g) return acc
      acc.pour += g.pour
      acc.contre += g.contre
      acc.abstention += g.abstention
      return acc
    },
    { pour: 0, contre: 0, abstention: 0 },
  )
}

export function positionDominante(groupe, scrutins) {
  const t = tousPourGroupe(groupe, scrutins)
  if (t.pour === 0 && t.contre === 0 && t.abstention === 0) return null
  const entries = [['pour', t.pour], ['contre', t.contre], ['abstention', t.abstention]]
  entries.sort((a, b) => b[1] - a[1])
  return entries[0][0]
}
