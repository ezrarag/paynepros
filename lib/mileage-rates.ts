// IRS standard mileage rates by year (cents per mile)
// https://www.irs.gov/tax-professionals/standard-mileage-rates
const MILEAGE_RATES: Record<number, number> = {
  2020: 0.575,
  2021: 0.56,
  2022: 0.585, // Jan-Jun: 0.585, Jul-Dec: 0.625 (using Jan-Jun)
  2023: 0.655,
  2024: 0.67,
  2025: 0.70, // Placeholder - update when IRS announces
  2026: 0.70, // Placeholder - update when IRS announces
}

export function getMileageRate(year: number): number {
  return MILEAGE_RATES[year] ?? 0.70 // Default to latest known rate
}

export function getAvailableMileageYears(): number[] {
  return Object.keys(MILEAGE_RATES).map(Number).sort((a, b) => b - a)
}
