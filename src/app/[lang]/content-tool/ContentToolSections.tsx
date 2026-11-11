"use client"

import { useState } from "react"

import type { ContentArc, ContentEventType, ContentFile, ContentToolOptions } from "@/types/content"

import { calendarDates, calendarDays, snakeCase } from "@/helpers/contentJson"

import {
	BannerPreview,
	buttonIcon,
	ColorInput,
	DateInput,
	DateRefInput,
	Field,
	IconButton,
	ImageThumbs,
	OffsetInput,
	RowHeader,
	Section,
	SelectInput,
	SelectOption,
	TextInput,
} from "./ContentToolFields"

import styles from "./page.module.css"

export type ContentUpdate = (change: (draft: ContentFile) => void) => void

type SectionProps = {
	content: ContentFile
	update: ContentUpdate
	options: ContentToolOptions
	// Preview URL for an intake file name, if the image exists anywhere.
	imageUrl: (file: string) => string | undefined
}

const EVENT_TYPES: ContentEventType[] = ["Event", "Mystery Box", "Circle Gift"]

const toOptions = (values: string[]): SelectOption[] => values.map((value) => ({ value, label: value }))
const idOptions = (list: { id: string; name: string }[], group?: string): SelectOption[] =>
	list.map(({ id, name }) => ({ value: id, label: name || id, group }))

function move<T>(list: T[], index: number, by: -1 | 1) {
	const [item] = list.splice(index, 1)
	list.splice(index + by, 0, item)
}

// The id follows the name until it's edited by hand.
const characterId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "")

// ---------- Patch ----------

export function PatchSection({ content, update, imageUrl }: SectionProps) {
	const { patch } = content

	if (!patch) {
		return (
			<Section
				id="patch"
				title="Version"
				onAdd={() => update((draft) => void (draft.patch = { phase1Start: "", phase2Start: "", end: "" }))}
				addLabel="Phase dates"
			>
				<p className={styles.note}>
					Left out: content:add keeps the phase dates already in patches.ts and won&apos;t rewrite the events file.
				</p>
			</Section>
		)
	}

	const set = (change: Partial<typeof patch>) => update((draft) => void Object.assign(draft.patch!, change))

	return (
		<Section
			id="patch"
			title="Version"
			action={
				<button
					type="button"
					className={`pill-button ${styles.headerButton}`}
					data-variant="danger"
					data-icon
					style={buttonIcon("delete")}
					onClick={() => update((draft) => void delete draft.patch)}
				>
					Remove phase dates
				</button>
			}
		>
			<div className={styles.grid}>
				<Field label="Name" wide>
					<TextInput
						value={patch.name}
						placeholder={`Version ${content.version}`}
						onChange={(name) => set({ name })}
					/>
				</Field>
				<Field label="Phase 1 start" span>
					<DateInput value={patch.phase1Start} onChange={(phase1Start) => set({ phase1Start })} />
				</Field>
				<Field label="Phase 2 start" span>
					<DateInput value={patch.phase2Start} onChange={(phase2Start) => set({ phase2Start })} />
				</Field>
				<Field label="Version end" span>
					<DateInput value={patch.end} onChange={(end) => set({ end })} />
				</Field>
				<Field label="Theme colour">
					<ColorInput value={patch.themeColor} onChange={(themeColor) => set({ themeColor })} />
				</Field>
				<Field label="Image y offset">
					<OffsetInput value={patch.yOffset} onChange={(yOffset) => set({ yOffset })} />
				</Field>
			</div>
			<BannerPreview
				src={imageUrl(`version_${content.version}.webp`)}
				themeColor={patch.themeColor}
				yOffset={patch.yOffset}
				days={calendarDays(patch, "phase1", "end")}
				title={patch.name || `Version ${content.version}`}
				isVersion
				onOffsetChange={(yOffset) => set({ yOffset })}
			/>
		</Section>
	)
}

// ---------- Characters ----------

export function CharactersSection({ content, update, options, imageUrl }: SectionProps) {
	const characters = content.characters ?? []

	return (
		<Section
			id="characters"
			title="Characters"
			split
			count={characters.length}
			addLabel="Add character"
			onAdd={() => update((draft) => void (draft.characters = [...characters, { id: "", name: "" }]))}
		>
			<div className={`${styles.rows} ${styles.twoColumns}`}>
				{characters.map((character, index) => {
					const set = (change: Partial<typeof character>) =>
						update((draft) => void Object.assign(draft.characters![index], change))
					const setMaterial = (change: Partial<NonNullable<typeof character.materials>>) =>
						update((draft) => {
							const target = draft.characters![index]
							target.materials = { ...target.materials, ...change }
						})

					return (
						<div key={index} className={`metallic-panel ${styles.card}`}>
							<RowHeader
								title={character.name || "New character"}
								index={index}
								count={characters.length}
								onMove={(by) => update((draft) => move(draft.characters!, index, by))}
								onRemove={() => update((draft) => void draft.characters!.splice(index, 1))}
							/>
							<div className={`inset-control ${styles.cardBody}`}>
								{character.id && (
									<ImageThumbs
										images={[
											{ label: "Avatar", src: imageUrl(`avatar_${character.id}.webp`), aspect: "1" },
											{ label: "Full art", src: imageUrl(`full_${character.id}.webp`), aspect: "2160 / 2560" },
											{ label: "Background", src: imageUrl(`background_${character.id}.png`), aspect: "1384 / 830" },
										]}
									/>
								)}
								<div className={styles.grid}>
									<Field label="Name">
										<TextInput
											value={character.name}
											placeholder="Elyms"
											onChange={(name) =>
												set({
													name,
													...(!character.id || character.id === characterId(character.name)
														? { id: characterId(name) }
														: {}),
												})
											}
										/>
									</Field>
									<Field label="Id">
										<TextInput value={character.id} placeholder="elyms" onChange={(id) => set({ id })} />
									</Field>
									<Field label="Rarity">
										<SelectInput
											value={character.rarity}
											options={toOptions(["S", "A"])}
											onChange={(rarity) => set({ rarity: (rarity || undefined) as "S" | "A" | undefined })}
										/>
									</Field>
									<Field label="Element">
										<SelectInput
											value={character.element}
											options={toOptions(options.elements)}
											onChange={(element) => set({ element })}
										/>
									</Field>
									<Field label="Arc type">
										<SelectInput
											value={character.arcType}
											options={toOptions(options.arcTypes)}
											onChange={(arcType) => set({ arcType })}
										/>
									</Field>
									<Field label="Description" wide>
										<TextInput
											value={character.description}
											placeholder="Details to be announced."
											onChange={(description) => set({ description })}
										/>
									</Field>
									<Field label="Ascension set">
										<SelectInput
											value={character.materials?.ascension}
											options={toOptions(options.ascensionSets)}
											onChange={(ascension) => setMaterial({ ascension })}
										/>
									</Field>
									<Field label="Ascension boss drop">
										<SelectInput
											value={character.materials?.ascensionBoss}
											options={idOptions(options.bossDrops)}
											onChange={(ascensionBoss) => setMaterial({ ascensionBoss })}
										/>
									</Field>
									<Field label="Talent set">
										<SelectInput
											value={character.materials?.talent}
											options={toOptions(options.talentSets)}
											onChange={(talent) => setMaterial({ talent })}
										/>
									</Field>
									<Field label="Talent boss drop">
										<SelectInput
											value={character.materials?.talentBoss}
											options={idOptions(options.weeklyBossDrops)}
											onChange={(talentBoss) => setMaterial({ talentBoss })}
										/>
									</Field>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</Section>
	)
}

// ---------- Arcs ----------

type EffectValues = NonNullable<ContentArc["effect"]>["values"]

// One tier per line: "1: 16%, 8". A percentage stays a string for
// content:add to convert, a bare number becomes an integer.
function parseValues(text: string): EffectValues {
	const entries = text
		.split("\n")
		.map((line) => line.match(/^\s*([^:]+):(.*)$/))
		.filter((match) => match !== null)
		.map(([, tier, list]) => [
			tier.trim(),
			list
				.split(",")
				.map((value) => value.trim())
				.filter(Boolean)
				.map((value) => (/^-?\d+(?:\.\d+)?$/.test(value) ? Number(value) : value)),
		])
	return Object.fromEntries(entries)
}

function EffectValuesInput({ values, onChange }: { values: EffectValues; onChange: (values: EffectValues) => void }) {
	const [text, setText] = useState(() =>
		Object.entries(values ?? {})
			.map(([tier, list]) => `${tier}: ${list.join(", ")}`)
			.join("\n")
	)

	return (
		<textarea
			className={`inset-control ${styles.input}`}
			rows={3}
			value={text}
			placeholder={"1: 16%, 8\n2: 20%, 10"}
			onChange={(e) => {
				setText(e.target.value)
				onChange(parseValues(e.target.value))
			}}
		/>
	)
}

export function ArcsSection({ content, update, options, imageUrl }: SectionProps) {
	const arcs = content.arcs ?? []

	return (
		<Section
			id="arcs"
			title="Arcs"
			split
			count={arcs.length}
			addLabel="Add arc"
			onAdd={() => update((draft) => void (draft.arcs = [...arcs, { id: "", name: "" }]))}
		>
			<div className={`${styles.rows} ${styles.twoColumns}`}>
				{arcs.map((arc, index) => {
					const set = (change: Partial<ContentArc>) => update((draft) => void Object.assign(draft.arcs![index], change))
					const setEffect = (change: Partial<NonNullable<ContentArc["effect"]>>) =>
						update((draft) => {
							const target = draft.arcs![index]
							target.effect = { name: "", description: "", ...target.effect, ...change }
						})

					return (
						<div key={index} className={`metallic-panel ${styles.card}`}>
							<RowHeader
								title={arc.name || "New arc"}
								index={index}
								count={arcs.length}
								onMove={(by) => update((draft) => move(draft.arcs!, index, by))}
								onRemove={() => update((draft) => void draft.arcs!.splice(index, 1))}
							/>
							<div className={`inset-control ${styles.cardBody}`}>
								{arc.id && <ImageThumbs images={[{ label: "Art", src: imageUrl(`arc_${arc.id}.webp`), aspect: "1" }]} />}
								<div className={styles.grid}>
									<Field label="Name">
										<TextInput
											value={arc.name}
											placeholder="Echoes on Hold"
											onChange={(name) =>
												set({
													name,
													...(!arc.id || arc.id === snakeCase(arc.name) ? { id: snakeCase(name) } : {}),
												})
											}
										/>
									</Field>
									<Field label="Id">
										<TextInput value={arc.id} placeholder="echoes_on_hold" onChange={(id) => set({ id })} />
									</Field>
									<Field label="Rarity">
										<SelectInput
											value={arc.rarity}
											options={toOptions(["S", "A", "B"])}
											onChange={(rarity) => set({ rarity: (rarity || undefined) as ContentArc["rarity"] })}
										/>
									</Field>
									<Field label="Type">
										<SelectInput
											value={arc.type}
											options={toOptions(options.arcTypes)}
											onChange={(type) => set({ type })}
										/>
									</Field>
									<Field label="Description" wide>
										<TextInput value={arc.description} multiline onChange={(description) => set({ description })} />
									</Field>
								</div>
								<details className={styles.details} open={Boolean(arc.effect?.name || arc.effect?.description)}>
									<summary>Effect (usually filled by content:import)</summary>
									<div className={styles.grid}>
										<Field label="Effect name">
											<TextInput
												value={arc.effect?.name}
												placeholder="Starfall Vow"
												onChange={(name) => setEffect({ name })}
											/>
										</Field>
										<Field label="Effect values, one tier per line">
											<EffectValuesInput
												key={arc.id}
												values={arc.effect?.values}
												onChange={(values) => setEffect({ values })}
											/>
										</Field>
										<Field label="Effect description" wide>
											<TextInput
												value={arc.effect?.description}
												multiline
												placeholder="ATK +{0}, … with <dn> tags as in arcList.ts"
												onChange={(description) => setEffect({ description })}
											/>
										</Field>
									</div>
								</details>
							</div>
						</div>
					)
				})}
			</div>
		</Section>
	)
}

// ---------- Banners ----------

export function BannersSection({ content, update, options, imageUrl }: SectionProps) {
	const banners = content.banners ?? []

	const newCharacters = (content.characters ?? []).filter((character) => character.id)
	const characterOptions = [
		...idOptions(newCharacters, "This version"),
		...idOptions(options.characters.filter((character) => !newCharacters.some(({ id }) => id === character.id)), "On the site"),
	]
	const newArcs = (content.arcs ?? []).filter((arc) => arc.id)
	const arcOptions = [
		...idOptions(newArcs, "This version"),
		...idOptions(options.arcs.filter((arc) => !newArcs.some(({ id }) => id === arc.id)), "On the site"),
	]

	return (
		<Section
			id="banners"
			title="Banners"
			split
			count={banners.length}
			addLabel="Add banner"
			onAdd={() => update((draft) => void (draft.banners = [...banners, { character: "", phase: 1 }]))}
		>
			<div className={styles.rows}>
				{banners.map((banner, index) => {
					const set = (change: Partial<typeof banner>) =>
						update((draft) => void Object.assign(draft.banners![index], change))
					const setArcBanner = (change: Partial<NonNullable<typeof banner.arcBanner>>) =>
						update((draft) => {
							const target = draft.banners![index]
							target.arcBanner = { arc: "", name: "", ...target.arcBanner, ...change }
						})
					const bannerRange = (banner.phase === 2 ? ["phase2", "end"] : ["phase1", "phase1"]) as [string, string]
				const characterName =
						characterOptions.find((option) => option.value === banner.character)?.label ??
						banner.character

					return (
						<div key={index} className={`metallic-panel ${styles.card}`}>
							<RowHeader
								title={banner.name || (banner.character ? `Phase ${banner.phase}: ${characterName}` : "New banner")}
								index={index}
								count={banners.length}
								onMove={(by) => update((draft) => move(draft.banners!, index, by))}
								onRemove={() => update((draft) => void draft.banners!.splice(index, 1))}
							/>
							<div className={`inset-control ${styles.cardBody}`}>
								<div className={styles.grid}>
									<Field label="Character">
										<SelectInput
											value={banner.character}
											options={characterOptions}
											onChange={(character) => set({ character })}
										/>
									</Field>
									<Field label="Phase">
										<SelectInput
											value={String(banner.phase)}
											options={[
												{ value: "1", label: "Phase 1" },
												{ value: "2", label: "Phase 2" },
											]}
											onChange={(phase) => set({ phase: phase === "2" ? 2 : 1 })}
										/>
									</Field>
									<Field label="Banner name" wide>
										<TextInput
											value={banner.name}
											placeholder={`Phase ${banner.phase}: ${characterName || "…"}`}
											onChange={(name) => set({ name })}
										/>
									</Field>
									<Field label="Theme colour">
										<ColorInput value={banner.themeColor} onChange={(themeColor) => set({ themeColor })} />
									</Field>
									<Field label="Image y offset">
										<OffsetInput value={banner.yOffset} fallback="25%" onChange={(yOffset) => set({ yOffset })} />
									</Field>
									<Field label="Arc Banner">
										<TextInput
											value={banner.arcBanner?.name}
											placeholder="Echo Special"
											onChange={(name) => setArcBanner({ name })}
										/>
									</Field>
									<Field label="Arc">
										<SelectInput
											value={banner.arcBanner?.arc}
											options={arcOptions}
											empty="No arc banner"
											onChange={(arc) => setArcBanner({ arc })}
										/>
									</Field>
								</div>
								<BannerPreview
									src={banner.character ? imageUrl(`gacha_${banner.character}.webp`) : undefined}
									themeColor={banner.themeColor}
									yOffset={banner.yOffset}
									fallback="25%"
									days={calendarDays(content.patch, ...bannerRange)}
									title={banner.name || `Phase ${banner.phase}: ${characterName || "…"}`}
									dates={calendarDates(content.patch, ...bannerRange)}
									onOffsetChange={(yOffset) => set({ yOffset })}
								/>
							</div>
						</div>
					)
				})}
			</div>
		</Section>
	)
}

// ---------- Events ----------

export function EventsSection({ content, update, imageUrl }: SectionProps) {
	const events = content.events ?? []

	return (
		<Section
			id="events"
			title="Events"
			split
			count={events.length}
			addLabel="Add event"
			onAdd={() =>
				update(
					(draft) => void (draft.events = [...events, { name: "", type: "Event", start: "phase1", end: "end" }])
				)
			}
		>
			<div className={styles.rows}>
				{events.map((event, index) => {
					const set = (change: Partial<typeof event>) =>
						update((draft) => void Object.assign(draft.events![index], change))
					const imageName = event.image || `event_${snakeCase(event.name)}`
	
					return (
						<div key={index} className={`metallic-panel ${styles.card}`}>
							<RowHeader
								title={event.name || "New event"}
								index={index}
								count={events.length}
								onMove={(by) => update((draft) => move(draft.events!, index, by))}
								onRemove={() => update((draft) => void draft.events!.splice(index, 1))}
							/>
							<div className={`inset-control ${styles.cardBody}`}>
								<div className={styles.grid}>
									<Field label="Name" wide>
										<TextInput value={event.name} placeholder="City Logistics" onChange={(name) => set({ name })} />
									</Field>
									<Field label="Type">
										<SelectInput
											value={event.type}
											options={toOptions(EVENT_TYPES)}
											empty="Event"
											onChange={(type) => set({ type: (type || "Event") as ContentEventType })}
										/>
									</Field>
									<Field label="Start" span={!["phase1", "phase2"].includes(event.start)}>
										<DateRefInput value={event.start} onChange={(start) => set({ start })} />
									</Field>
									<Field label="End" span={!["phase1", "phase2", "end"].includes(event.end)}>
										<DateRefInput value={event.end} allowEnd onChange={(end) => set({ end })} />
									</Field>
									<Field label="Theme colour">
										<ColorInput value={event.themeColor} onChange={(themeColor) => set({ themeColor })} />
									</Field>
									</div>
								<BannerPreview
									src={event.name || event.image ? imageUrl(`${imageName}.webp`) : undefined}
									themeColor={event.themeColor}
									days={calendarDays(content.patch, event.start, event.end)}
									title={event.name}
									dates={calendarDates(content.patch, event.start, event.end)}
								/>
							</div>
						</div>
					)
				})}
			</div>
		</Section>
	)
}

// ---------- BTR ----------

export function BtrSection({ content, update }: SectionProps) {
	const circles = content.btr ?? []

	return (
		<Section
			id="btr"
			title="BTR Circles"
			count={circles.length}
			addLabel="Circle"
			onAdd={() => update((draft) => void (draft.btr = [...circles, ""]))}
		>
			<div className={`${styles.rows} ${styles.twoColumns}`}>
				{circles.map((name, index) => (
					<div key={index} className={styles.inline}>
						<TextInput
							value={name}
							placeholder="Glinting Circle"
							onChange={(value) => update((draft) => void (draft.btr![index] = value))}
						/>
						<IconButton
							icon="delete"
							label="Remove"
							danger
							onClick={() => update((draft) => void draft.btr!.splice(index, 1))}
						/>
					</div>
				))}
			</div>
		</Section>
	)
}
