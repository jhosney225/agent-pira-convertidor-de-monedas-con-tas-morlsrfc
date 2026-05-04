
```javascript
#!/usr/bin/env node

import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

// Define the currency exchange tools
const tools = [
  {
    name: "get_exchange_rate",
    description:
      "Get the current exchange rate between two currencies. Returns the exchange rate from source to target currency.",
    input_schema: {
      type: "object",
      properties: {
        source_currency: {
          type: "string",
          description:
            "The source currency code (e.g., USD, EUR, MXN, GBP, JPY)",
        },
        target_currency: {
          type: "string",
          description:
            "The target currency code (e.g., USD, EUR, MXN, GBP, JPY)",
        },
      },
      required: ["source_currency", "target_currency"],
    },
  },
  {
    name: "convert_currency",
    description: "Convert an amount from one currency to another",
    input_schema: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "The amount to convert",
        },
        source_currency: {
          type: "string",
          description: "The source currency code",
        },
        target_currency: {
          type: "string",
          description: "The target currency code",
        },
      },
      required: ["amount", "source_currency", "target_currency"],
    },
  },
];

// Mock function to get exchange rates
// In a real application, this would call an actual exchange rate API
function getExchangeRate(sourceCurrency, targetCurrency) {
  // Simulated real-time exchange rates
  const rates = {
    USD: {
      EUR: 0.92,
      MXN: 17.05,
      GBP: 0.79,
      JPY: 149.5,
      CAD: 1.36,
      AUD: 1.53,
    },
    EUR: {
      USD: 1.09,
      MXN: 18.52,
      GBP: 0.86,
      JPY: 162.5,
      CAD: 1.48,
      AUD: 1.66,
    },
    MXN: {
      USD: 0.059,
      EUR: 0.054,
      GBP: 0.046,
      JPY: 8.77,
      CAD: 0.08,
      AUD: 0.09,
    },
    GBP: {
      USD: 1.27,
      EUR: 1.16,
      MXN: 21.49,
      JPY: 189.0,
      CAD: 1.72,
      AUD: 1.93,
    },
    JPY: {
      USD: 0.0067,
      EUR: 0.0062,
      MXN: 0.114,
      GBP: 0.0053,
      CAD: 0.0091,
      AUD: 0.01,
    },
    CAD: {
      USD: 0.735,
      EUR: 0.676,
      MXN: 12.53,
      GBP: 0.581,
      JPY: 109.9,
      AUD: 1.125,
    },
    AUD: {
      USD: 0.653,
      EUR: 0.601,
      MXN: 11.15,
      GBP: 0.517,
      JPY: 97.7,
      CAD: 0.889,
    },
  };

  const upperSource = sourceCurrency.toUpperCase();
  const upperTarget = targetCurrency.toUpperCase();

  if (upperSource === upperTarget) {
    return 1;
  }

  if (rates[upperSource] && rates[upperSource][upperTarget]) {
    return rates[upperSource][upperTarget];
  }

  // If direct rate not found, try reverse conversion
  if (rates[upperTarget] && rates[upperTarget][upperSource]) {
    return 1 / rates[upperTarget][upperSource];
  }

  // Default fallback
  return 1;
}

// Process tool calls
function processToolCall(toolName, toolInput) {
  if (toolName === "get_exchange_rate") {
    const rate = getExchangeRate(
      toolInput.source_currency,
      toolInput.target_currency
    );
    return JSON.stringify({
      success: true,
      source: toolInput.source_currency.toUpperCase(),
      target: toolInput.target_currency.toUpperCase(),
      rate: rate,
      timestamp: new Date().toISOString(),
    });
  } else if (toolName === "convert_currency") {
    const rate = getExchangeRate(
      toolInput.source_currency,
      toolInput.target_currency
    );
    const convertedAmount = toolInput.amount * rate;
    return JSON.stringify({
      success: true,
      originalAmount: toolInput.amount,
      originalCurrency: toolInput.source_currency.toUpperCase(),
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
      targetCurrency: toolInput.target_currency.toUpperCase(),
      exchangeRate: rate,
      timestamp: new Date().toISOString(),
    });
  }
  return JSON.stringify({ error: "Unknown tool" });
}

// Main function to handle user input and interact with Claude
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(
    "🌍 Convertidor de Monedas con Tasas en Tiempo Real (powered by Claude)"
  );
  console.log("====================================================");
  console.log("Monedas soportadas: USD, EUR, MXN, GB