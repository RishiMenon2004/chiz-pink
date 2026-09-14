import fs from "node:fs"
import os from "node:os"
import path from "node:path"

export function initFontConfig() {
	const fontsDir = path.join(process.cwd(), "public", "fonts")
	const confDir = path.join(os.tmpdir(), `chiz-fontconfig-${process.pid}`)
	const confPath = path.join(confDir, "fonts.conf")
	const cacheDir = path.join(confDir, "cache")

	try {
		fs.mkdirSync(cacheDir, { recursive: true })

		const confContent = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${fontsDir.replace(/\\/g, "/")}</dir>
  <cachedir>${cacheDir.replace(/\\/g, "/")}</cachedir>
  <config></config>
</fontconfig>`

		if (
			!fs.existsSync(confPath) ||
			fs.readFileSync(confPath, "utf8") !== confContent
		) {
			fs.writeFileSync(confPath, confContent, "utf8")
		}

		process.env.FONTCONFIG_PATH = confDir
		process.env.PANGOCAIRO_BACKEND = "fontconfig"
	} catch (err) {
		console.warn("Failed to initialize fontconfig:", err)
	}
}
