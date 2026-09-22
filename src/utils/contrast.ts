/**
 * Calculates relative luminance of an sRGB color.
 * @param hex - 6-digit hex color string e.g. '#ff0000'
 */
function luminance(hex: string): number {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255

  const linearize = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

/**
 * Returns the WCAG contrast ratio between two hex colors.
 * Value is between 1 (no contrast) and 21 (max).
 */
export function contrastRatio(fg: string, bg: string): number {
  const L1 = luminance(fg)
  const L2 = luminance(bg)
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Returns a scan-reliability warning message if contrast is too low,
 * or null if contrast is acceptable.
 */
export function getScanWarning(
  fg: string,
  bg: string,
  bgTransparent: boolean,
  ecLevel: string,
  hasLogo: boolean,
): string | null {
  if (bgTransparent) {
    return 'Transparent background may reduce scan reliability on certain backgrounds.'
  }

  const ratio = contrastRatio(fg, bg)

  if (ratio < 2) {
    return 'Very low contrast — QR code may not scan reliably. Try darker foreground or lighter background.'
  }

  if (ratio < 4) {
    return 'Low contrast — some scanners may struggle. Consider increasing contrast for best results.'
  }

  if (hasLogo && ecLevel !== 'H') {
    return 'A logo overlay reduces scannable area. Consider using Error Correction Level H for better reliability.'
  }

  return null
}
