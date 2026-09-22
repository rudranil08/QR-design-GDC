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
 * Draws a QR code onto a canvas element, with optional logo overlay.
 * Re-renders whenever content or options change.
 */
export function useQRCode({ content, options, canvasRef, onGenerated }: UseQRCodeOptions) {
  const logoImageRef = useRef<HTMLImageElement | null>(null)

  // Pre-load logo image when file changes
  useEffect(() => {
    if (!options.logoFile) {
      logoImageRef.current = null
      return
    }
    const url = URL.createObjectURL(options.logoFile)
    const img = new Image()
    img.onload = () => { logoImageRef.current = img }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [options.logoFile])

  const renderQR = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !content) return

    const { size, fgColor, bgColor, bgTransparent, ecLevel, margin } = options

    try {
      await QRCode.toCanvas(canvas, content, {
        width: size,
        margin,
        color: {
          dark: fgColor,
          light: bgTransparent ? '#00000000' : bgColor,
        },
        errorCorrectionLevel: ecLevel as ECLevel,
      })

      // Overlay logo if present
      const logoImg = logoImageRef.current
      if (logoImg) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const logoSize = (size * options.logoSize) / 100
          const x = (size - logoSize) / 2
          const y = (size - logoSize) / 2

          // White padding behind logo
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8)

          ctx.drawImage(logoImg, x, y, logoSize, logoSize)
        }
      }

      onGenerated?.(canvas.toDataURL('image/png', 0.5))
    } catch (err) {
      console.error('QR generation error:', err)
    }
  }, [content, options, canvasRef, onGenerated])

  useEffect(() => {
    // Small delay so logo image can load
    const timer = setTimeout(renderQR, 50)
    return () => clearTimeout(timer)
  }, [renderQR])

  return { renderQR }
}

/**
 * Generates an SVG string for the given content and options.
 */
export async function generateSVG(content: string, options: QROptions): Promise<string> {
  return QRCode.toString(content, {
    type: 'svg',
    width: options.size,
    margin: options.margin,
    color: {
      dark: options.fgColor,
      light: options.bgTransparent ? '#00000000' : options.bgColor,
    },
    errorCorrectionLevel: options.ecLevel,
  })
}
