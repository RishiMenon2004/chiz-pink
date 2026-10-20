// npm run content:import -- [--only arcs|characters] [--ref <commit>]
//                            [--from <export dir>] [--write]
//                            [--update <id>,<id>]
// npm run content:import -- --images content-intake/<version>
//
// Reads arc and character data straight from the game's tables and compares
// it with the site's. By default the tables come from the
// Waifus-Grace/NTE_Assets repo at a pinned commit (cached in
// .cache/nte-assets/<commit>); --ref picks another commit, and --from reads a
// local FModel export instead (the folder that holds DataTable/ and
// Localization/, i.e. Exports/HT/Content).
//
// Without --write it only reports. With --write it regenerates the level
// stats files, fills in placeholder arcs and characters, and adds arcs the
// site doesn't have yet. Arcs and characters that already have real data are
// only rewritten when named with --update (which implies --write): an arc's
// whole entry, a character's abilities. Other differences are listed to fix
// by hand.
//
// --images instead fetches the art for the characters and arcs in an intake
// folder's content.json into that folder (see content-import/images.ts);
// content:add then copies it into public/.

import { importArcs } from "./content-import/arcs"
import { importCharacters } from "./content-import/characters"
import { importImages } from "./content-import/images"
import { imagesFolder, only, updateIds } from "./content-import/source"

if (imagesFolder) {
	await importImages(imagesFolder)
} else {
	if (!only || only === "arcs") await importArcs()
	if (!only || only === "characters") await importCharacters()

	for (const id of updateIds) console.log(`\n--update: no arc or character "${id}" in the game data`)
}
