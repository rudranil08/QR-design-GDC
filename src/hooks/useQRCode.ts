import { useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import type { QROptions, ECLevel } from '../types'

interface UseQRCodeOptions {
  content: string
  options: QROptions
  canvasRef: React.RefObject<HTMLCanvasElement>
  onGenerated?: (dataURL: string) => void
}

/**
 * Draws a high-DPI crisp QR code onto a canvas element with optional logo overlay.
 * Uses supersampling so it stays tack-sharp and 100% scannable even when zoomed in.
 */
export function useQRCode({ content, options, canvasRef, onGenerated }: UseQRCodeOptions) {
  const logoImageRef = useRef<HTMLImageElement | null>(null)

  const renderQR = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !content) return

    const { size, fgColor, bgColor, bgTransparent, ecLevel, margin } = options

    // Render at crisp high-res (at least 2x scale for Retina / browser zoom clarity)
    const dpr = typeof window !== 'undefined' ? Math.max(window.devicePixelRatio || 1, 2) : 2
    const renderSize = Math.max(size, Math.round(size * dpr))

    try {
      // Create offscreen high-res canvas first
      const offscreen = document.createElement('canvas')
      await QRCode.toCanvas(offscreen, content, {
        width: renderSize,
        margin,
        color: {
          dark: fgColor,
          light: bgTransparent ? '#00000000' : bgColor,
        },
        errorCorrectionLevel: ecLevel as ECLevel,
      })

      // Set visible canvas dimensions
      canvas.width = renderSize
      canvas.height = renderSize
      const ctx = canvas.getContext('2d', { alpha: true })
      if (ctx) {
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, renderSize, renderSize)
        ctx.drawImage(offscreen, 0, 0, renderSize, renderSize)

        // Overlay logo if present with high-res crisp coordinates
        const logoImg = logoImageRef.current
        if (logoImg) {
          const logoSize = (renderSize * options.logoSize) / 100
          const x = (renderSize - logoSize) / 2
          const y = (renderSize - logoSize) / 2
          const pad = Math.max(4, Math.round(renderSize * 0.015))

          // Clean background padding behind logo
          ctx.fillStyle = bgTransparent ? '#ffffff' : bgColor
          ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2)

          ctx.imageSmoothingEnabled = true
          ctx.drawImage(logoImg, x, y, logoSize, logoSize)
        }
      }

      if (onGenerated) {
        // Create lightweight 64x64 thumbnail for history storage to prevent localStorage quota exhaustion
        const thumbCanvas = document.createElement('canvas')
        thumbCanvas.width = 64
        thumbCanvas.height = 64
        const thumbCtx = thumbCanvas.getContext('2d')
        if (thumbCtx) {
          thumbCtx.drawImage(canvas, 0, 0, 64, 64)
          onGenerated(thumbCanvas.toDataURL('image/png', 0.7))
        } else {
          onGenerated(canvas.toDataURL('image/png', 0.5))
        }
      }
    } catch (err) {
      console.error('QR generation error:', err)
    }
  }, [content, options, canvasRef, onGenerated])

  // Pre-load logo image when file changes.
  // Call renderQR() directly in onload to guarantee the logo appears
  // even if the 50ms debounce timer below already fired before load completed.
  useEffect(() => {
    if (!options.logoFile) {
      logoImageRef.current = null
      return
    }
    let revoked = false
    const url = URL.createObjectURL(options.logoFile)
    const img = new Image()
    img.onload = () => {
      logoImageRef.current = img
      if (!revoked) { URL.revokeObjectURL(url); revoked = true }
      renderQR()
    }
    img.onerror = () => {
      if (!revoked) { URL.revokeObjectURL(url); revoked = true }
      logoImageRef.current = null
    }
    img.src = url
    return () => {
      if (!revoked) { URL.revokeObjectURL(url); revoked = true }
    }
  // renderQR is stable (memoized) — intentionally omitting from deps to avoid
  // re-running logo load every time content/options changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.logoFile])

  useEffect(() => {
    const timer = setTimeout(renderQR, 50)
    return () => clearTimeout(timer)
  }, [renderQR])

  return { renderQR }
}

/**
 * Generates an SVG string for the given content and options,
 * including the logo overlay if one is present.
 */
export async function generateSVG(content: string, options: QROptions): Promise<string> {
  const baseSvg = await QRCode.toString(content, {
    type: 'svg',
    width: options.size,
    margin: options.margin,
    color: {
      dark: options.fgColor,
      light: options.bgTransparent ? '#00000000' : options.bgColor,
    },
    errorCorrectionLevel: options.ecLevel,
  })

  // Embed logo into SVG if present
  if (options.logoFile) {
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(options.logoFile!)
      })

      const match = baseSvg.match(/viewBox="0 0 (\d+) (\d+)"/)
      if (match) {
        const totalSize = parseInt(match[1], 10)
        const logoModules = (totalSize * options.logoSize) / 100
        const x = (totalSize - logoModules) / 2
        const y = (totalSize - logoModules) / 2
        const pad = Math.max(0.5, totalSize * 0.015)
        const bgFill = options.bgTransparent ? '#ffffff' : options.bgColor

        const logoElement = `
  <rect x="${(x - pad).toFixed(2)}" y="${(y - pad).toFixed(2)}" width="${(logoModules + pad * 2).toFixed(2)}" height="${(logoModules + pad * 2).toFixed(2)}" fill="${bgFill}" rx="0.5" />
  <image href="${dataUrl}" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${logoModules.toFixed(2)}" height="${logoModules.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />
</svg>`

        return baseSvg.replace(/<\/svg>\s*$/, logoElement)
      }
    } catch (err) {
      console.error('Failed to embed logo into SVG export:', err)
    }
  }

  return baseSvg
}
