import sharp from 'sharp'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const logoPath = resolve(root, 'public/logocesar.svg')
const outPath = resolve(root, 'public/og-default.png')

const WIDTH = 1200
const HEIGHT = 630

const logoExists = existsSync(logoPath)

const title = 'César Londoño'
const subtitle = 'Full Stack Developer'
const tagline = 'React · Vue.js · TypeScript · Firebase'

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#1a1a2e"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <ellipse cx="${WIDTH / 2}" cy="${HEIGHT / 2}" rx="500" ry="320" fill="url(#glow)"/>

  ${logoExists ? `
  <g transform="translate(${WIDTH / 2 - 60}, 90)">
    <circle cx="60" cy="60" r="60" fill="#6366f1" opacity="0.15"/>
    <text x="60" y="78" font-family="Arial, sans-serif" font-size="60" font-weight="bold"
          text-anchor="middle" fill="#ffffff">CL</text>
  </g>
  ` : ''}

  <text x="${WIDTH / 2}" y="320" font-family="Georgia, 'Playfair Display', serif"
        font-size="84" font-weight="700" text-anchor="middle" fill="#ffffff"
        letter-spacing="-1">${title}</text>

  <line x1="${WIDTH / 2 - 80}" y1="360" x2="${WIDTH / 2 + 80}" y2="360"
        stroke="#6366f1" stroke-width="3"/>

  <text x="${WIDTH / 2}" y="420" font-family="Arial, 'Oswald', sans-serif"
        font-size="38" font-weight="500" text-anchor="middle"
        fill="#a5b4fc" letter-spacing="4">${subtitle.toUpperCase()}</text>

  <text x="${WIDTH / 2}" y="490" font-family="Arial, sans-serif"
        font-size="22" font-weight="400" text-anchor="middle"
        fill="#9ca3af" letter-spacing="2">${tagline}</text>

  <text x="${WIDTH / 2}" y="570" font-family="Arial, sans-serif"
        font-size="20" font-weight="400" text-anchor="middle"
        fill="#6b7280" letter-spacing="1">cesarlondoño.dev</text>
</svg>
`

await sharp(Buffer.from(svg))
  .png({ quality: 90, compressionLevel: 9 })
  .toFile(outPath)

console.log(`[og] Generada imagen: ${outPath}`)