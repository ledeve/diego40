import type { PriceResponse } from '../types'

export async function fetchPrices(coinIds: string[]): Promise<{ prices: PriceResponse; error: string | null }> {
  const ids = coinIds.join(',')

  // Try CoinGecko live first
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { cache: 'no-store' }
    )
    if (!res.ok) throw new Error('CoinGecko error')
    const data = await res.json()
    return { prices: data, error: null }
  } catch {
    // Fallback to cached prices
    try {
      const res = await fetch('https://diego40.wtf/prices.json', { cache: 'no-store' })
      const data = await res.json()
      const prices: PriceResponse = {}
      for (const [key, val] of Object.entries(data)) {
        if (key !== 'lastUpdate' && (val as { usd?: number })?.usd !== undefined) {
          prices[key] = val as { usd: number }
        }
      }
      return { prices, error: 'CoinGecko down — using cached prices' }
    } catch {
      return { prices: {}, error: 'All price sources failed.' }
    }
  }
}
