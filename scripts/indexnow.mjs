// Tells IndexNow search engines (Bing, Yandex, Naver, Seznam, Yep) which pages
// to crawl. Run it after a deploy is live: it reads the live sitemap, so it
// only ever submits pages that are already being served.
// Usage: npm run indexnow [-- <url> ...]   (no URLs = the whole sitemap)

const SITE = "https://chiz.pink"
// Not a secret: it only proves ownership by matching public/<key>.txt.
const KEY = "935320a8b03acb5e8a259ed5ef3d631d"

let urlList = process.argv.slice(2)

if (urlList.length === 0) {
	const sitemap = await fetch(`${SITE}/sitemap.xml`)
	if (!sitemap.ok) {
		console.error(`Couldn't read the sitemap (${sitemap.status})`)
		process.exit(1)
	}
	const xml = await sitemap.text()
	urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
}

const response = await fetch("https://api.indexnow.org/indexnow", {
	method: "POST",
	headers: { "Content-Type": "application/json; charset=utf-8" },
	body: JSON.stringify({
		host: new URL(SITE).host,
		key: KEY,
		keyLocation: `${SITE}/${KEY}.txt`,
		urlList,
	}),
})

// 200 = accepted, 202 = accepted but the key file hasn't been checked yet.
if (response.status === 200 || response.status === 202) {
	console.log(`Submitted ${urlList.length} URLs (${response.status})`)
} else {
	console.error(`IndexNow refused the request: ${response.status} ${await response.text()}`)
	process.exit(1)
}
