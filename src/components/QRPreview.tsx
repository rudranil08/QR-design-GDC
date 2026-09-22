import React, { useRef, useState, useCallback } from 'react'
import type { QROptions } from '../types'
import { useQRCode, generateSVG } from '../hooks/useQRCode'
import { downloadCanvasAsPNG, downloadSVG, copyCanvasToClipboard, buildFilename } from '../utils/download'

interface Props {
  content:     string
  options:     QROptions
  isValid:     boolean
  onGenerated?: (dataURL: string) => void
}

export function QRPreview({ content, options, isValid, onGenerated }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied,  setCopied]  = useState(false)
  const [svgBusy, setSvgBusy] = useState(false)

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
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }, [])

  const isEmpty = !content || !isValid

  // Display size: cap at 280px so it fits the pane cleanly
  const displaySize = Math.min(options.size, 280)

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* QR canvas — no decorative shadow, no rounded-2xl, just a clean border */}
      <div
        className={`
          relative overflow-hidden bg-white dark:bg-zinc-900
          border border-zinc-200 dark:border-zinc-800
          ${isEmpty ? 'border-dashed' : ''}
        `}
        style={{ width: displaySize, height: displaySize, borderRadius: 8 }}
      >
        {/* Checkerboard: visible only when bg is transparent */}
        {options.bgTransparent && !isEmpty && (
          <div className="absolute inset-0 checkerboard" />
        )}

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
          <div className="
            w-full h-full flex flex-col items-center justify-center gap-3
            text-zinc-300 dark:text-zinc-700
          ">
            {/* QR outline illustration — subtle, monochrome */}
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
            <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center px-6 leading-5">
              Enter content on the left to generate your QR code
            </p>
          </div>
        )}
      </div>

      {/* Action buttons — appear only when QR is generated */}
      {!isEmpty && (
        <div className="flex items-center gap-2">
          {/* PNG is the primary action */}
          <button onClick={downloadPNG} className="btn-accent text-[13px] font-medium">
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1v7M4.5 5.5L7 8l2.5-2.5M1.5 10.5v1A1.5 1.5 0 003 13h8a1.5 1.5 0 001.5-1.5v-1"/>
            </svg>
            Download PNG
          </button>

          {/* SVG and Copy are secondary */}
          <button onClick={downloadSVGFile} disabled={svgBusy} className="btn-secondary text-[13px]">
            {svgBusy ? 'Generating…' : 'SVG'}
          </button>

          <button
            onClick={handleCopy}
            className="btn-icon"
            title="Copy to clipboard"
          >
            {copied ? (
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7l3.5 3.5L12 3"/>
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
