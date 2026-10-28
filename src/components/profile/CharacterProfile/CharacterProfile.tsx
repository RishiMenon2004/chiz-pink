import { existsSync } from "node:fs"
import path from "node:path"

import Image from "next/image"
import sharp from "sharp"
import Link from "next/link"

import type { Ability, Character } from "@/types/character"

import { characterLevelStats } from "@/data/characters"
import { placeholderAbilities } from "@/data/characters/placeholder"

import { getCharacterBannerThemeColor } from "@/helpers/bannerStatus"

import { CharacterElement } from "@/components/layout/CharacterAvatar"
import { InfoBox } from "@/components/layout/InfoBox"

import { ProfileAbilityGroup } from "../ProfileAbilityGroup"
import { ProfileBanner } from "../ProfileBanner"
import { ProfileHero } from "../ProfileHero"
import { LevelStatValue, ProfileLevelProvider } from "../ProfileLevel"
import { ProfileMaterials } from "../ProfileMaterials"

import pageStyles from "@/app/page.module.css"
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

// Fixed locale so the server and the browser format alike.
const statFormat = new Intl.NumberFormat("en-US")

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

export async function CharacterProfile({ character }: { character: Character }) {
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
		{ label: "HP", values: stats.hp.map(statFormat.format) },
		{ label: "ATK", values: stats.atk.map(statFormat.format) },
		{ label: "DEF", values: stats.def.map(statFormat.format) },
	]

	return (
		<ProfileLevelProvider>
			<main role="main" className={`page ${pageStyles.page}`}>
				<div className={styles.layout}>
					<div className={styles.heroColumn}>
						<Link href="/characters" className={`pill-button ${styles.backLink}`}>
							ALL CHARACTERS
						</Link>
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
											alt={`${character.name} (male)`}
											width={1080}
											height={1280}
											sizes="(max-width: 1000px) 100vw, 26rem"
											loading="eager"
											fetchPriority="high"
										/>
										<Image
											className={styles.artFemale}
											src={pairedArt.female}
											alt={`${character.name} (female)`}
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
									label: "Element",
									value: <span className={styles.capitalize}>{character.element}</span>,
								},
								{
									label: "Arc Type",
									value: character.hasPlaceholderArcType ? "TBD" : character.arcType,
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
									? `U-um... I don't have ${character.name}'s abilities or materials on file yet. I'll a-add them as soon as they're announced, I promise!`
									: `U-um... I only have part of ${character.name}'s kit on file so far, but the materials are confirmed, so you can start pre-farming!`}
							</InfoBox>
						)}
						<ProfileAbilityGroup
							title="ESPER ABILITIES"
							entries={[
								["Basic Attack", known(abilities.basicAttack)],
								["Skill", known(abilities.skill)],
								["Ultimate", known(abilities.ultimate)],
								["Support", known(abilities.support)],
							]}
						/>
						<ProfileAbilityGroup
							title="Passive Skills"
							entries={[
								["Passive I", known(abilities.passive1)],
								["Passive II", known(abilities.passive2)],
								["Passive III", known(abilities.passive3)],
							]}
						/>
						<ProfileAbilityGroup
							title="Life Skills"
							entries={[
								["Life Skill I", known(abilities.lifeSkill1)],
								["Life Skill II", known(abilities.lifeSkill2)],
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
