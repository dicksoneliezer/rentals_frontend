import api from './axios'

// Branding and storage files are served from the API host. The API often
// returns them as root-relative paths (`/branding/logo.png`), which the
// browser would otherwise request from the frontend origin.
export function resolveApiAsset(url) {
  if (!url || typeof url !== 'string') return null
  if (/^(https?:|data:|blob:)/i.test(url)) return url
  const origin = new URL(api.defaults.baseURL).origin
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`
}
