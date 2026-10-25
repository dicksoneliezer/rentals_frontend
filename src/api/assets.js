import api from './axios'

// Files under these paths are served by the API host. Responses often return
// them root-relative (`/storage/houses/clip.mp4`, `/branding/logo.png`), which
// the browser would otherwise request from the frontend origin.
const API_ASSET_PATH = /^\/(?:storage|branding)\//

export function resolveApiAsset(url) {
  if (!url || typeof url !== 'string') return null
  if (/^(https?:|data:|blob:)/i.test(url)) return url
  if (!API_ASSET_PATH.test(url)) return url
  const origin = new URL(api.defaults.baseURL).origin
  return `${origin}${url}`
}

export function rewriteAssetUrls(value) {
  if (typeof value === 'string') {
    return API_ASSET_PATH.test(value) ? resolveApiAsset(value) : value
  }
  if (Array.isArray(value)) return value.map(rewriteAssetUrls)
  if (value && Object.prototype.toString.call(value) === '[object Object]') {
    const out = {}
    for (const [key, nested] of Object.entries(value)) {
      out[key] = rewriteAssetUrls(nested)
    }
    return out
  }
  return value
}
