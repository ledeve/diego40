/*
  ──────────────────────────────────────────────────────────────────────
  EDIT YOUR HOLDINGS BELOW – replace the zeroes with your actual data
  ──────────────────────────────────────────────────────────────────────
*/
const portfolio = [
    { id: "official-trump", name: "Official Trump", ticker: "$TRUMP", units: 4.44, initialPrice: 11.03 },
    { id: "melania-meme", name: "Melania Meme", ticker: "$MELANIA", units: 84.54, initialPrice: 0.348 },
    { id: "fartcoin", name: "Fartcoin", ticker: "$FARTCOIN", units: 32.67, initialPrice: 1.05 },
    { id: "banana-for-scale-2", name: "Banana For Scale", ticker: "$BANANAS31", units: 5438.5, initialPrice: 0.006114 },
    { id: "cumrocket", name: "CumRockets", ticker: "$CUMMIES", units: 10325.3, initialPrice: 0.002993 },
    { id: "unicorn-fart-dust", name: "Unicorn Fart Dust", ticker: "$UFD", units: 920.64, initialPrice: 0.02669 },
  ];
  
  /*
    The GitHub Action refreshes prices.json every 6 hours.
    CoinGecko API reference:
    https://www.coingecko.com/api/documentations/v3#/simple/get_simple_price
  */
  fetch("prices.json", {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  })
    .then((resp) => resp.json())
    .then((prices) => {
      const tbody = document.querySelector("#portfolio-table tbody");
      let portfolioTotal = 0;
      let portfolioInitialTotal = 0;
  
      // Add current date if lastUpdate is not present
      if (!prices.lastUpdate) {
        prices.lastUpdate = new Date().toISOString();
      }
  
      // Display last update date
      const lastUpdateDate = new Date(prices.lastUpdate);
      const lastUpdateElement = document.querySelector("#last-update");
      lastUpdateElement.textContent = `Last updated: ${lastUpdateDate.toLocaleString()} (automatic refresh of fx rates every 6 hours)`;
  
      portfolio.forEach((asset) => {
        // If a coin ID isn't present in the prices.json (network hiccup), skip it gracefully.
        if (!prices[asset.id] || typeof prices[asset.id].usd !== "number") {
          return;
        }
  
        const currentPrice = prices[asset.id].usd;
        const totalValue = currentPrice * asset.units;
        const initialValue = asset.initialPrice * asset.units;
        const plPercent =
          asset.initialPrice === 0
            ? 0
            : ((currentPrice - asset.initialPrice) / asset.initialPrice) * 100;
  
        portfolioTotal += totalValue;
        portfolioInitialTotal += initialValue;
  
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${asset.name}</td>
          <td>${asset.ticker}</td>
          <td>${asset.units.toLocaleString()}</td>
          <td>${asset.initialPrice.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
          <td>${initialValue.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
          <td>${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
          <td>${totalValue.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
          <td class="${plPercent >= 0 ? "positive" : "negative"}">${plPercent.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}%</td>`;
        tbody.appendChild(tr);
      });
  
      // Add total row (optional)
      const tfoot = document.createElement("tfoot");
      const portfolioPLPercent = portfolioInitialTotal === 0 ? 0 : ((portfolioTotal - portfolioInitialTotal) / portfolioInitialTotal) * 100;
      tfoot.innerHTML = `
        <tr>
          <th colspan="4">Portfolio Total</th>
          <th>${portfolioInitialTotal.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</th>
          <th></th>
          <th>${portfolioTotal.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</th>
          <th class="${portfolioPLPercent >= 0 ? "positive" : "negative"}">${portfolioPLPercent.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}%</th>
        </tr>`;
      document.querySelector("#portfolio-table").appendChild(tfoot);
    })
    .catch((err) => {
      console.error("Failed to load prices.json", err);
      const tbody = document.querySelector("#portfolio-table tbody");
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="8">Unable to load current prices. Please try again later.</td>`;
      tbody.appendChild(tr);
    });
  