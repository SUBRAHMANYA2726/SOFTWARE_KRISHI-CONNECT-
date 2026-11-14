import { calculateProfit, PROFIT_LIMITS } from '../validation/profit'
import { calculateFertilizer, FERTILIZER_LIMITS } from '../validation/fertilizer'
import { validateProfile, PROFILE_LIMITS } from '../validation/profile'
import { validateLogin, validateRegistration } from '../validation/auth'
import { filterPrices } from '../services/mandiService'
import { SAMPLE_MANDI_PRICES } from '../data/mandi'
import { formatINR, formatNumber } from '../utils/format'

/**
 * Development-only automation bridge.
 *
 * White-box tests need to drive the real validation modules directly (including
 * branches that the UI cannot reach), so the same module instances the browser
 * runs are published on `window.__kcTest`. Nothing here replaces application
 * behaviour: every function delegates to the production module.
 *
 * main.jsx imports this file only when `import.meta.env.DEV` is true, so it is
 * never part of a production build.
 */
function plain(value) {
  return JSON.parse(JSON.stringify(value))
}

export function installTestBridge() {
  if (typeof window === 'undefined') return

  window.__kcTest = {
    version: 1,
    calculateProfit: (raw) => plain(calculateProfit(raw)),
    calculateFertilizer: (raw) => plain(calculateFertilizer(raw)),
    validateProfile: (raw) => plain(validateProfile(raw)),
    validateRegistration: (raw) => plain(validateRegistration(raw)),
    validateLogin: (raw) => plain(validateLogin(raw)),
    filterPrices: (filters) => plain(filterPrices(SAMPLE_MANDI_PRICES, filters)),
    mandiRowCount: () => SAMPLE_MANDI_PRICES.length,
    formatINR: (value, options) => formatINR(value, options),
    formatNumber: (value) => formatNumber(value),
    limits: {
      profit: PROFIT_LIMITS,
      fertilizer: FERTILIZER_LIMITS,
      profile: PROFILE_LIMITS,
    },
  }
}
