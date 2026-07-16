import { EnumItemLvls } from "../items"

export enum EnumCharacterElement {
	Cosmos = "Cosmos",
	Anima = "Anima",
	Incantation = "Incantation",
	Chaos = "Chaos",
	Psyche = "Psyche",
	Lakshana = "Lakshana",
}

type CharLevelMaterialsType = {
	beetleCoin: number
	bossMaterial: number
	exp: {
		common: number
		uncommon: number
		rare: number
	}
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
		exp: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	20: {
		beetleCoin: 22250,
		bossMaterial: 0,
		exp: {
			common: 4,
			uncommon: 1,
			rare: 4,
		},
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	21: {
		beetleCoin: 25000,
		bossMaterial: 0,
		exp: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial: {
			common: 5,
			uncommon: 0,
			rare: 0,
		},
	},
	30: {
		beetleCoin: 49500,
		bossMaterial: 0,
		exp: {
			common: 4,
			uncommon: 3,
			rare: 9,
		},
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	31: {
		beetleCoin: 50000,
		bossMaterial: 2,
		exp: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial: {
			common: 12,
			uncommon: 0,
			rare: 0,
		},
	},
	40: {
		beetleCoin: 88250,
		bossMaterial: 0,
		exp: {
			common: 4,
			uncommon: 2,
			rare: 17,
		},
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	41: {
		beetleCoin: 75000,
		bossMaterial: 8,
		exp: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial: {
			common: 0,
			uncommon: 6,
			rare: 0,
		},
	},
	50: {
		beetleCoin: 144000,
		bossMaterial: 0,
		exp: {
			common: 1,
			uncommon: 2,
			rare: 28,
		},
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	51: {
		beetleCoin: 100000,
		bossMaterial: 16,
		exp: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial: {
			common: 0,
			uncommon: 12,
			rare: 0,
		},
	},
	60: {
		beetleCoin: 234000,
		bossMaterial: 0,
		exp: {
			common: 4,
			uncommon: 3,
			rare: 46,
		},
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	61: {
		beetleCoin: 125000,
		bossMaterial: 24,
		exp: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 6,
		},
	},
	70: {
		beetleCoin: 382250,
		bossMaterial: 0,
		exp: {
			common: 4,
			uncommon: 1,
			rare: 76,
		},
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
	71: {
		beetleCoin: 150000,
		bossMaterial: 35,
		exp: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 9,
		},
	},
	80: {
		beetleCoin: 622250,
		bossMaterial: 0,
		exp: {
			common: 5,
			uncommon: 1,
			rare: 124,
		},
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 9,
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
		},
		4: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 25000,
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
		},
		5: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 30000,
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
		},
		6: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 37500,
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
		},
		7: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 120000,
			bossMaterial: 1,
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
		},
		8: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 250000,
			bossMaterial: 1,
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
		},
		9: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 450000,
			bossMaterial: 2,
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
		},
		10: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 700000,
			bossMaterial: 4,
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
		},
	},
	passive1: {
		1: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 30000,
			bossMaterial: 1,
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
		},
	},
	passive2: {
		1: {
			fons: 0,
			dreamlessSeed: 0,
			beetleCoin: 40000,
			bossMaterial: 2,
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
		},
	},
}
