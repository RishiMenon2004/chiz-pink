// Uploads real exports the way the exporter will and prints the link to open.
// Usage: node scripts/test-import-drop.mjs <site-url> <export.json> [more.json]
import { webcrypto } from "node:crypto"
import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"

const [site, ...files] = process.argv.slice(2)

const plaintext = JSON.stringify({
	version: 1,
	exports: files.map((file) => JSON.parse(readFileSync(file, "utf8"))),
})
const compressed = gzipSync(plaintext, { level: 9 })

const keyBytes = webcrypto.getRandomValues(new Uint8Array(32))
const iv = webcrypto.getRandomValues(new Uint8Array(12))
const key = await webcrypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, [
	"encrypt",
])
const ciphertext = await webcrypto.subtle.encrypt(
	{ name: "AES-GCM", iv },
	key,
	compressed
)

const body = {
	version: 1,
	ciphertext: Buffer.from(ciphertext).toString("base64"),
	iv: Buffer.from(iv).toString("base64"),
}
console.log(`JSON ${plaintext.length}, stored ${body.ciphertext.length} characters`)

if (process.env.DRY_RUN) process.exit(0)

const response = await fetch(`${site}/api/import-drop`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(body),
})
const result = await response.json()
console.log(response.status, result)

if (response.status === 201) {
	const fragment = `${result.dropId}.${Buffer.from(keyBytes).toString("base64url")}`
	console.log(`${site}/pulls/import-external#${fragment}`)
}
