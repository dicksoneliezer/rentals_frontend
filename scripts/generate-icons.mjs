import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const publicDir = 'public/'
const src = 'scripts/pwa-icons.svg'

await mkdir(`${publicDir}icons`, { recursive: true })

await sharp(src).resize(192, 192).png().toFile(`${publicDir}icons/pwa-192x192.png`)
console.log('wrote icons/pwa-192x192.png')
await sharp(src).resize(512, 512).png().toFile(`${publicDir}icons/pwa-512x512.png`)
console.log('wrote icons/pwa-512x512.png')
await sharp(src).resize(512, 512).png().toFile(`${publicDir}icons/pwa-maskable-512x512.png`)
console.log('wrote icons/pwa-maskable-512x512.png')
console.log('done')
