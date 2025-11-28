export type Brand = 'paynepros'

export interface BrandConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
  typography: {
    fontFamily: string
    headingWeight: string
  }
  style: 'light' | 'elegant' | 'bold' | 'modern'
}

export const brandConfigs: Record<Brand, BrandConfig> = {
  paynepros: {
    name: 'Payne Professional Services',
    colors: {
      primary: 'hsl(220, 40%, 25%)', // Deep professional blue
      secondary: 'hsl(220, 30%, 45%)', // Medium blue-gray
      accent: 'hsl(200, 60%, 50%)', // Light blue accent
      background: 'hsl(0, 0%, 98%)', // Very light gray
      foreground: 'hsl(220, 20%, 15%)', // Dark gray-blue
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      headingWeight: '600',
    },
    style: 'elegant',
  },
}

export function getBrandConfig(brand: Brand): BrandConfig {
  return brandConfigs[brand]
}


