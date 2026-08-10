import { InstallPWAButton } from "@/components/layout"

export const ChangeLogs = {
	"1.0.0": {
		timeStamp: new Date("2026-08-10").getTime(),
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
			"<ntetag>NTE</> Up to date with <itag color='#c8eec7'>Patch 1.2</>",
			"<ntetag>NTE</> 1.2 Characters: <link href='/characters/shinku'>Shinku</> & <link href='/characters/iroi'>Iroi</>",
			"<ntetag>NTE</> 1.2 Arcs: <link href='/arcs/blushing_mirage'>Blushing Mirage</> & <link href='/arcs/the_wrong_gate'>The Wrong Gate</>",
			"<ntetag>NTE</> Added <itag color='#d22730'>Patch 1.3</> Preview",
			"<ntetag>NTE</> 1.3 Characters: <link href='/characters/zankou'>Zankou</> & <link href='/characters/linko'>Linko</>",
			"<ntetag>NTE</> 1.3 Arcs: <link href='/arcs/ravenous_blade'>Ravenous Blade</> & <link href='/arcs/voice_of_the_voyager'>Voice of The Voyager</>",
			"<tag>NEW</> Inventory & Currencies Tracker",
			"<tag>NEW</> Characters/Arcs/Hybrid Ascension Planners",
			"<tag>NEW</> Dashboard for Quick Access",
			"<tag>NEW</> Character Pixels & City Stamina Tracker",
			"<tag>NEW</> Quick claim Daily Participation Tasks rewards",
			"<tag>NEW</> Interactive Events Calendar",
			"<tag>NEW</> Activity & Events Checklist",
			"<tag>NEW</> Cloud sync w/ Google Sign-in",
			"<tag>NEW</> Third-party data import",
		],
	},
}
