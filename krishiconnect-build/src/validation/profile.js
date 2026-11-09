import { DISTRICT_NAMES, taluksForDistrict, PRIMARY_CROPS } from '../data/karnataka'
import { error, isEmpty, validateNumberField, validateRequiredText } from './common'

export const PROFILE_LIMITS = {
  fullName: { min: 2, max: 60 },
  farmArea: { min: 0.1, max: 1000 },
  maxCrops: 5,
}

export function validateProfile(raw = {}) {
  const errors = {}

  const fullName = validateRequiredText(raw.fullName, PROFILE_LIMITS.fullName)
  if (fullName.error) errors.fullName = fullName.error

  const district = String(raw.district || '')
  if (isEmpty(district)) errors.district = error('REQUIRED')
  else if (!DISTRICT_NAMES.includes(district)) errors.district = error('INVALID_SELECTION')

  const taluk = String(raw.taluk || '')
  const validTaluks = taluksForDistrict(district)
  if (isEmpty(taluk)) errors.taluk = error('REQUIRED')
  else if (!validTaluks.includes(taluk)) errors.taluk = error('INVALID_SELECTION')

  if (!['en', 'kn'].includes(raw.language)) errors.language = error('INVALID_SELECTION')

  const farmArea = validateNumberField(raw.farmArea, PROFILE_LIMITS.farmArea)
  if (farmArea.error) errors.farmArea = farmArea.error

  const irrigation = String(raw.irrigation || '')
  if (isEmpty(irrigation)) errors.irrigation = error('REQUIRED')

  const crops = Array.isArray(raw.primaryCrops) ? raw.primaryCrops : []
  if (crops.length === 0) errors.primaryCrops = error('REQUIRED')
  else if (crops.length > PROFILE_LIMITS.maxCrops) errors.primaryCrops = error('TOO_MANY', { max: PROFILE_LIMITS.maxCrops })
  else if (crops.some((crop) => !PRIMARY_CROPS.includes(crop))) errors.primaryCrops = error('INVALID_SELECTION')

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    values: {
      fullName: fullName.value,
      district,
      taluk,
      language: raw.language,
      farmArea: farmArea.value,
      irrigation,
      primaryCrops: crops,
      village: String(raw.village || '').trim().slice(0, 80),
    },
  }
}
