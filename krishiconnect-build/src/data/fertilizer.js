/**
 * Fertilizer planning reference data.
 *
 * IMPORTANT: The NPK figures below are *indicative blanket recommendations*
 * compiled from Karnataka package-of-practices guidance. They are NOT a soil-test
 * prescription and must not be presented as official agronomic advice. The UI
 * displays this disclaimer next to every result.
 *
 * Product nutrient percentages follow the Fertiliser (Control) Order, 1985:
 *   Urea 46% N | DAP 18% N + 46% P2O5 | MOP 60% K2O
 */
export const FERTILIZER_SOURCES = [
  {
    label: 'Karnataka Department of Agriculture — Raitha Mitra',
    url: 'https://raitamitra.karnataka.gov.in/',
    note: 'State agriculture guidance and district extension services.',
  },
  {
    label: 'University of Agricultural Sciences, Bengaluru',
    url: 'https://uasbangalore.edu.in/',
    note: 'Package of practices and crop recommendation literature.',
  },
  {
    label: 'Agmarknet — Agricultural Marketing Information Network',
    url: 'https://agmarknet.gov.in/',
    note: 'Official source for mandi price data (not used for the sample dataset).',
  },
]

export const FERTILIZER_CROPS = [
  {
    id: 'ragi',
    name: 'Ragi (Finger millet)',
    nameKn: 'ರಾಗಿ',
    npkPerHectare: { n: 50, p: 40, k: 25 },
    season: 'Kharif / Rabi',
  },
  {
    id: 'paddy',
    name: 'Paddy (Irrigated)',
    nameKn: 'ಭತ್ತ',
    npkPerHectare: { n: 100, p: 50, k: 50 },
    season: 'Kharif',
  },
  {
    id: 'maize',
    name: 'Maize',
    nameKn: 'ಮೆಕ್ಕೆಜೋಳ',
    npkPerHectare: { n: 150, p: 75, k: 37.5 },
    season: 'Kharif / Rabi',
  },
  {
    id: 'groundnut',
    name: 'Groundnut',
    nameKn: 'ಶೇಂಗಾ',
    npkPerHectare: { n: 25, p: 50, k: 75 },
    season: 'Kharif / Summer',
  },
  {
    id: 'cotton',
    name: 'Cotton',
    nameKn: 'ಹತ್ತಿ',
    npkPerHectare: { n: 150, p: 75, k: 75 },
    season: 'Kharif',
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    nameKn: 'ಕಬ್ಬು',
    npkPerHectare: { n: 250, p: 75, k: 75 },
    season: 'Annual',
  },
]

export const FERTILIZER_PRODUCTS = [
  {
    id: 'urea',
    name: 'Urea',
    composition: '46% N',
    nutrients: { n: 46, p: 0, k: 0 },
  },
  {
    id: 'dap',
    name: 'DAP (Di-ammonium phosphate)',
    composition: '18% N · 46% P₂O₅',
    nutrients: { n: 18, p: 46, k: 0 },
  },
  {
    id: 'mop',
    name: 'MOP (Muriate of potash)',
    composition: '60% K₂O',
    nutrients: { n: 0, p: 0, k: 60 },
  },
]

/** Standard nutrient plan: DAP supplies P (and some N), urea tops up N, MOP supplies K. */
export const NUTRIENT_PLAN =
  'DAP is applied first to meet the phosphorus dose, the nitrogen it supplies is deducted, urea covers the remaining nitrogen, and MOP meets the potash dose.'
