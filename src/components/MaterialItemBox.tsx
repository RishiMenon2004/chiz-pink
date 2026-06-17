"use client"

import { Material } from "@/database/materials";
import Image from "next/image";
import styles from "@/components/material.module.css";
import { ChangeEvent, FocusEvent, useRef, useState } from "react";
import getInventory from "@/actions/getInventory";

const getRarityStyle = (material: Material) => { switch (material.rarity) { 
	default: return styles.common; 
	case 3: return styles.uncommon;
	case 4: return styles.rare;
	case 5: return styles.epic
}}

type MaterialItemBoxProps = {
	material: Material,
	quantity: number,
	requiredQuantity?: number
}

export default function MaterialItemBox({ material, quantity, requiredQuantity }: MaterialItemBoxProps) {
	const [itemQuantity, setItemQuantity] = useState<number>(quantity || 0)
	const countRef = useRef<HTMLInputElement>(null)
	const {updateInventory} = getInventory()


	const setAmount = (value: number) => {
		setItemQuantity(value)
		updateInventory({ [material.id]: value || 0 })
	}
	
	const handleCount = (increment: boolean) => {
		if (countRef.current) {
			const prevAmount = parseInt(countRef.current.value)
			const newAmount = Math.max(increment ? prevAmount + 1 : prevAmount - 1, 0)
			setAmount(newAmount)
		}
	}

	const handleEdit = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget) {
			const newValue = parseInt(e.currentTarget.value.replaceAll(/\D/g, ""))
			setAmount(newValue)
		}
	}

	const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
		if (e.currentTarget) {
			e.currentTarget.setSelectionRange(0, 999)
		}
	}
	
	return (<div className={`${styles.materialBox} ${getRarityStyle(material)}`}>
		<div className={`${styles.iconContainer}`}><Image src={`/materials${material.src}.png`} width={128} height={128} alt=""/></div>
		<span className={`${styles.label}`}>{material.name}</span>
		<span className={`${styles.amount}`}>
			<span className={`${styles.countBtn} ${styles.minus}`} onClick={() => handleCount(false)}/>
			<span className={`${styles.countContainer}`}><input ref={countRef} value={itemQuantity} onChange={handleEdit} onFocus={handleFocus}/>{requiredQuantity && <span>/{requiredQuantity}</span>}</span>
			<span className={`${styles.countBtn} ${styles.plus}`} onClick={() => handleCount(true)}/>
		</span>
	</div>)
}