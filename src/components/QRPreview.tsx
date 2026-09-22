import React, { useRef, useState, useCallback } from 'react'
import type { QROptions } from '../types'
import { useQRCode, generateSVG } from '../hooks/useQRCode'
import { downloadCanvasAsPNG, downloadSVG, copyCanvasToClipboard, buildFilename } from '../utils/download'

interface Props {
  content: string
  options: QROptions
  isValid: boolean
  onGenerated?: (dataURL: string) => void
}

export function QRPreview({ content, options, isValid, onGenerated }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied]       = useState(false)
  const [svgBusy, setSvgBusy]    = useState(false)

  useQRCode({ content, options, canvasRef, onGenerated })

  const downloadPNG = useCallback(() => {
    if (canvasRef.current) downloadCanvasAsPNG(canvasRef.current, buildFilename(content, 'png'))
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
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }, [])

  const isEmpty = !content || !isValid

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* ── Canvas card ── */}
      <div className={`
        relative rounded-2xl overflow-hidden transition-all duration-500
        ${isEmpty
          ? 'border-2 border-dashed border-zinc-200 dark:border-white/[0.08]'
          : 'shadow-2xl shadow-black/10 dark:shadow-black/40'
        }
      `}
        style={{ width: Math.min(options.size, 320), height: Math.min(options.size, 320) }}
      >
        {/* Checkerboard for transparent */}
        {options.bgTransparent && !isEmpty && (
          <div className="absolute inset-0 checkerboard" />
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={options.size}
          height={options.size}
          style={{
            width: '100%',
            height: '100%',
            display: isEmpty ? 'none' : 'block',
          }}
        />

        {/* Empty state */}
        {isEmpty && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-300 dark:text-zinc-700">
            <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none">
              <rect x="6" y="6" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="34" y="6" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="6" y="34" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="10" y="10" width="8" height="8" rx="1" fill="currentColor" opacity="0.3"/>
              <rect x="38" y="10" width="8" height="8" rx="1" fill="currentColor" opacity="0.3"/>
              <rect x="10" y="38" width="8" height="8" rx="1" fill="currentColor" opacity="0.3"/>
              <rect x="34" y="34" width="6" height="6" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="44" y="34" width="6" height="6" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="34" y="44" width="6" height="6" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="44" y="44" width="6" height="6" rx="1" fill="currentColor" opacity="0.2"/>
            </svg>
            <p className="text-xs font-medium text-center text-zinc-400 dark:text-zinc-600 px-6 leading-relaxed">
              Fill in the form on the left to generate your QR code
            </p>
          </div>
        )}
      </div>

      {/* ── Action row ── */}
      {!isEmpty && (
        <div className="flex items-center gap-2 scale-in">
          <button onClick={downloadPNG} className="btn-primary text-xs px-4 py-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v8M5 7l3 3 3-3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            PNG
          </button>

          <button onClick={downloadSVGFile} disabled={svgBusy} className="btn-secondary text-xs px-4 py-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v8M5 7l3 3 3-3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {svgBusy ? '…' : 'SVG'}
          </button>

          <button onClick={handleCopy} className="btn-secondary text-xs px-3 py-2">
            {copied ? (
              <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2.5 8L6 11.5l7.5-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5.5" y="5.5" width="8" height="9" rx="1.5"/>
                <path d="M10.5 5.5V3.5A1 1 0 009.5 2.5h-7A1 1 0 001.5 3.5v9A1 1 0 002.5 13.5h3" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
