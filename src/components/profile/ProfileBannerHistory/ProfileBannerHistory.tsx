"use client"

import { CSSProperties } from "react"

import { patchTimings } from "@/data/activities/events"

import { useNow } from "@/hooks"

import { getCharacterBannerRuns } from "@/helpers/bannerStatus"
import { formatLocale } from "@/helpers/locale"

import { useLocale, useT } from "@/contexts"

import pageStyles from "@/app/[lang]/page.module.css"
import styles from "../profile.module.css"

const DAY_MS = 24 * 60 * 60 * 1000

const patches = Object.entries(patchTimings).map(([key, timing]) => ({
	version: key.replace(/^version/, "").replace("_", "."),
	start: timing.phase1Start(),
	phase2Start: timing.phase2Start(),
	end: timing.phase2End(),
}))

// Index of the patch a moment falls in (the gap after a patch counts as
// that patch), or -1 before the first.
function patchIndexAt(time: number) {
	return patches.findLastIndex((patch) => patch.start <= time)
}

// A moment as a position on the axis, in versions: 2.5 is halfway through
// the third patch. Every patch gets the same width, like the version ticks.
function axisPosition(time: number) {
	const index = patchIndexAt(time)
	if (index === -1) return 0
	const { start, end } = patches[index]
	return index + Math.min(1, (time - start) / (end - start))
}

// A headline count of days since the character's last banner, then a
// timeline from 1.0 to today: a dim bar from their debut on, solid where a
// run was live. Each rerun is labelled with the wait before it, counted from
// the end of the previous run. Needs the clock, so it renders nothing until
// useNow() resolves.
// themeColor matches the profile's quote marks.
export function ProfileBannerHistory({
	characterId,
	themeColor,
}: {
	characterId: string
	themeColor: string | null
}) {
	const t = useT()
	const locale = useLocale()
	const now = useNow()

	if (now === null) return null

	const runs = getCharacterBannerRuns(characterId).filter(({ start }) => start <= now)
	const latest = runs.at(-1)
	if (!latest) return null

	const live = now < latest.end
	const currentIndex = patchIndexAt(now)
	// The axis runs from 1.0 to the end of the current version. Runs are drawn
	// in full (a live one to the end of its phase), over a dim bar from the
	// debut to the axis end.
	const units = currentIndex + 1
	const axisEnd = patches[currentIndex].end
	const at = (time: number) => `${(axisPosition(time) / units) * 100}%`
	const span = (from: number, to: number) =>
		({
			left: at(from),
			width: `${((axisPosition(to) - axisPosition(from)) / units) * 100}%`,
		}) as CSSProperties

	const dates = new Intl.DateTimeFormat(formatLocale(locale), {
		day: "numeric",
		month: "short",
		year: "numeric",
	})
	// Wait from the end of a run to a moment, in whole versions and days.
	const wait = (previous: { end: number }, to: number) => {
		const versions = Math.floor(axisPosition(to) - axisPosition(previous.end) + 1e-9)
		const days = Math.max(0, Math.floor((to - previous.end) / DAY_MS))
		return {
			// Same patch: "0 Versions" says nothing, so only the days show.
			versions: versions > 0 ? t("profile.bannerHistory.versions", { count: versions }) : null,
			days: t("profile.bannerHistory.days", { count: days }),
		}
	}
	const daysSinceEnd = Math.floor((now - latest.end) / DAY_MS)
	const numbers = new Intl.NumberFormat(formatLocale(locale))

	return (
		<section
			className={`metallic-panel ${pageStyles.section}`}
			style={
				{
					"--theme-color": themeColor ?? "var(--pink)",
				} as CSSProperties
			}
		>
			<div className={pageStyles.sectionTitleRow}>
				<h2 className={pageStyles.sectionTitle}>{t("profile.bannerHistory.title")}</h2>
			</div>
			<div className={`inset-control ${styles.panelBody} ${styles.bannerHistory}`}>
				<div className={styles.bannerCounter}>
					{live ? (
						<span className={styles.bannerCounterValue}>{t("profile.bannerHistory.live")}</span>
					) : (
						<>
							<span className={styles.bannerCounterValue}>{numbers.format(daysSinceEnd)}</span>
							<span className={styles.bannerCounterLabel}>
								{t("profile.bannerHistory.daysSince", { count: daysSinceEnd })}
							</span>
						</>
					)}
				</div>
				<div className={styles.bannerTimelineScroll}>
					<div className={styles.bannerTimeline} style={{ "--units": units } as CSSProperties}>
						<ol className={styles.bannerAxis} aria-hidden="true">
							{patches.slice(0, currentIndex + 1).map(({ version }, index) => (
								<li key={version} style={{ left: `${(index / units) * 100}%` }}>
									{version}
								</li>
							))}
						</ol>

						{/* One dim bar from the debut to today, with the runs drawn over it. */}
						{/* Where each version's second phase starts, up to the axis end. */}
						<div className={styles.bannerPhaseLines} aria-hidden="true">
							{patches
								.slice(0, currentIndex + 1)
								.filter(({ phase2Start }) => axisPosition(phase2Start) < units)
								.map(({ version, phase2Start }) => (
									<span key={version} style={{ left: at(phase2Start) }} />
								))}
						</div>

						<div className={styles.bannerTrack}>
							<span className={styles.bannerTrackGap} style={span(runs[0].start, axisEnd)} />
							{runs.map((run) => (
								<span
									key={run.start}
									className={styles.bannerTrackRun}
									style={span(run.start, run.end)}
								/>
							))}
						</div>

						<ol className={styles.bannerMarkers}>
							{runs.map((run, index) => {
								const previous = runs[index - 1]
								const gap = previous && wait(previous, run.start)
								const label =
									run.version && run.phase
										? t("profile.bannerHistory.phase", {
												version: run.version,
												phase: run.phase,
											})
										: run.event.name
								return (
									<li
										key={run.start}
										className={styles.bannerMarker}
										style={{ left: at(run.start) }}
										title={`${label} · ${dates.formatRange(run.start, run.end)}`}
									>
										<span className={styles.bannerMarkerLabel}>
											{gap ? (
												<>
													{gap.versions && <span>{gap.versions}</span>}
													<span>{gap.days}</span>
												</>
											) : (
												<>
													<span>{t("profile.bannerHistory.debut")}</span>
													<span>{run.version ? `v${run.version}` : dates.format(run.start)}</span>
												</>
											)}
										</span>
									</li>
								)
							})}
						</ol>
					</div>
				</div>
			</div>
		</section>
	)
}
