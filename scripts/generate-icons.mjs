// Genera íconos PNG para el PWA usando solo Canvas API nativa de Node 18+
// Requiere: node >= 18 y el paquete "canvas" no es necesario — usamos un SVG embebido
// y lo convertimos con sharp si está disponible, o dejamos placeholders PNG válidos.

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const OUT = join(process.cwd(), 'public', 'icons')
mkdirSync(OUT, { recursive: true })

// PNG mínimo válido de 1x1 pixel transparente (base para placeholder)
// En producción reemplazá estos archivos por íconos reales de 192x192 y 512x512.
// SVG del ícono de abeja sobre fondo ámbar
function svgIcon(size) {
  const r = size / 2
  const fontSize = size * 0.55
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r * 0.3}" fill="#d97706"/>
  <text x="50%" y="54%" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">🐝</text>
</svg>`
}

// Escribir los SVG como fallback (válidos en browsers modernos aunque el manifest espere PNG)
// Para PNG reales: npm install sharp y descomentar la sección de abajo.
writeFileSync(join(OUT, 'icon-192.svg'), svgIcon(192))
writeFileSync(join(OUT, 'icon-512.svg'), svgIcon(512))

// Intentar generar PNG con sharp si está instalado
try {
  const sharp = (await import('sharp')).default

  await sharp(Buffer.from(svgIcon(192))).png().toFile(join(OUT, 'icon-192.png'))
  await sharp(Buffer.from(svgIcon(512))).png().toFile(join(OUT, 'icon-512.png'))
  console.log('✅ Íconos PNG generados con sharp.')
} catch {
  // sharp no disponible — crear PNG mínimos válidos (1×1 px transparente, luego escalar en browser)
  // Usamos un PNG 1x1 blanco como placeholder funcional
  const png1x1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )
  writeFileSync(join(OUT, 'icon-192.png'), png1x1)
  writeFileSync(join(OUT, 'icon-512.png'), png1x1)
  console.log('⚠️  sharp no encontrado. Se crearon íconos placeholder.')
  console.log('   Para íconos reales: npm install sharp && node scripts/generate-icons.mjs')
}
