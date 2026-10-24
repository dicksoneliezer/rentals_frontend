import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const frontend = resolve(here, '..')
const root = resolve(frontend, '..')

// Full lockup (symbol + wordmark + tagline) — self-explanatory on white paper,
// so it is what we embed in documents/receipts.
const lockup = readFileSync(resolve(frontend, 'src/assets/nipangishe-logo.svg'))

// Symbol-only mark, near-square and transparent — used for favicons/PWA icons so
// the mark stays legible when scaled down (no baked-in text).
const icon = readFileSync(resolve(frontend, 'src/assets/nipangishe-icon.svg'))

// Document logo: transparent background, generous width for crisp PDF text.
await sharp(lockup, { density: 384 })
  .resize({ width: 1200 })
  .png()
  .toFile(resolve(root, 'backend/public/branding/logo.png'))
console.log('wrote backend/public/branding/logo.png')

async function squareIcon(size, innerRatio, out) {
  const inner = await sharp(icon, { density: 384 })
    .resize({ width: Math.round(size * innerRatio) })
    .png()
    .toBuffer()
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toFile(out)
  console.log('wrote', out)
}

await squareIcon(192, 0.82, resolve(frontend, 'public/icons/pwa-192x192.png'))
await squareIcon(512, 0.82, resolve(frontend, 'public/icons/pwa-512x512.png'))
await squareIcon(512, 0.6, resolve(frontend, 'public/icons/pwa-maskable-512x512.png'))
await squareIcon(32, 0.9, resolve(frontend, 'public/icons/favicon-32x32.png'))
await squareIcon(16, 0.9, resolve(frontend, 'public/icons/favicon-16x16.png'))
