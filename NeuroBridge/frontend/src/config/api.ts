/**
 * Where the backend lives.
 * Local development: http://localhost:4000 (default).
 * Deployment: set VITE_BACKEND_URL in the frontend's environment, e.g.
 *   VITE_BACKEND_URL=https://api.your-domain.com
 */
export const API_BASE: string = (import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000').replace(/\/+$/, '');
