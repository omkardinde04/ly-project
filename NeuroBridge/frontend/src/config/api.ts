/**
 * Where the backend lives.
 * In production (Vercel multi-service project): defaults to '' (same origin, routed via Vercel rewrites).
 * In local development: defaults to http://localhost:4000 unless VITE_BACKEND_URL is set.
 */
export const API_BASE: string = (
  import.meta.env.VITE_BACKEND_URL !== undefined
    ? import.meta.env.VITE_BACKEND_URL
    : import.meta.env.PROD
    ? ''
    : 'http://localhost:4000'
).replace(/\/+$/, '');
