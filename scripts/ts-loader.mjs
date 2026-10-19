// Lets plain Node run the content scripts against the site's own data:
// resolves the "@/" and "@convex/" aliases and extensionless or folder
// imports the way the bundler does, and compiles TypeScript with the
// project's compiler (Node's built-in type stripping can't handle enums).
//
// Usage: node --import ./scripts/ts-loader.mjs scripts/<script>.ts

import { existsSync, readFileSync, statSync } from "node:fs"
import { createRequire, registerHooks } from "node:module"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const ts = createRequire(path.join(root, "package.json"))("typescript")

const ALIASES = {
	"@/": path.join(root, "src"),
	"@convex/": path.join(root, "convex"),
}

function findFile(base) {
	return [
		base,
		`${base}.ts`,
		`${base}.tsx`,
		path.join(base, "index.ts"),
		path.join(base, "index.tsx"),
	].find((file) => existsSync(file) && statSync(file).isFile())
}

registerHooks({
	resolve(specifier, context, nextResolve) {
		let base = null

		for (const [alias, target] of Object.entries(ALIASES)) {
			if (specifier.startsWith(alias)) {
				base = path.join(target, specifier.slice(alias.length))
			}
		}

		if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
			base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier)
		}

		const file = base && findFile(base)
		if (file) return nextResolve(pathToFileURL(file).href, context)

		return nextResolve(specifier, context)
	},

	load(url, context, nextLoad) {
		if (!/\.tsx?$/.test(url)) return nextLoad(url, context)

		const { outputText } = ts.transpileModule(
			readFileSync(new URL(url), "utf8"),
			{
				fileName: fileURLToPath(url),
				compilerOptions: {
					module: ts.ModuleKind.ESNext,
					target: ts.ScriptTarget.ES2022,
					jsx: ts.JsxEmit.ReactJSX,
				},
			}
		)

		return { format: "module", source: outputText, shortCircuit: true }
	},
})
