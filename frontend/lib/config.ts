// The one place that knows where the backend lives.
// Set NEXT_PUBLIC_API_URL in frontend/.env.local (copy frontend/.env.example).
// The fallback only exists so a fresh clone still works in development.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");
