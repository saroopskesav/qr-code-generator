# QR Studio

A responsive QR code toolkit built with React and Vite. Create and customize QR codes, generate codes for email, phone, SMS, WiFi and contacts, preview multiple sizes, create batches, add a logo, scan codes and view your recent history.

## Run locally

From the `qr-genrator` directory:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. Use `npm run build` for a production build and `npm run lint` to run ESLint.

## Data and browser permissions

QR codes are generated in the browser. Theme preference, history (up to 50 entries) and favorites are stored in the browser's local storage, so avoid using shared devices for sensitive data. The scanner requires camera permission. Logo overlay loads the supplied image URL, which may require the image server to allow cross-origin access.
