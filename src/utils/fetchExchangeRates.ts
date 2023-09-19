import axios from "axios";

type ConversionRates = Record<string, number>;

export const fetchExchangeRates = async (): Promise<ConversionRates> => {
  try {
    const response = await axios.get(
      "https://v6.exchangerate-api.com/v6/8db55165607b79288936de0b/latest/USD",
    );
    if (response.data.result === "success") {
      const allRates = response.data.conversion_rates;
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
    } else {
      throw new Error("API response was not successful");
    }
  } catch (error) {
    throw new Error(`Error fetching conversion rates: ${error}`);
  }
};
