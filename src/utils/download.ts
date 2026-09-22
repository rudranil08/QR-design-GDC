/**
 * Downloads a canvas element as a PNG file.
 */
export function downloadCanvasAsPNG(canvas: HTMLCanvasElement, filename = 'qr-code.png') {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

/**
 * Downloads an SVG string as an SVG file.
 */
export function downloadSVG(svgString: string, filename = 'qr-code.svg') {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Copies canvas image to clipboard as PNG.
 * Returns true if successful, false if clipboard API unavailable.
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) return false
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { resolve(false); return }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        resolve(true)
      } catch {
        resolve(false)
      }
    }, 'image/png')
  })
}

/**
 * Generates a sanitized filename from QR content.
 */
export function buildFilename(content: string, ext: 'png' | 'svg'): string {
  const base = content
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 40)
    .replace(/-+$/, '')
  return `qr-${base || 'code'}.${ext}`
}
