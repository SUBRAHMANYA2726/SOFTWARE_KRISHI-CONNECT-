import { SAMPLE_MANDI_PRICES, SAMPLE_PRICE_DATE } from '../data/mandi'

/**
 * Replaceable mandi data-access layer.
 *
 * Today it returns the clearly labelled sample dataset. To integrate official
 * Agmarknet prices:
 *   1. Obtain a data.gov.in API key (never commit it).
 *   2. Add a Cloud Function that calls the Agmarknet resource and normalises
 *      rows to the shape below.
 *   3. Swap `fetchMandiPrices` to call that function and set `isSample: false`.
 * The UI reads `isSample` to decide whether the "Sample data" badge is shown.
 */
export const MANDI_META = {
  isSample: true,
  dataSource: 'Sample dataset prepared for KrishiConnect',
  snapshotDate: SAMPLE_PRICE_DATE,
  officialSource: 'https://agmarknet.gov.in/',
  unit: '₹/quintal',
}

export async function fetchMandiPrices() {
  return {
    meta: MANDI_META,
    rows: SAMPLE_MANDI_PRICES.map((row) => ({ ...row })),
  }
}

export function filterPrices(rows, { crop = 'All crops', district = 'All districts', market = 'All markets', search = '' } = {}) {
  const needle = search.trim().toLowerCase()
  return rows.filter((row) => {
    if (crop !== 'All crops' && row.crop !== crop) return false
    if (district !== 'All districts' && row.district !== district) return false
    if (market !== 'All markets' && row.market !== market) return false
    if (needle) {
      const haystack = `${row.crop} ${row.cropKn} ${row.market} ${row.district}`.toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })
}
