import { Material } from "./materials";

const bgColor = (material: Material) => { switch (material.rarity) { 
	default: return "lightGreen"; 
	case 3: return "skyBlue";
	case 4: return "magenta";
	case 5: return "gold"
}}

export default function MaterialBlock({ material, quantity, requiredQuantity }: { material: Material; quantity: number; requiredQuantity?: number }) {
	return <div style={{width: "100%", height: "100%", backgroundColor: bgColor(material), borderRadius: "1rem", border: "2px black solid", display: "grid", placeItems: "center"}}>
		<div>{material.name}</div>
		<div>{quantity}{requiredQuantity !== undefined && <span>/{requiredQuantity}</span>}</div>
	</div>
}