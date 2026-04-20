# Authenticated URL Shortener — Web (React)

React + Vite + TypeScript SPA for registration, login, logout, and managing shortened URLs. It stores the JWT in `localStorage` and calls the NestJS API.

## Prerequisites

- Node.js 20 LTS or newer
- npm
- Backend API running (see `../backend/README.md`)

## Setup

1. Copy environment (optional; defaults to `http://localhost:3000`):

   ```bash
   cp .env.example .env
   ```

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open the printed local URL (default `http://localhost:5173`). Ensure the backend `FRONTEND_URL` matches this origin for CORS.

## Environment

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the Nest API (default `http://localhost:3000`) |

## Build

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static host (e.g. Vercel, Netlify). Set `VITE_API_URL` at build time to your production API URL.

## Testing

```bash
npm run build
```

The template uses TypeScript project references; `npm run build` runs `tsc` and bundles with Vite.

## AI-assisted development

The UI and client code were created with help from **Cursor** and similar AI tools for layout, routing, and API wiring. These tools sped up iteration on forms, error handling, and consistency with the backend contract. Final behavior was verified manually against the running API.
