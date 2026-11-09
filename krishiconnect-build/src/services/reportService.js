import { backend } from './backend'

export function listReports(uid) {
  return backend.listReports(uid)
}

export function getReport(uid, reportId) {
  return backend.getReport(uid, reportId)
}

export function deleteReport(uid, reportId) {
  return backend.deleteReport(uid, reportId)
}

export function saveProfitReport(uid, { name, crop, inputs, result }) {
  return backend.saveReport(uid, {
    type: 'profit',
    name,
    crop: crop || '—',
    inputs,
    result: {
      totalYield: result.totalYield,
      revenue: result.revenue,
      cost: result.cost,
      profit: result.profit,
      status: result.status,
      marginPercent: result.marginPercent,
      breakEvenPrice: result.breakEvenPrice,
      calculatedAt: result.calculatedAt,
    },
  })
}

export function saveFertilizerReport(uid, { name, crop, cropId, inputs, result }) {
  return backend.saveReport(uid, {
    type: 'fertilizer',
    name,
    crop,
    cropId,
    inputs,
    result: {
      hectares: result.hectares,
      target: result.target,
      products: result.products,
      calculatedAt: result.calculatedAt,
    },
  })
}
