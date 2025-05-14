import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Takes a number and returns the number of decimal places it has
 *
 * Example: 1.2345 => 4
 */
export function countDecimals(value: number) {
  if (Math.floor(value) === value) return 0;

  const valueAsString = value.toString();
  return (
    valueAsString.split(".")[1].length ||
    valueAsString.split(",")[1].length ||
    0
  );
}
