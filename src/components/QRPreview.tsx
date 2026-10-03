import React, { useRef, useState, useCallback } from 'react'
import type { QROptions } from '../types'
import { useQRCode, generateSVG } from '../hooks/useQRCode'
import { downloadCanvasAsPNG, downloadSVG, copyCanvasToClipboard, buildFilename } from '../utils/download'

interface Props {
  content:      string
  options:      QROptions
  isValid:      boolean
  zoomLevel:    number
  onZoomChange: (z: number) => void
  onGenerated?: (dataURL: string) => void
}

// Framing specifications per zoom level — perfectly fitted, zero user movement required
const FRAME_CONFIG: Record<number, { frameSize: number; borderPadding: number; label: string }> = {
  1:    { frameSize: 280, borderPadding: 16, label: 'Standard (4 mod margin)' },
  1.25: { frameSize: 330, borderPadding: 12, label: 'Focused (2 mod margin)' },
  2:    { frameSize: 380, borderPadding: 8,  label: 'Maximum (1 mod margin)' },
}

export function QRPreview({
  content,
  options,
  isValid,
  zoomLevel,
  onZoomChange,
  onGenerated,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied,  setCopied]  = useState(false)
  const [svgBusy, setSvgBusy] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)

  useQRCode({ content, options, canvasRef, onGenerated })

  const downloadPNG = useCallback(() => {
    if (canvasRef.current)
      downloadCanvasAsPNG(canvasRef.current, buildFilename(content, 'png'))
  }, [content])

  const downloadSVGFile = useCallback(async () => {
    if (!content) return
    setSvgBusy(true)
    try {
      const svg = await generateSVG(content, options)
      downloadSVG(svg, buildFilename(content, 'svg'))
    } finally { setSvgBusy(false) }
  }, [content, options])

  const handleCopy = useCallback(async () => {
    if (!canvasRef.current) return
    const ok = await copyCanvasToClipboard(canvasRef.current)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      setCopyFailed(true)
      setTimeout(() => setCopyFailed(false), 2000)
    }
  }, [])

  const isEmpty = !content || !isValid

  // Automated framing dimensions based on current zoom
  const currentConfig = FRAME_CONFIG[zoomLevel] || FRAME_CONFIG[1]
  const frameSize = isEmpty ? 280 : currentConfig.frameSize
  const borderPadding = isEmpty ? 0 : currentConfig.borderPadding

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* Header toolbar for zoom inspection */}
      {!isEmpty && (
        <div
          className="flex items-center justify-between px-1 text-xs text-zinc-500 transition-all duration-200"
          style={{ width: `${frameSize}px`, maxWidth: '100%' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Live Preview</span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              {options.size}×{options.size}px
            </span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-zinc-800 p-0.5 rounded-md text-[11px]">
            {[1, 1.25, 2].map((z) => (
              <button
                key={z}
                onClick={() => onZoomChange(z)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  zoomLevel === z
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title={FRAME_CONFIG[z]?.label}
              >
                {z}×
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QR canvas viewport container — perfectly framed, zero scrolling/moving required */}
      <div
        className={`
          relative bg-white dark:bg-zinc-900
          border border-zinc-200 dark:border-zinc-800
          transition-all duration-200 rounded-xl
          flex items-center justify-center overflow-hidden
          ${isEmpty ? 'border-dashed' : 'shadow-sm'}
        `}
        style={{
          width: `${frameSize}px`,
          height: `${frameSize}px`,
          maxWidth: '100%',
          maxHeight: 'min(62vh, 380px)',
          padding: `${borderPadding}px`,
        }}
      >
        {!isEmpty ? (
          /* Sized canvas container filling frame perfectly */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Checkerboard: visible only when bg is transparent, fits inside border */}
            {options.bgTransparent && (
              <div className="absolute inset-0 checkerboard rounded-md" />
            )}

            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain rounded-md"
              style={{
                display: 'block',
                imageRendering: 'auto',
              }}
            />
          </div>
        ) : (
          /* Empty state */
          <div className="
            w-full h-full flex flex-col items-center justify-center gap-3 p-4
            text-zinc-300 dark:text-zinc-700
          ">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.25"/>
              <rect x="30" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.25"/>
              <rect x="4" y="30" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.25"/>
              <rect x="7" y="7" width="8" height="8" rx="1" fill="currentColor" opacity="0.25"/>
              <rect x="33" y="7" width="8" height="8" rx="1" fill="currentColor" opacity="0.25"/>
              <rect x="7" y="33" width="8" height="8" rx="1" fill="currentColor" opacity="0.25"/>
              <rect x="30" y="30" width="5" height="5" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="39" y="30" width="5" height="5" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="30" y="39" width="5" height="5" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="39" y="39" width="5" height="5" rx="1" fill="currentColor" opacity="0.2"/>
            </svg>
            <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center px-4 leading-5">
              Enter content on the left to generate your QR code
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!isEmpty && (
        <div className="flex items-center gap-2">
          <button onClick={downloadPNG} className="btn-accent text-[13px] font-medium">
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1v7M4.5 5.5L7 8l2.5-2.5M1.5 10.5v1A1.5 1.5 0 003 13h8a1.5 1.5 0 001.5-1.5v-1"/>
            </svg>
            Download PNG
          </button>

          <button onClick={downloadSVGFile} disabled={svgBusy} className="btn-secondary text-[13px]">
            {svgBusy ? 'Generating…' : 'SVG'}
          </button>

          <button
            onClick={handleCopy}
            className={`btn-icon ${copyFailed ? 'text-rose-500' : ''}`}
            title={copyFailed ? 'Copy unavailable (requires HTTPS)' : 'Copy to clipboard'}
          >
            {copied ? (
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7l3.5 3.5L12 3"/>
              </svg>
            ) : copyFailed ? (
              <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M3 3l8 8M11 3L3 11"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
                <rect x="4.5" y="4.5" width="8" height="8.5" rx="1.25"/>
                <path d="M9.5 4.5V2.75A1.25 1.25 0 008.25 1.5h-6A1.25 1.25 0 001 2.75v8.5A1.25 1.25 0 002.25 12.5H4.5"/>
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
