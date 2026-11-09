import { readFileSync, writeFileSync } from 'node:fs'
const product = JSON.parse(readFileSync(new URL('../product.json', import.meta.url), 'utf8'))
if (typeof product.name !== 'string' || !product.name.trim()) throw new Error('product.name es obligatorio')
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
const html = new URL('../index.html', import.meta.url)
writeFileSync(html, readFileSync(html, 'utf8').replace(/<title>.*?<\/title>/, `<title>${escape(product.name)} | Calculadora agrícola</title>`))
const xml = new URL('../android/app/src/main/res/values/strings.xml', import.meta.url)
writeFileSync(xml, readFileSync(xml, 'utf8').replace(/(<string name="(?:app_name|title_activity_main)">).*?(<\/string>)/g, (_, start, end) => start + escape(product.name) + end))
console.log('Nombre sincronizado en web y Android.')
