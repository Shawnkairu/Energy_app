import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const built = path.join(root, 'standalone-dist', 'index.html')
const out = path.join(root, 'e-mappa-standalone.html')

// Strip type="module" and crossorigin so the file works when opened via file://
let html = fs.readFileSync(built, 'utf8')
html = html.replace(/<script\s+type="module"\s+crossorigin>/g, '<script>')
html = html.replace(/<script\s+type="module">/g, '<script>')
html = html.replace(/\s+crossorigin/g, '')

fs.writeFileSync(out, html, 'utf8')
console.log(`Wrote ${out}`)
