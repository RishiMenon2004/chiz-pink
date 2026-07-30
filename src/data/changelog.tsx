import { InstallPWAButton } from "@/components/layout"

export const ChangeLogs = {
	"1.0.0": {
		timeStamp: new Date("2026-07-30").getTime(),
		logs: [
			"Chiz.Pink Release - Your pinkest NTE companion!",
			"Optimized for all screens, use Chiz.Pink right on your browser with end-to-end encrypted cloud sync (Read our <link url='/privacy'>Privacy Policy</> for more info).",
			<>
				{"Also available as a PWA: "}
				<InstallPWAButton key={"PWA Button"} type="link">
					{"Install as App"}
				</InstallPWAButton>
				{"."}
			</>,
			"<tag>NTE</> Up to date with <smalltag>Patch 1.2</>",
			"<tag>NEW</> Inventory & Currency Tracker",
			"<tag>NEW</> Characters/Arcs/Hybrid Ascension Planners",
			"<tag>NEW</> Character Pixels & City Stamina Tracker",
			"<tag>NEW</> Interactive Events Calendar",
			"<tag>NEW</> Third-party data import",
			"<tag>NEW</> Cloud sync w/ Google Sign-in",
		],
	},
}
