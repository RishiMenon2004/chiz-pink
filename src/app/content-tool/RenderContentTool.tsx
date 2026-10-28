"use client"

import { KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState, useTransition } from "react"

import type { ContentFile, ContentImageStatus, ContentToolOptions } from "@/types/content"

import { formatContentJson, snakeCase, validateContent, VERSION_PATTERN } from "@/helpers/contentJson"

import { checkImages, loadContent, saveContent } from "./actions"
import { buttonIcon, NamedColorList } from "./ContentToolFields"
import { CalendarOrderPanel } from "./ContentToolCalendar"
import { OrderItem, OrderPanel } from "./ContentToolOrder"
import {
	ArcsSection,
	BannersSection,
	BtrSection,
	CharactersSection,
	ContentUpdate,
	EventsSection,
	PatchSection,
} from "./ContentToolSections"

import pageStyles from "@/app/page.module.css"
import styles from "./page.module.css"

const NEW_VERSION = "__new__"

const STATUS_LABELS: Record<ContentImageStatus["status"], string> = {
	intake: "In folder",
	public: "On site",
	missing: "Missing",
}

// Tabs in the toolbar, one per section. Ids match the start of
// validateContent's "where" labels, so a tab can show its errors.
const SECTIONS = [
	{ id: "patch", label: "Version", Editor: PatchSection },
	{ id: "characters", label: "Characters", Editor: CharactersSection },
	{ id: "arcs", label: "Arcs", Editor: ArcsSection },
	{ id: "banners", label: "Banners", Editor: BannersSection },
	{ id: "events", label: "Events", Editor: EventsSection },
	{ id: "btr", label: "BTR", Editor: BtrSection },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

// Lines of content.json the side panel shows before "Show all".
const JSON_PREVIEW_LINES = 16

function nextVersion(versions: string[]) {
	const [major, minor] = (versions[0] ?? "1.0").split(".").map(Number)
	return `${major}.${minor + 1}`
}

export function RenderContentTool({
	options,
	versions: initialVersions,
	initialContent,
}: {
	options: ContentToolOptions
	versions: string[]
	initialContent: ContentFile
}) {
	const [versions, setVersions] = useState(initialVersions)
	const [content, setContent] = useState(initialContent)
	const [savedJson, setSavedJson] = useState(() =>
		initialVersions.length > 0 ? formatContentJson(initialContent) : ""
	)
	// Bumped on load so rows with their own state start fresh.
	const [loadKey, setLoadKey] = useState(0)
	const [newVersion, setNewVersion] = useState<string | null>(initialVersions.length > 0 ? null : nextVersion([]))
	const [images, setImages] = useState<{ images: ContentImageStatus[]; unused: string[] }>({ images: [], unused: [] })
	const [imageToken, setImageToken] = useState(0)
	const [tab, setTab] = useState<SectionId>("patch")
	const [showAllJson, setShowAllJson] = useState(false)
	const [showAllImages, setShowAllImages] = useState(false)
	const tabRefs = useRef<Partial<Record<SectionId, HTMLButtonElement | null>>>({})
	const [message, setMessage] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	const json = formatContentJson(content)
	const isDirty = json !== savedJson
	const jsonLines = json.split("\n").length - 1
	const hasVersion = VERSION_PATTERN.test(content.version)
	// Collapsed, the Images panel lists only what's still to be added.
	const shownImages = showAllImages ? images.images : images.images.filter((image) => image.status === "missing")
	const { errors, warnings } = validateContent(content, {
		characterIds: options.characters.map(({ id }) => id),
		arcIds: options.arcs.map(({ id }) => id),
		materialIds: options.rewards.map(({ id }) => id),
		versionsWithDates: options.versionsWithDates,
	})
	const command = `npm run content:add -- content-intake/${content.version}`

	const update: ContentUpdate = (change) =>
		setContent((current) => {
			const draft = structuredClone(current)
			change(draft)
			return draft
		})

	// Which images content:add will find, rechecked as names change.
	useEffect(() => {
		if (!hasVersion) return
		const timer = setTimeout(() => {
			checkImages(content)
				.then(setImages)
				.catch(() => setImages({ images: [], unused: [] }))
		}, 400)
		return () => clearTimeout(timer)
	}, [content, hasVersion, imageToken])

	useEffect(() => {
		if (!isDirty) return
		const warn = (e: BeforeUnloadEvent) => e.preventDefault()
		window.addEventListener("beforeunload", warn)
		return () => window.removeEventListener("beforeunload", warn)
	}, [isDirty])

	function openVersion(version: string) {
		if (isDirty && !window.confirm("Discard the unsaved changes?")) return
		startTransition(async () => {
			const loaded = await loadContent(version)
			setContent(loaded ?? { version, patch: { phase1Start: "", phase2Start: "", end: "" } })
			setSavedJson(loaded ? formatContentJson(loaded) : "")
			setLoadKey((key) => key + 1)
			setNewVersion(null)
			if (!versions.includes(version)) setVersions((list) => [version, ...list])
			setMessage(loaded ? `Loaded content-intake/${version}/content.json` : `New version ${version}, not saved yet`)
		})
	}

	function save() {
		if (!hasVersion) return
		startTransition(async () => {
			try {
				const file = await saveContent(content)
				setSavedJson(json)
				setImageToken((token) => token + 1)
				setMessage(`Saved ${file}`)
			} catch (error) {
				setMessage(`Couldn't save: ${error instanceof Error ? error.message : String(error)}`)
			}
		})
	}

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault()
				save()
			}
		}
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	})

	const imageUrl = (file: string) => {
		const image = images.images.find((entry) => entry.file === file)
		if (image?.status === "intake") {
			return `/content-tool/image?version=${content.version}&file=${encodeURIComponent(file)}&t=${imageToken}`
		}
		if (image?.status === "public") return `/${image.destination}`
		return undefined
	}

	const sectionProps = { content, update, options, imageUrl }

	// Standard tablist keys, as on the profile's ability tabs: arrows move
	// between tabs, Home/End jump.
	const onTabKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
		const index = SECTIONS.findIndex(({ id }) => id === tab)
		const last = SECTIONS.length - 1
		const next = {
			ArrowRight: index === last ? 0 : index + 1,
			ArrowLeft: index === 0 ? last : index - 1,
			Home: 0,
			End: last,
		}[e.key]
		if (next === undefined) return
		e.preventDefault()
		const { id } = SECTIONS[next]
		setTab(id)
		tabRefs.current[id]?.focus()
	}

	const sectionCount = (id: SectionId) =>
		id === "patch" ? undefined : (id === "characters" ? content.characters : content[id])?.length ?? 0
	const sectionErrors = (id: string) => errors.filter((issue) => issue.where.startsWith(id)).length

	// The current list tab's entries for the Order panel.
	const orderItems = (): OrderItem[] | undefined => {
		const key = (index: number, label: string) => `${tab}-${index}-${label}`
		switch (tab) {
			case "characters":
				return (content.characters ?? []).map((character, index) => ({
					key: key(index, character.id),
					label: character.name || "New character",
					icon: imageUrl(`avatar_${character.id}.webp`),
				}))
			case "arcs":
				return (content.arcs ?? []).map((arc, index) => ({
					key: key(index, arc.id),
					label: arc.name || "New arc",
					icon: imageUrl(`arc_${arc.id}.webp`),
				}))
			case "banners":
				return (content.banners ?? []).map((banner, index) => {
					const src = banner.character ? imageUrl(`gacha_${banner.character}.webp`) : undefined
					return {
						key: key(index, banner.character),
						label: banner.name || `Phase ${banner.phase}: ${banner.character || "…"}`,
						banner: src ? { src, themeColor: banner.themeColor, yOffset: banner.yOffset || "25%" } : undefined,
					}
				})
			case "events":
				return (content.events ?? []).map((event, index) => {
					const src = event.name ? imageUrl(`${event.image || `event_${snakeCase(event.name)}`}.webp`) : undefined
					return {
						key: key(index, event.name),
						label: event.name || "New event",
						banner: src ? { src, themeColor: event.themeColor } : undefined,
					}
				})
			case "btr":
				// The calendar's BTR artwork and colour (EventCalendar's .btr).
				return (content.btr ?? []).map((name, index) => ({
					key: key(index, name),
					label: name || "New circle",
					banner: { src: "/events/btr.webp", themeColor: "#008cd8" },
				}))
		}
	}
	const order = orderItems()

	// From the mini calendar: the events' new order, as old indices.
	const reorder = (order: number[]) =>
		update((draft) => {
			if (draft.events) draft.events = order.map((index) => draft.events![index])
		})

	const moveEntry = (from: number, to: number) =>
		update((draft) => {
			if (tab === "patch") return
			const list = draft[tab] as unknown[] | undefined
			if (!list) return
			const [entry] = list.splice(from, 1)
			list.splice(to, 0, entry)
		})

	return (
		<main className={`page ${styles.page}`}>
			<NamedColorList />
			<div className={`metallic-panel ${styles.toolbar}`}>
				<nav role="tablist" aria-label="Sections" className={`inset-control ${styles.tabs}`}>
					{SECTIONS.map(({ id, label }) => (
						<button
							key={id}
							ref={(el) => {
								tabRefs.current[id] = el
							}}
							type="button"
							role="tab"
							id={`content-tool-tab-${id}`}
							aria-selected={tab === id}
							aria-controls="content-tool-section"
							tabIndex={tab === id ? 0 : -1}
							className={`${styles.tab} ${sectionErrors(id) > 0 ? styles.hasErrors : ""}`}
							onClick={() => setTab(id)}
							onKeyDown={onTabKeyDown}
						>
							{label}
							{sectionCount(id) !== undefined && <span className={styles.count}>{sectionCount(id)}</span>}
						</button>
					))}
				</nav>
				<span className={styles.saveGroup}>
					{message && <span className={styles.message}>{message}</span>}
					{errors.length > 0 && (
						<span className={styles.errorCount}>
							{errors.length} error{errors.length === 1 ? "" : "s"}
						</span>
					)}
					<label className={styles.inline}>
						<span className={styles.fieldLabel}>Version</span>
						<select
							className={`inset-control ${styles.input}`}
							value={newVersion === null ? content.version : NEW_VERSION}
							disabled={isPending}
							onChange={(e) =>
								e.target.value === NEW_VERSION ? setNewVersion(nextVersion(versions)) : openVersion(e.target.value)
							}
						>
							{versions.map((version) => (
								<option key={version} value={version}>
									{version}
								</option>
							))}
							<option value={NEW_VERSION}>New version…</option>
						</select>
					</label>
					{newVersion !== null && (
						<form
							className={styles.inline}
							onSubmit={(e) => {
								e.preventDefault()
								if (VERSION_PATTERN.test(newVersion)) openVersion(newVersion)
							}}
						>
							<input
								className={`inset-control ${styles.input} ${styles.short}`}
								value={newVersion}
								autoFocus
								onChange={(e) => setNewVersion(e.target.value)}
							/>
							<button type="submit" className="pill-button" disabled={!VERSION_PATTERN.test(newVersion)}>
								Start
							</button>
						</form>
					)}
					<button
						type="button"
						className={`pill-button ${isDirty ? styles.primary : ""}`}
						style={buttonIcon("check")}
						data-icon
						disabled={isPending || !hasVersion || newVersion !== null || !isDirty}
						onClick={save}
						title="Ctrl+S"
					>
						{isDirty ? "Save content.json" : "Saved"}
					</button>
				</span>
			</div>

			<div className={styles.layout}>
				<div
					key={loadKey}
					id="content-tool-section"
					role="tabpanel"
					aria-labelledby={`content-tool-tab-${tab}`}
					className={styles.form}
				>
					{SECTIONS.filter(({ id }) => id === tab).map(({ id, Editor }) => (
						<Editor key={id} {...sectionProps} />
					))}
				</div>

				<aside className={styles.aside}>
					{tab === "events" ? (
						<CalendarOrderPanel content={content} imageUrl={imageUrl} onReorder={reorder} />
					) : (
						order && <OrderPanel items={order} onMove={moveEntry} />
					)}
					<section className={`metallic-panel ${styles.panel}`}>
						<h2 className={pageStyles.sectionTitle}>Next step</h2>
						<span className={styles.inline}>
							<code className={styles.command}>{command}</code>
							<button
								type="button"
								className="pill-button"
								onClick={() => navigator.clipboard.writeText(command)}
							>
								Copy
							</button>
						</span>
						{errors.length > 0 && (
							<p className={styles.note}>content:add will stop on the errors below; fix them first.</p>
						)}
					</section>

					<section className={`metallic-panel ${styles.panel}`}>
						<h2 className={pageStyles.sectionTitle}>
							Checks
							<span className={styles.count}>{errors.length + warnings.length}</span>
						</h2>
						{errors.length + warnings.length === 0 && <p className={styles.note}>Nothing to fix.</p>}
						<ul className={styles.issues}>
							{errors.map((issue, index) => (
								<li key={`e${index}`} className={styles.error}>
									<b>{issue.where}</b> {issue.message}
								</li>
							))}
							{warnings.map((issue, index) => (
								<li key={`w${index}`} className={styles.warning}>
									<b>{issue.where}</b> {issue.message}
								</li>
							))}
						</ul>
					</section>

					<section className={`metallic-panel ${styles.panel}`}>
						<h2 className={pageStyles.sectionTitle}>
							Images
							<span className={styles.count}>
								{images.images.filter((image) => image.status !== "missing").length}/{images.images.length}
							</span>
						</h2>
						{!showAllImages && (
							<p className={styles.note}>
								{shownImages.length === 0
									? "Every image is in the folder or already on the site."
									: "Missing images:"}
							</p>
						)}
						<ul className={styles.images}>
							{shownImages.map((image) => (
								<li key={image.file} className={styles[image.status]} title={`→ public/${image.destination}`}>
									<span className={styles.imageStatus}>{STATUS_LABELS[image.status]}</span>
									<code>{image.file}</code>
									<span className={styles.imageLabel}>{image.label}</span>
								</li>
							))}
						</ul>
						{images.unused.length > 0 && (
							<>
								<p className={styles.note}>In the folder but not used (check the names):</p>
								<ul className={styles.images}>
									{images.unused.map((file) => (
										<li key={file} className={styles.unused}>
											<code>{file}</code>
										</li>
									))}
								</ul>
							</>
						)}
						{images.images.length > shownImages.length || showAllImages ? (
							<button
								type="button"
								className={`pill-button ${styles.panelToggle}`}
								aria-expanded={showAllImages}
								onClick={() => setShowAllImages((open) => !open)}
							>
								{showAllImages ? "Show missing only" : `Show all ${images.images.length}`}
							</button>
						) : null}
					</section>

					<section className={`metallic-panel ${styles.panel}`}>
						<h2 className={`${pageStyles.sectionTitle} ${styles.inline}`}>
							content.json
							<button type="button" className="pill-button" onClick={() => navigator.clipboard.writeText(json)}>
								Copy
							</button>
						</h2>
						<div className={`${styles.jsonWrap} ${showAllJson ? "" : styles.truncated}`}>
							<pre className={styles.json}>{json}</pre>
							{jsonLines > JSON_PREVIEW_LINES && (
								<button
									type="button"
									className={`pill-button ${styles.jsonToggle}`}
									aria-expanded={showAllJson}
									onClick={() => setShowAllJson((open) => !open)}
								>
									{showAllJson ? "Show less" : `Show all ${jsonLines} lines`}
								</button>
							)}
						</div>
					</section>
				</aside>
			</div>
		</main>
	)
}
