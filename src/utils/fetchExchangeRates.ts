// fetchExchangeRates.ts
import axios from "axios";

type ConversionRates = Record<string, number>;

export const fetchExchangeRates = async (): Promise<ConversionRates> => {
  try {
    // NOTE: Avoid hard-failing the entire app if this external API/key breaks.
    // Polymarket pages do not depend on FX rates.
    const url =
      process.env.REACT_APP_EXCHANGE_RATE_URL ||
      "https://open.er-api.com/v6/latest/USD";
    const response = await axios.get(url);
    const allRates = response.data?.conversion_rates;
    if (allRates && typeof allRates === "object") {
      const neededRates = [
        "AUD",
        "USD",
        "CHF",
        "EUR",
        "GBP",
        "JPY",
        "NZD",
        "CAD",
      ];
      const filteredRates = Object.fromEntries(
        Object.entries(allRates).filter(([key]) => neededRates.includes(key)),
      );
      return filteredRates as ConversionRates;
    }

    // If API format is unexpected, degrade gracefully.
    return { USD: 1 } as ConversionRates;
  } catch (error) {
    // Degrade gracefully: return a minimal mapping so the app renders.
    return { USD: 1 } as ConversionRates;
  }
};
