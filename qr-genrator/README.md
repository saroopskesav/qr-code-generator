# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## QR Generator (React + Vite)

Lightweight QR code generator built with React and Vite.

### Features

- Generate QR codes locally (no external API) using the `qrcode` package.
- Live preview, download as PNG, copy source text, clear input.
- Responsive, modern UI with a theme toggle (dark / light).

### Run locally

1. Install dependencies

```bash
cd /Users/saroopskesav/Downloads/GITHUB/qr-code-generator/qr-genrator
npm install
```

2. Start dev server

```bash
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

### Notes

- The app stores the theme (dark/light) in `localStorage`.
- QR codes are generated client-side — no network calls to third-party APIs.

### Contributing

- Feel free to open PRs or suggest UI/UX improvements.
