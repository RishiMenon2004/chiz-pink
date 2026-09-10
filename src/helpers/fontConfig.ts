import fs from "node:fs"
import path from "node:path"

export function initFontConfig() {
	const fontsDir = path.join(process.cwd(), "public", "fonts")
	const confPath = path.join(fontsDir, "fonts.conf")

	// In serverless / AWS Lambda / Vercel, /tmp is writable for cache
	const cacheDir = process.platform === "win32" 
		? path.join(process.cwd(), ".cache", "fonts") 
		: "/tmp/fonts-cache"

	const confContent = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${fontsDir.replace(/\\/g, "/")}</dir>
  <cachedir>${cacheDir.replace(/\\/g, "/")}</cachedir>
  <config></config>
</fontconfig>`

	if (!fs.existsSync(confPath) || fs.readFileSync(confPath, "utf8") !== confContent) {
		fs.writeFileSync(confPath, confContent, "utf8")
	}

	process.env.FONTCONFIG_PATH = fontsDir
	process.env.PANGOCAIRO_BACKEND = "fontconfig"
}
