// ─── CENTRALIZED BONETALK BACKEND PRICING SOURCE OF TRUTH ────────────────────
// Core Rules:
// 1. Minimum allowed price: ₹12,900
// 2. Maximum allowed price: ₹15,799
// 3. Every final BoneTalk price MUST end in '99'. Never end in '00' or any non-99 value.
// 4. Exact correspondence between frontend display, backend calculation, and Razorpay paise (x100).

export const MIN_BONETALK_PRICE = 12900
export const MAX_BONETALK_PRICE = 15799
export const DEFAULT_BONETALK_PRICE = 12999

/**
 * Calculates and normalizes the official BoneTalk product price.
 * 
 * @param {number|string|null} rawInput - Raw price number or string (e.g. 12799, 13742, "₹14,000")
 * @returns {{ numeric: number, display: string, paise: number, currency: 'INR' }}
 */
export function calculateBoneTalkPrice(rawInput) {
  let num

  if (typeof rawInput === 'string') {
    const cleaned = rawInput.replace(/[^0-9.]/g, '')
    num = parseFloat(cleaned)
  } else if (typeof rawInput === 'number') {
    num = rawInput
  } else {
    num = DEFAULT_BONETALK_PRICE
  }

  if (isNaN(num) || num === undefined || num === null) {
    num = DEFAULT_BONETALK_PRICE
  }

  // 1. Initial clamp to allowed range
  if (num < MIN_BONETALK_PRICE) {
    num = MIN_BONETALK_PRICE
  } else if (num > MAX_BONETALK_PRICE) {
    num = MAX_BONETALK_PRICE
  }

  // 2. Normalize to end in '99'
  // If not already ending in 99, snap to the nearest upper '99' ending
  let finalNumeric = Math.floor(num)
  if (finalNumeric % 100 !== 99) {
    finalNumeric = Math.floor(finalNumeric / 100) * 100 + 99
  }

  // 3. Enforce bounds strictly after 99 normalization
  if (finalNumeric < MIN_BONETALK_PRICE) {
    finalNumeric = 12999
  }
  if (finalNumeric > MAX_BONETALK_PRICE) {
    finalNumeric = MAX_BONETALK_PRICE
  }

  return {
    numeric: finalNumeric,
    display: `₹${finalNumeric.toLocaleString('en-IN')}`,
    paise: finalNumeric * 100,
    currency: 'INR',
  }
}

/**
 * Formats a valid BoneTalk numeric price to Indian Rupee string
 * @param {number} amount
 * @returns {string}
 */
export function formatBoneTalkPrice(amount) {
  return calculateBoneTalkPrice(amount).display
}
