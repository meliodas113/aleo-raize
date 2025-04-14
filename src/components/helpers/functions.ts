import { enqueueSnackbar } from "notistack";
import { shortString } from "starknet";

/**
 * Calculates probabilities from two share values assuming a constant product AMM model.
 * Each probability is proportional to the share of each option.
 * @param shares1 - Shares for option 1
 * @param shares2 - Shares for option 2
 * @returns An array of two percentages [prob1, prob2]
 */
export const getProbabilites = (shares1: any, shares2: any): number[] => {
  // Handle edge cases to prevent division by zero
  if (shares1 == "0" && shares2 == "0") return [50, 50];
  if (shares2 == "0") return [100, 0];
  if (shares1 == "0") return [0, 100];

  // Convert micro-units (1e6) to standard units and calculate each percentage
  const total = parseFloat(shares1) + parseFloat(shares2);
  const percent1 = (parseFloat(shares1) / total) * 100;
  const percent2 = (parseFloat(shares2) / total) * 100;

  return [percent1, percent2];
};

/**
 * Decodes a short string from a Starknet field element.
 * @param string - Encoded short string in felt format
 * @returns Decoded string
 */
export const getString = (string: any): string => {
  return shortString.decodeShortString(string);
};

/**
 * Converts a big number (usually in string or bigint format) into a human-readable float string,
 * adjusting for decimals (default: 6 decimals).
 * @param num - Big number input
 * @param decimals - Number of decimal places (default: 6)
 * @returns Stringified number with decimals applied
 */
export const getNumber = (num: any, decimals: number = 6): string => {
  return (parseFloat(BigInt(num).toString()) / 10 ** decimals).toString();
};

/**
 * Calculates the difference between two timestamps (in milliseconds).
 * @param dateFuture - Future date (ms)
 * @param dateNow - Current date (ms)
 * @returns Array with [days, hours, minutes] between the two timestamps
 */
export const getTimeBetween = (
  dateFuture: number,
  dateNow: number
): [number, number, number] => {
  let seconds = Math.floor((dateFuture - dateNow) / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);

  // Normalize hours and minutes after extracting days
  hours = hours - days * 24;
  minutes = minutes - days * 24 * 60 - hours * 60;

  return [days, hours, minutes];
};

/**
 * Displays a custom toast notification using notistack.
 * @param heading - Main title of the toast
 * @param subHeading - Additional message or description
 * @param type - Type used to customize styling (e.g., success, error, etc.)
 */
export const handleToast = (
  heading: string,
  subHeading: string,
  type: string
): void => {
  enqueueSnackbar(heading, {
    //@ts-ignore - custom variant props
    variant: "custom",
    subHeading: subHeading,
    type: type,
    persist: true,
    anchorOrigin: {
      vertical: "top",
      horizontal: "right",
    },
  });
};

/**
 * Calculates the price of each asset in a constant product liquidity pool
 * using the standard CPMM pricing formula.
 * @param poolBalances - Array of balances (e.g., [token0, token1])
 * @returns Array of relative prices for each asset
 */
export const calcPrice = (poolBalances: any[]): number[] => {
  const hasZeroBalances = poolBalances.every((h) => h.toString() === "0");
  if (hasZeroBalances) {
    return poolBalances.map(() => 0);
  }

  // Total pool invariant (product of all holdings)
  const product = poolBalances.reduce((a, b) => a * b);

  // Denominator = sum of (product / each holding)
  const denominator = poolBalances
    .map((h) => product / h)
    .reduce((a, b) => a + b);

  // Price of each asset = (product / holding) / denominator
  const prices = poolBalances.map((holding) => product / holding / denominator);
  return prices.map((price) => +price.valueOf());
};
