/**
 * Generate a random alphanumeric code
 * @param length - Length of the code (default: 8)
 * @returns Random code (e.g., "AB12CD34")
 */
export function generateRandomCode(length: number = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars (0, O, I, 1)
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }

  return code;
}

/**
 * Format code with hyphen for display (e.g., "AB12-CD34")
 * @param code - Raw code string
 * @returns Formatted code
 */
export function formatCode(code: string): string {
  // AB12CD34 -> AB12-CD34
  if (code.length === 8) {
    return `${code.slice(0, 4)}-${code.slice(4)}`;
  }
  return code;
}

/**
 * Remove formatting from code (e.g., "AB12-CD34" -> "AB12CD34")
 * @param code - Formatted code string
 * @returns Raw code
 */
export function unformatCode(code: string): string {
  // AB12-CD34 -> AB12CD34
  // Remove all non-alphanumeric characters
  return code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
}

/**
 * Validate code format
 * @param code - Code to validate
 * @returns True if valid format
 */
export function isValidCodeFormat(code: string): boolean {
  const rawCode = unformatCode(code);
  return /^[A-Z0-9]{8}$/.test(rawCode);
}
