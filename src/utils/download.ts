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
 * Generates a sanitized, privacy-safe filename from QR content.
 * Prevents password leakage for Wi-Fi codes and strips private query parameters.
 */
export function buildFilename(content: string, ext: 'png' | 'svg'): string {
  let base = 'code'

  if (content.startsWith('WIFI:')) {
    // Extract only SSID: S:([^;]+) - NEVER include password in filename!
    const match = content.match(/S:([^;]+)/)
    const ssid = match ? match[1].replace(/\\([\\";,:])/g, '$1') : 'network'
    base = `wifi-${ssid}`
  } else if (content.startsWith('mailto:')) {
    const email = content.replace(/^mailto:/, '').split('?')[0]
    base = `email-${email}`
  } else if (content.startsWith('tel:')) {
    const phone = content.replace(/^tel:/, '')
    base = `phone-${phone}`
  } else if (/^https?:\/\//i.test(content)) {
    try {
      const url = new URL(content)
      const host = url.hostname.replace(/^www\./, '')
      const path = url.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-')
      base = `${host}${path ? `-${path}` : ''}`
    } catch {
      base = content.replace(/^https?:\/\//i, '')
    }
  } else {
    base = `text-${content}`
  }

  const clean = base
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '')

  return `qr-${clean || 'code'}.${ext}`
}
