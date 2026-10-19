// npm run content:import -- [--only arcs|characters] [--ref <commit>]
//                            [--from <export dir>] [--write]
//                            [--update <arc id>,<arc id>]
//
// Reads arc and character data straight from the game's tables and compares
// it with the site's. By default the tables come from the
// Waifus-Grace/NTE_Assets repo at a pinned commit (cached in
// .cache/nte-assets/<commit>); --ref picks another commit, and --from reads a
// local FModel export instead (the folder that holds DataTable/ and
// Localization/).
//
// Without --write it only reports. With --write it regenerates the level
// stats files, fills in placeholder arcs and adds arcs the site doesn't have
// yet. Arcs that already have real data are only rewritten when named with
// --update (which implies --write); character files are never rewritten.
// Differences are listed to fix by hand.
//
// Images aren't touched; new arcs get placeholder.webp.

import { importArcs } from "./content-import/arcs"
import { importCharacters } from "./content-import/characters"
import { only, updateIds } from "./content-import/source"

if (!only || only === "arcs") await importArcs()
if (!only || only === "characters") await importCharacters()

for (const id of updateIds) console.log(`\n--update: no arc "${id}" in the game data`)
