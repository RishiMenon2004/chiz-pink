import { existsSync } from "node:fs"
import path from "node:path"

import Image from "next/image"
import sharp from "sharp"

import type { Ability, Character } from "@/types/character"

import { characterLevelStats } from "@/data/characters"
import { placeholderAbilities } from "@/data/characters/placeholder"

import { getCharacterBannerThemeColor } from "@/helpers/bannerStatus"
import { formatLocale, type Locale } from "@/helpers/locale"
import { getTranslator } from "@/helpers/messages"

import { CharacterElement } from "@/components/layout/CharacterAvatar"
import { InfoBox } from "@/components/layout/InfoBox"

import { ProfileAbilityGroup } from "../ProfileAbilityGroup"
import { ProfileBanner } from "../ProfileBanner"
import { ProfileHero } from "../ProfileHero"
import { LevelStatValue, ProfileLevelProvider } from "../ProfileLevel"
import { ProfileMaterials } from "../ProfileMaterials"

import { LocaleLink } from "@/components/layout"

import pageStyles from "@/app/[lang]/page.module.css"
import styles from "../profile.module.css"

function getBackgroundSrc(character: Character) {
	const src = `/characters/background/${character.id}.png`
	return existsSync(path.join(process.cwd(), "public", src)) ? src : null
}

// Characters with a selectable gender (Esper Zero) ship "<name>_f" and
// "<name>_m" art; show both when the counterpart exists.
function getArtSrcs(character: Character) {
	const src = `/characters/full/${character.imageSrc}`
	const counterpart = src.replace(/_f(\.\w+)$/, "_m$1")
	return counterpart !== src &&
		existsSync(path.join(process.cwd(), "public", counterpart))
		? { female: src, male: counterpart }
		: null
}

// Hand-picked quote colours that win over the banner/art colour.
const QUOTE_COLOR_OVERRIDES: Record<string, string> = {
	chiz: "var(--pink)", // the site's namesake
}

// Quote-mark colour: the character's banner colour if they've had a rate-up,
// else a hue taken from their background art. The art is mostly dark and
// muted, so only its hue survives - lightness is fixed and chroma boosted
// (but capped low for near-grey art, so it stays near grey).
async function getQuoteColor(character: Character, backgroundSrc: string | null) {
	const override = QUOTE_COLOR_OVERRIDES[character.id]
	if (override) return override

	const bannerColor = getCharacterBannerThemeColor(character.id)
	if (bannerColor || !backgroundSrc) return bannerColor

	try {
		const { channels } = await sharp(
			path.join(process.cwd(), "public", backgroundSrc)
		).stats()
		const [r, g, b] = channels.map((channel) => Math.round(channel.mean))
		return `oklch(from rgb(${r} ${g} ${b}) 0.65 clamp(0.03, calc(c * 2.5), 0.17) h)`
	} catch {
		return null
	}
}

export async function CharacterProfile({
	character,
	locale,
}: {
	character: Character
	locale: Locale
}) {
	const t = await getTranslator(locale)
	const statFormat = new Intl.NumberFormat(formatLocale(locale, "en-US"))
	const { abilities } = character
	const backgroundSrc = getBackgroundSrc(character)
	const quoteColor = await getQuoteColor(character, backgroundSrc)
	const pairedArt = getArtSrcs(character)
	// A placeholder's abilities may be part announced: the stand-ins are hidden.
	const known = (ability: Ability | undefined) =>
		ability && Object.values(placeholderAbilities).includes(ability) ? undefined : ability

	// Base stats follow the Materials slider's level; characters the game
	// data doesn't cover yet show none.
	const stats = character.isPlaceholder ? undefined : characterLevelStats[character.id]
	const levelStats = stats && [
		{ label: t("profile.stats.hp"), values: stats.hp.map(statFormat.format) },
		{ label: t("profile.stats.atk"), values: stats.atk.map(statFormat.format) },
		{ label: t("profile.stats.def"), values: stats.def.map(statFormat.format) },
	]

	return (
		<ProfileLevelProvider>
			<main role="main" className={`page ${pageStyles.page}`}>
				<div className={styles.layout}>
					<div className={styles.heroColumn}>
						<LocaleLink href="/characters" className={`pill-button ${styles.backLink}`}>
							{t("profile.character.allCharacters")}
						</LocaleLink>
						<ProfileHero
							name={character.name}
							rarity={character.rarity}
							variant="character"
							quoteColor={quoteColor}
							art={
								pairedArt ? (
									<>
										<Image
											className={styles.artMale}
											src={pairedArt.male}
											alt={t("profile.character.artMale", { name: character.name })}
											width={1080}
											height={1280}
											sizes="(max-width: 1000px) 100vw, 26rem"
											loading="eager"
											fetchPriority="high"
										/>
										<Image
											className={styles.artFemale}
											src={pairedArt.female}
											alt={t("profile.character.artFemale", { name: character.name })}
											width={1080}
											height={1280}
											sizes="(max-width: 1000px) 100vw, 26rem"
											loading="eager"
											fetchPriority="high"
										/>
									</>
								) : (
									<Image
										src={`/characters/full/${character.imageSrc}`}
										alt={character.name}
										width={1080}
										height={1280}
										sizes="(max-width: 1000px) 100vw, 26rem"
										loading="eager"
										fetchPriority="high"
									/>
								)
							}
							background={
								backgroundSrc && (
									<Image
										src={backgroundSrc}
										alt=""
										width={1384}
										height={830}
										sizes="(max-width: 1000px) 120vw, 50rem"
										loading="eager"
									/>
								)
							}
							badge={
								<CharacterElement element={character.element} width={64} height={64} />
							}
							stats={[
								{
									label: t("profile.stats.element"),
									value: <span className={styles.capitalize}>{character.element}</span>,
								},
								{
									label: t("profile.stats.arcType"),
									value: character.hasPlaceholderArcType ? t("profile.stats.tbd") : character.arcType,
								},
								...(levelStats ?? []).map(({ label, values }) => ({
									label,
									value: <LevelStatValue values={values} />,
								})),
							]}
							description={character.description}
						/>
						<ProfileBanner characterId={character.id} />
					</div>

					<div className={styles.content}>
						{character.isPlaceholder && (
							<InfoBox sticker="peek">
								{character.hasPlaceholderMaterials
									? t("profile.character.placeholderNoMaterials", { name: character.name })
									: t("profile.character.placeholderPartial", { name: character.name })}
							</InfoBox>
						)}
						<ProfileAbilityGroup
							title={t("profile.abilities.esper")}
							entries={[
								[t("profile.abilities.basicAttack"), known(abilities.basicAttack)],
								[t("profile.abilities.skill"), known(abilities.skill)],
								[t("profile.abilities.ultimate"), known(abilities.ultimate)],
								[t("profile.abilities.support"), known(abilities.support)],
							]}
						/>
						<ProfileAbilityGroup
							title={t("profile.abilities.passiveSkills")}
							entries={[
								[t("profile.abilities.passive1"), known(abilities.passive1)],
								[t("profile.abilities.passive2"), known(abilities.passive2)],
								[t("profile.abilities.passive3"), known(abilities.passive3)],
							]}
						/>
						<ProfileAbilityGroup
							title={t("profile.abilities.lifeSkills")}
							entries={[
								[t("profile.abilities.lifeSkill1"), known(abilities.lifeSkill1)],
								[t("profile.abilities.lifeSkill2"), known(abilities.lifeSkill2)],
							]}
						/>
						{!character.hasPlaceholderMaterials && (
							<ProfileMaterials
								kind="character"
								id={character.id}
								levelStats={levelStats}
							/>
						)}
					</div>
				</div>
			</main>
		</ProfileLevelProvider>
	)
}
