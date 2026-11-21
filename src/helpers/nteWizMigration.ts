import type { NteWizIdbDump } from "@/types/nteWizImport"

import { NEW_ORIGIN } from "./domainMigration"

// Direct browser-to-browser migration from www.ntewiz.xyz into chiz.pink.
// Even though ntewiz.xyz returns an HTTP 402 deployment-disabled response, the
// browser still loads that response under the https://www.ntewiz.xyz origin, so
// a bookmarklet or console script executed on that tab can read IndexedDB
// ("ntewiz") and hand the snapshot over via window.open + postMessage (or a
// one-click clipboard fallback on the same page).

export const NTEWIZ_MIGRATE_PATH = "/migrate/ntewiz"
export const NTEWIZ_SOURCE_URL = "https://www.ntewiz.xyz/"
export const NTEWIZ_MESSAGE_CHANNEL = "chiz-pink-ntewiz-migrate"

const NTEWIZ_ORIGINS = new Set([
	"https://www.ntewiz.xyz",
	"https://ntewiz.xyz",
])

export type NteWizMigrationMessage =
	| { channel: typeof NTEWIZ_MESSAGE_CHANNEL; type: "ready" }
	| {
			channel: typeof NTEWIZ_MESSAGE_CHANNEL
			type: "data"
			payload: NteWizIdbDump
	  }
	| { channel: typeof NTEWIZ_MESSAGE_CHANNEL; type: "done" }
	| { channel: typeof NTEWIZ_MESSAGE_CHANNEL; type: "error" }

export function isNteWizOrigin(origin: string) {
	return NTEWIZ_ORIGINS.has(origin)
}

export function getNteWizOrigins() {
	return [...NTEWIZ_ORIGINS]
}

export function isNteWizMigrationMessage(
	value: unknown
): value is NteWizMigrationMessage {
	if (typeof value !== "object" || value === null) return false
	const record = value as { channel?: unknown; type?: unknown }
	if (record.channel !== NTEWIZ_MESSAGE_CHANNEL) return false
	return (
		record.type === "ready" ||
		record.type === "data" ||
		record.type === "done" ||
		record.type === "error"
	)
}

const NTEWIZ_STORES = [
	"profile",
	"currencies",
	"characters",
	"goals",
	"weapons",
	"weapon_goals",
	"inventory",
	"wishes",
	"checklist",
]

function buildExtractorBody(targetOrigin: string, autoOpen: boolean): string {
	const originJson = JSON.stringify(targetOrigin)
	const urlJson = JSON.stringify(`${targetOrigin}${NTEWIZ_MIGRATE_PATH}`)
	const channelJson = JSON.stringify(NTEWIZ_MESSAGE_CHANNEL)
	const storesJson = JSON.stringify(NTEWIZ_STORES)

	// Self-contained ES2017 script executed on https://www.ntewiz.xyz/.
	// Keep statements semicolon-terminated with no `//` comments so line-stripping
	// produces a valid single-line bookmarklet and console snippet.
	return `(function () {
  if (!/(^|\\.)ntewiz\\.xyz$/i.test(location.hostname)) {
    alert("Open https://www.ntewiz.xyz/ first, then run this there.");
    return;
  }

  var ORIGIN = ${originJson};
  var URL = ${urlJson};
  var CH = ${channelJson};
  var STORES = ${storesJson};
  var popup = null;
  var ready = false;
  var payload = null;
  var sent = false;
  var statusEl = null;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function trySend() {
    if (!popup || popup.closed || !ready || !payload || sent) return;
    sent = true;
    popup.postMessage({ channel: CH, type: "data", payload: payload }, ORIGIN);
    setStatus("Data sent! Finish the import in the Chiz.Pink tab.");
  }

  window.addEventListener("message", function (e) {
    if (e.origin !== ORIGIN || !e.data || e.data.channel !== CH) return;
    if (e.data.type === "ready") {
      ready = true;
      trySend();
    } else if (e.data.type === "done") {
      setStatus("Migration complete! You can close this tab.");
    } else if (e.data.type === "error") {
      sent = false;
      setStatus("Transfer failed. Try Copy Data and paste it into Chiz.Pink.");
    }
  });

  function openTarget() {
    ready = false;
    sent = false;
    popup = window.open(URL, "chiz-pink-ntewiz-migrate");
    if (!popup) {
      setStatus("Popup blocked. Allow popups or click Copy Data below.");
      return;
    }
    setStatus("Connecting to Chiz.Pink...");
  }
${autoOpen ? "\n  openTarget();\n" : ""}
  function renderCard(summary) {
    document.body.innerHTML = "";
    document.body.style.cssText = "margin:0;min-height:100vh;display:grid;place-items:center;background:#121016;color:#fff;font-family:system-ui,sans-serif;padding:24px;box-sizing:border-box";

    var card = document.createElement("div");
    card.style.cssText = "max-width:460px;width:100%;background:#1e1a24;border:1px solid #3a3146;border-radius:16px;padding:24px;display:grid;gap:14px";

    var h = document.createElement("h2");
    h.textContent = "Migrate NTEWiz Data to Chiz.Pink";
    h.style.cssText = "margin:0;font-size:20px;color:#ff80b5";

    var info = document.createElement("div");
    info.textContent = summary;
    info.style.cssText = "font-size:14px;color:#d8d0e2";

    statusEl = document.createElement("div");
    statusEl.textContent = popup ? "Connecting to Chiz.Pink..." : "Ready. Click Send to Chiz.Pink below.";
    statusEl.style.cssText = "font-size:14px;color:#fff;background:#2b2434;padding:10px 12px;border-radius:10px";

    var row = document.createElement("div");
    row.style.cssText = "display:flex;gap:10px;flex-wrap:wrap";

    var sendBtn = document.createElement("button");
    sendBtn.textContent = "Send to Chiz.Pink";
    sendBtn.style.cssText = "flex:1;padding:10px 16px;border:0;border-radius:999px;background:#ff66a3;color:#121016;font-weight:700;cursor:pointer;font-size:14px";
    sendBtn.onclick = function () { openTarget(); };

    var copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy Data";
    copyBtn.style.cssText = "flex:1;padding:10px 16px;border:1px solid #5a4c6b;border-radius:999px;background:#2b2434;color:#fff;font-weight:600;cursor:pointer;font-size:14px";
    copyBtn.onclick = function () {
      var txt = JSON.stringify(payload);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () {
          copyBtn.textContent = "Copied!";
          setStatus("Copied to clipboard. Paste it into Chiz.Pink.");
        }, fallbackCopy);
      } else {
        fallbackCopy();
      }
      function fallbackCopy() {
        var ta = document.createElement("textarea");
        ta.value = txt;
        ta.style.cssText = "width:100%;height:120px;background:#121016;color:#fff;border:1px solid #5a4c6b;border-radius:8px;padding:8px;font-size:12px";
        card.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          setStatus("Copied! Paste it into Chiz.Pink.");
        } catch (_) {
          setStatus("Select all in the box below, copy it, and paste into Chiz.Pink.");
        }
      }
    };

    row.appendChild(sendBtn);
    row.appendChild(copyBtn);
    card.appendChild(h);
    card.appendChild(info);
    card.appendChild(statusEl);
    card.appendChild(row);
    document.body.appendChild(card);
  }

  var req = indexedDB.open("ntewiz");
  req.onerror = function () {
    alert("Couldn't open NTEWiz local database.");
  };
  req.onsuccess = function () {
    var db = req.result;
    var names = STORES.filter(function (s) {
      return db.objectStoreNames.contains(s);
    });
    if (!names.length) {
      db.close();
      try { indexedDB.deleteDatabase("ntewiz"); } catch (_) {}
      if (popup && !popup.closed) popup.close();
      alert("No NTEWiz data was found in this browser.");
      return;
    }

    var tx = db.transaction(names, "readonly");
    var out = { source: "ntewiz-idb" };
    var left = names.length;
    names.forEach(function (name) {
      var r = tx.objectStore(name).getAll();
      r.onsuccess = function () {
        out[name] = r.result;
        if (--left === 0) {
          db.close();
          payload = out;
          var chars = (out.characters || []).filter(function (c) { return c && c.owned; }).length;
          var wishes = (out.wishes || []).length;
          var inv = (out.inventory || []).length;
          renderCard("Found " + chars + " characters, " + inv + " inventory items, and " + wishes + " pulls.");
          trySend();
        }
      };
      r.onerror = function () {
        if (--left === 0) db.close();
      };
    });
  };
})();`
}

function minifyExtractor(source: string): string {
	return source
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.join("")
}

export function buildNteWizBookmarklet(targetOrigin = NEW_ORIGIN): string {
	const minified = minifyExtractor(buildExtractorBody(targetOrigin, true))
	return `javascript:${encodeURIComponent(minified)}`
}

export function buildNteWizConsoleScript(targetOrigin = NEW_ORIGIN): string {
	return minifyExtractor(buildExtractorBody(targetOrigin, false))
}

export function buildNteWizReadableScript(targetOrigin = NEW_ORIGIN): string {
	return buildExtractorBody(targetOrigin, false)
}
