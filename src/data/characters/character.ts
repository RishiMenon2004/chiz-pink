import { EnumItemLvls } from "../items"

export enum EnumCharacterElement {
	COSMOS = "cosmos",
	ANIMA = "anima",
	INCANTATION = "incantation",
	CHAOS = "chaos",
	PSYCHE = "psyche",
	LAKSHANA = "lakshana",
}

type CharLevelMaterialsType = {
	beetleCoin: number
	bossMaterial: number
	exp: number
	ascMaterial: {
		common: number
		uncommon: number
		rare: number
	}
}

export const characterLevelMaterials: Record<
	EnumItemLvls,
	CharLevelMaterialsType
> = {
	1: {
		beetleCoin: 0,
		bossMaterial: 0,
		exp: 0,
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	20: {
		beetleCoin: 0,
		bossMaterial: 0,
		exp: 100790,
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	21: {
		beetleCoin: 25000,
		bossMaterial: 0,
		exp: 0,
		ascMaterial: {
			common: 5,
			uncommon: 0,
			rare: 0,
		},
	},
	30: {
		beetleCoin: 0,
		bossMaterial: 0,
		exp: 212450,
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	31: {
		beetleCoin: 50000,
		bossMaterial: 2,
		exp: 0,
		ascMaterial: {
			common: 12,
			uncommon: 0,
			rare: 0,
		},
	},
	40: {
		beetleCoin: 0,
		bossMaterial: 0,
		exp: 371340,
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	41: {
		beetleCoin: 75000,
		bossMaterial: 8,
		exp: 0,
		ascMaterial: {
			common: 0,
			uncommon: 6,
			rare: 0,
		},
	},
	50: {
		beetleCoin: 0,
		bossMaterial: 0,
		exp: 604740,
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	51: {
		beetleCoin: 100000,
		bossMaterial: 16,
		exp: 0,
		ascMaterial: {
			common: 0,
			uncommon: 12,
			rare: 0,
		},
	},
	60: {
		beetleCoin: 0,
		bossMaterial: 0,
		exp: 985040,
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	61: {
		beetleCoin: 125000,
		bossMaterial: 24,
		exp: 0,
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 6,
		},
	},
	70: {
		beetleCoin: 0,
		bossMaterial: 0,
		exp: 1604650,
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	71: {
		beetleCoin: 150000,
		bossMaterial: 36,
		exp: 0,
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 9,
		},
	},
	80: {
		beetleCoin: 0,
		bossMaterial: 0,
		exp: 2613830,
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
}

type SkillMaterialsType = {
	fons: number
	dreamlessSeed: number

	beetleCoin: number
	bossMaterial: number
	ascMaterial: {
		common: number
		uncommon: number
		rare: number
	}
	talentMaterial: {
		common: number
		uncommon: number
		rare: number
	}
	talentBossMaterial: number,
}

export type SkillTypes =
	| "esper"
	| "passive1"
	| "passive2"
	| "passive3"
	| "life1"
	| "life2"

export const characterSkillLevelMaterials: Record<
	SkillTypes,
	Record<number, SkillMaterialsType>
> = {
	esper: {
		1: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 0,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
		2: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 2000,
			bossMaterial: 0,
			ascMaterial: {
				common: 2,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 2,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
		3: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 5000,
			bossMaterial: 0,
			ascMaterial: {
				common: 3,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 3,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
		4: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 10000,
			bossMaterial: 0,
			ascMaterial: {
				common: 5,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 5,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
		5: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 20000,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 2,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 2,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
		6: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 40000,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 3,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 3,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
		7: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 60000,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 5,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 5,
				rare: 0,
			},
			talentBossMaterial: 1,
		},
		8: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 80000,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 3,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 3,
			},
			talentBossMaterial: 1,
		},
		9: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 100000,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 5,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 5,
			},
			talentBossMaterial: 2,
		},
		10: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 120000,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 8,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 8,
			},
			talentBossMaterial: 4,
		},
	},
	passive1: {
		1: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 30000,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 3,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 1,
		},
	},
	passive2: {
		1: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 40000,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 1,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 2,
		},
	},
	passive3: {
		1: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 0,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
	},
	life1: {
		1: {
			fons: 500,
			dreamlessSeed: 2,
			beetleCoin: 0,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
		2: {
			fons: 1500,
			dreamlessSeed: 4,
			beetleCoin: 0,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
		3: {
			fons: 3600,
			dreamlessSeed: 10,
			beetleCoin: 0,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
		4: {
			fons: 6400,
			dreamlessSeed: 16,
			beetleCoin: 0,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
		5: {
			fons: 10000,
			dreamlessSeed: 24,
			beetleCoin: 0,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
	},
	life2: {
		0: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 0,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
		1: {
			fons: 6400,
			dreamlessSeed: 16,
			beetleCoin: 0,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
		2: {
			fons: 10000,
			dreamlessSeed: 24,
			beetleCoin: 0,
			bossMaterial: 0,
			ascMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentMaterial: {
				common: 0,
				uncommon: 0,
				rare: 0,
			},
			talentBossMaterial: 0,
		},
	},
}
