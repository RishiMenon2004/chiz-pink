import { InstallPWAButton } from "@/components/layout"

export const ChangeLogs = {
	"1.0.0": {
		timeStamp: new Date("2026-09-05").getTime(),
		logs: [
			"Chiz.Pink Release - Your pinkest NTE companion!",
			"Optimized for all screens, use Chiz.Pink right on your browser with end-to-end encrypted cloud sync. (Read <link url='/privacy'>Privacy Policy</> for more info)",
			<>
				{"Also available as a PWA: "}
				<InstallPWAButton key={"PWA Button"} type="link">
					{"Install as App"}
				</InstallPWAButton>
				{"."}
			</>,
			"<ntetag>NTE</> Up to date with <itag color='#d22730'>Patch 1.3</>",
			"<ntetag>NTE</> Characters added: Zankou & Linko",
			"<ntetag>NTE</> Arcs added: Ravenous Blade & Voice of The Voyager",
			"<tag>NEW</> Inventory & Currencies Tracker",
			"<tag>NEW</> Characters/Arcs/Hybrid Ascension Planners",
			"<tag>NEW</> Dashboard for Quick Access",
			"<tag>NEW</> Character Pixels & City Stamina Tracker",
			"<tag>NEW</> Quick claim Daily Participation Tasks rewards",
			"<tag>NEW</> Interactive Events Calendar",
			"<tag>NEW</> Activity & Events Checklist",
			"<tag>NEW</> Wish & Pity Tracker w/ stats",
			"<tag>NEW</> Cloud sync w/ Google Sign-in",
			"<tag>NEW</> Third-party data import",
		],
	},
}
