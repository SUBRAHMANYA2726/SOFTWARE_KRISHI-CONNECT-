import { ACRES_TO_HECTARES, round } from '../utils/format'
import { FERTILIZER_CROPS } from '../data/fertilizer'
import { error, validateNumberField } from './common'

export const FERTILIZER_LIMITS = Object.freeze({
  landArea: { min: 0.1, max: 100 },
})

export function findCrop(cropId) {
  return FERTILIZER_CROPS.find((crop) => crop.id === cropId) || null
}

/**
 * Converts a blanket NPK dose (kg/ha) into commercially available fertilizer
 * quantities for the entered land area.
 *
 * Order of supply (documented in the UI):
 *  1. DAP supplies the full P₂O₅ dose and a portion of nitrogen.
 *  2. Urea supplies the remaining nitrogen.
 *  3. MOP supplies the K₂O dose.
 *
 * This is arithmetic support, not an agronomic prescription.
 */
export function calculateFertilizer(raw = {}) {
  const crop = findCrop(raw.cropId)
  if (!crop) {
    return { ok: false, errors: { cropId: error('INVALID_SELECTION') } }
  }

  const landArea = validateNumberField(raw.landArea, FERTILIZER_LIMITS.landArea)
  if (landArea.error) {
    return { ok: false, errors: { landArea: landArea.error } }
  }

  const hectares = round(landArea.value * ACRES_TO_HECTARES, 3)
  const targetN = round(crop.npkPerHectare.n * hectares, 2)
  const targetP = round(crop.npkPerHectare.p * hectares, 2)
  const targetK = round(crop.npkPerHectare.k * hectares, 2)

  // DAP: 46% P2O5, 18% N
  const dap = round(targetP / 0.46, 1)
  const nitrogenFromDap = round(dap * 0.18, 2)
  const remainingN = Math.max(0, round(targetN - nitrogenFromDap, 2))
  const urea = round(remainingN / 0.46, 1)
  const mop = round(targetK / 0.6, 1)

  return {
    ok: true,
    crop,
    landArea: landArea.value,
    hectares,
    target: { n: targetN, p: targetP, k: targetK },
    products: {
      dap: { name: 'DAP', quantityKg: dap },
      urea: { name: 'Urea', quantityKg: urea },
      mop: { name: 'MOP', quantityKg: mop },
    },
    nitrogenFromDap,
    calculatedAt: new Date().toISOString(),
  }
}
