# QR Designer

> 🚀 **[🌐 Live Demo — Try QR Designer](https://qr-design-gdc.vercel.app/)**

A free, fully client-side QR code generator and designer built with React + TypeScript + Vite + Tailwind CSS.

## Features

* **5 QR Types**: URL, Plain Text, Email, Phone, Wi-Fi
* **Real-time preview** — QR updates instantly as you type
* **Full customization**: size, foreground/background colors, error correction level, margin
* **6 Visual Presets**: Classic, Ocean, Forest, Sunset, Night, Rose
* **Logo overlay**: Upload a logo to embed in the center of your QR code
* **Download**: PNG and SVG export
* **Copy to Clipboard**: One-click copy as PNG
* **Scan reliability warnings**: WCAG contrast checking, low-ECL alerts
* **Recent QR codes**: Last 10 QR codes persist across page refreshes
* **Dark / Light theme**: System preference detected, togglable
* **Responsive design**: Works on desktop, tablet, and mobile
* **Zero backend**: Runs entirely in the browser

## Tech Stack

* [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* [Vite](https://vitejs.dev/) for development and build
* [Tailwind CSS v3](https://tailwindcss.com/) for styling
* [qrcode](https://www.npmjs.com/package/qrcode) for QR generation

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 to view the app.

## Building for Production

```bash
npm run build
```

The output is in `dist/`. Deploy to Vercel, Netlify, or any static host.

## Deploy to Vercel

```bash
npx vercel --prod
```

Or connect the repository to [Vercel](https://vercel.com) — zero configuration required.

## Project Structure

```text
src/
├── components/
│   ├── forms/          # Per-type input forms
│   ├── QRTypeSelector  # Tab bar
│   ├── CustomizationPanel
│   ├── PresetPanel
│   ├── QRPreview       # Canvas + download actions
│   ├── RecentQRList
│   ├── ScanWarning
│   └── ThemeToggle
├── hooks/
│   ├── useQRCode       # QR canvas rendering
│   ├── useRecent       # localStorage persistence
│   └── useTheme        # Dark/light mode
├── types/              # TypeScript types & constants
└── utils/              # QR content, validation, contrast, download
```
