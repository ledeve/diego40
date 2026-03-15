export interface CoinData {
  id: string
  name: string
  ticker: string
  units: number
  initialPrice: number
  color: string
  accent: string
  icon: string
  chain: 'SOL' | 'BSC'
  bio: string
}

export interface EnrichedCoin extends CoinData {
  currentPrice: number | null
  initialValue: number
  currentValue: number | null
  pl: number | null
  dollarPL: number | null
}

export interface PriceResponse {
  [coinId: string]: { usd: number }
}

export type SortMode = 'default' | 'pl-desc' | 'pl-asc'
export type ChartTab = 'alloc' | 'pl' | 'value' | null
