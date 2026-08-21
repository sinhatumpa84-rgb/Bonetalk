import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

async function generateFavicons() {
  const svgBuffer = fs.readFileSync('public/favicon.svg')

  const targets = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-precomposed.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ]

  for (const target of targets) {
    const outPath = path.join('public', target.name)
    await sharp(svgBuffer)
      .resize(target.size, target.size)
      .png()
      .toFile(outPath)
    console.log(`Generated ${outPath} (${target.size}x${target.size})`)
  }

  // Multi-resolution ICO (16x16, 32x32, 48x48)
  const png16 = fs.readFileSync('public/favicon-16x16.png')
  const png32 = fs.readFileSync('public/favicon-32x32.png')
  const png48 = fs.readFileSync('public/favicon-48x48.png')

  const images = [
    { width: 16, height: 16, data: png16 },
    { width: 32, height: 32, data: png32 },
    { width: 48, height: 48, data: png48 }
  ]

  // ICO header: 6 bytes
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // 1 = ICO
  header.writeUInt16LE(images.length, 4) // image count

  let offset = 6 + images.length * 16
  const entries = []

  for (const img of images) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0)
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(img.data.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    offset += img.data.length
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...images.map(img => img.data)])
  fs.writeFileSync('public/favicon.ico', icoBuffer)
  console.log('Generated public/favicon.ico (multi-resolution 16x16, 32x32, 48x48)')
}

generateFavicons().catch(err => {
  console.error(err)
  process.exit(1)
})
