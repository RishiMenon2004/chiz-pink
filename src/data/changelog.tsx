import { InstallPWAButton } from "@/components/layout"

export const ChangeLogs = {
	"1.0.0": {
		timeStamp: new Date("2026-07-22").getTime(),
		logs: [
		"Chiz.Pink Release - Your pinkest NTE companion!",
		"Optimized for all screens, use Chiz.Pink right on your browser with end-to-end encrypted cloud sync (Read our <link url='/privacy'>Privacy Policy</> for more info).",
		<>Also available as a PWA: <InstallPWAButton key={"PWA Button"} type="link">Install as App</InstallPWAButton>.</>,
		"Upto date with NTE Patch 1.2.",
		"Added previews for Patch 1.3 characters and arcs.",
	]},
}
