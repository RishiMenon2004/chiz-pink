"use client"

import getInventory from "@/actions/getInventory"
import Image from "next/image"
import { ChangeEvent, CSSProperties, FocusEvent, KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react"

const localeUS = (x: number) => x.toLocaleString("en-US")

export default function CurrencyBox({ id, amount, icon }: { id: string, amount: number, icon: string }) {	
	const [isEdit, setIsEdit] = useState<boolean>(false)
	const [currencyValue, setCurrencyValue] = useState<number>(amount || 0)
	const [inputWidth, setInputWidth] = useState<string>("10px")
	const inputBoxRef = useRef<HTMLInputElement>(null)
	const valueDispRef = useRef<HTMLSpanElement>(null)
	const editBtnRef = useRef<HTMLButtonElement>(null)
	const { updateInventory } = getInventory()

	const toggleEdit = () => {
		if (inputBoxRef.current) {
			changeInputWidth()
			if (!isEdit) {
				inputBoxRef.current.value = currencyValue.toString()
			} else {
				let newValue = parseInt(inputBoxRef.current.value)
				if (Number.isNaN(newValue)) { newValue = 0 }
				setCurrency(newValue)
			}
		}
		
		setIsEdit((oldState) => !oldState)
	}

	const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
		e.stopPropagation()
		if (!isEdit) toggleEdit()
	}

	const changeInputWidth = () => {
		if (valueDispRef.current) {
			setInputWidth(`calc(${valueDispRef.current.clientWidth}px + 0.5ch)`)
		}
	}

	const setCurrency = (value: number) => {
		setCurrencyValue(value)
		updateInventory({ [id]: value || 0 })
	}

	useEffect(() => { if (isEdit) inputBoxRef?.current?.focus() }, [isEdit])
	useEffect(() => { changeInputWidth() }, [currencyValue])

	const handleEdit = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget) {
			const newValue = parseInt(e.currentTarget.value.replaceAll(/\D/g, ""))
			setCurrency(newValue)
		}
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key == "Enter") {
			e.stopPropagation()
			e.currentTarget.blur()
		}
	}

	const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
		if (e.relatedTarget !== editBtnRef.current) {
			toggleEdit()
		}
	}

	const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
		e.currentTarget.setSelectionRange(999, 999)
	}

	return (<div className={`currency-box ${isEdit ? "edit" : ""}`} id={id} style={{ "--bg-image": `url('/currency/border/${id}.png')`, "--input-width": inputWidth } as CSSProperties}>
		<Image className="icon" src={icon} width={64} height={64} alt={`${id} icon`}/>
		<input name={id} ref={inputBoxRef}
			type={"text"}
			min="0"
			pattern="[0-9]*"
			inputMode="numeric"
			value={Number.isNaN(currencyValue) ? "" : currencyValue}
			style={!isEdit ? { display : "none" } : {}}
			onChange={handleEdit}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onFocus={handleFocus}
		/>
		<span ref={valueDispRef}
		onClick={handleClick}
		className="amount-display"
		style={isEdit ? {opacity : "0", position: "absolute", pointerEvents: "none"} : {}}>
			{Number.isNaN(currencyValue) ? 0 : localeUS(currencyValue)}
		</span>
		<button className="edit-btn" onClick={toggleEdit} ref={editBtnRef}/>
	</div>)
}