// A random 128-bit id in hex. crypto.randomUUID() only exists in secure
// contexts (HTTPS/localhost), so it's missing when the dev server is opened
// over a LAN IP; getRandomValues works everywhere.
export function randomId() {
	const bytes = crypto.getRandomValues(new Uint8Array(16))
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}
