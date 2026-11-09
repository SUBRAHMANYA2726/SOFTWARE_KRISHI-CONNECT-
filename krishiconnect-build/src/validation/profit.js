import { round } from '../utils/format'
import { validateNumberField } from './common'

/**
 * Approved input ranges for the Profit Calculator (ISSUE the single source of
 * truth used by the UI, documentation and automation tests).
 *
 * Units
 *   landArea        acres          (international acre)
 *   yieldPerAcre    quintals/acre  (1 quintal = 100 kg)
 *   sellingPrice    ₹/quintal
 *   cultivationCost ₹ total for the entered land area
 */
export const PROFIT_LIMITS = Object.freeze({
  landArea: { min: 0.1, max: 500 },
  yieldPerAcre: { min: 0.1, max: 500 },
  sellingPrice: { min: 1, max: 100000 },
  cultivationCost: { min: 0, max: 10000000 },
})

export const PROFIT_FIELDS = ['landArea', 'yieldPerAcre', 'sellingPrice', 'cultivationCost']

/**
 * Pure calculation used by the Profit Calculator page.
 * Revenue = total yield (quintals) × selling price (₹/quintal)
 * Profit  = revenue − cultivation cost
 */
export function calculateProfit(raw = {}) {
  const landArea = validateNumberField(raw.landArea, PROFIT_LIMITS.landArea)
  const yieldPerAcre = validateNumberField(raw.yieldPerAcre, PROFIT_LIMITS.yieldPerAcre)
  const sellingPrice = validateNumberField(raw.sellingPrice, PROFIT_LIMITS.sellingPrice)
  const cultivationCost = validateNumberField(raw.cultivationCost, PROFIT_LIMITS.cultivationCost)

  const errors = {}
  if (landArea.error) errors.landArea = landArea.error
  if (yieldPerAcre.error) errors.yieldPerAcre = yieldPerAcre.error
  if (sellingPrice.error) errors.sellingPrice = sellingPrice.error
  if (cultivationCost.error) errors.cultivationCost = cultivationCost.error

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  const totalYield = round(landArea.value * yieldPerAcre.value, 2)
  const revenue = round(totalYield * sellingPrice.value, 2)
  const cost = round(cultivationCost.value, 2)
  const profit = round(revenue - cost, 2)

  let status = 'BREAK_EVEN'
  if (profit > 0) status = 'PROFIT'
  else if (profit < 0) status = 'LOSS'

  let marginPercent = 0
  if (revenue > 0) marginPercent = round((profit / revenue) * 100, 1)

  let breakEvenPrice = 0
  if (totalYield > 0) breakEvenPrice = round(cost / totalYield, 2)

  return {
    ok: true,
    values: {
      landArea: landArea.value,
      yieldPerAcre: yieldPerAcre.value,
      sellingPrice: sellingPrice.value,
      cultivationCost: cost,
    },
    totalYield,
    revenue,
    cost,
    profit,
    status,
    marginPercent,
    breakEvenPrice,
    calculatedAt: new Date().toISOString(),
  }
}
