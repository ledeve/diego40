/*
  ──────────────────────────────────────────────────────────────────────
  EDIT YOUR HOLDINGS BELOW – replace the zeroes with your actual data
  ──────────────────────────────────────────────────────────────────────
*/
const portfolio = [
    { id: "ethereum", name: "Ethereum", units: 100, initialPrice: 230 },
    { id: "solana", name: "Solana", units: 200, initialPrice: 10 },
    { id: "golem", name: "Golem", units: 100, initialPrice: 0.11 },
  ];
  
  /*
    The GitHub Action refreshes prices.json every 6 hours.
    CoinGecko API reference:
    https://www.coingecko.com/api/documentations/v3#/simple/get_simple_price
  */
  fetch("prices.json")
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
      lastUpdateElement.textContent = `Last updated: ${lastUpdateDate.toLocaleString()}`;
  
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
          <td>${asset.units.toLocaleString()}</td>
          <td>${asset.initialPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${initialValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td class="${plPercent >= 0 ? "positive" : "negative"}">${plPercent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</td>`;
        tbody.appendChild(tr);
      });
  
      // Add total row (optional)
      const tfoot = document.createElement("tfoot");
      const portfolioPLPercent = portfolioInitialTotal === 0 ? 0 : ((portfolioTotal - portfolioInitialTotal) / portfolioInitialTotal) * 100;
      tfoot.innerHTML = `
        <tr>
          <th colspan="3">Portfolio Total</th>
          <th>${portfolioInitialTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</th>
          <th></th>
          <th>${portfolioTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</th>
          <th class="${portfolioPLPercent >= 0 ? "positive" : "negative"}">${portfolioPLPercent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</th>
        </tr>`;
      document.querySelector("#portfolio-table").appendChild(tfoot);
    })
    .catch((err) => {
      console.error("Failed to load prices.json", err);
      const tbody = document.querySelector("#portfolio-table tbody");
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="7">Unable to load current prices. Please try again later.</td>`;
      tbody.appendChild(tr);
    });
  