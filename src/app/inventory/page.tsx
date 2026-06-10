import type { Metadata } from "next";
import MaterialBlock from "./MaterialBlock";
import getAllMaterials from "./materials";

export const metadata: Metadata = {
  title: "Chiz.Pink | Inventory",
  description: "Your favourite daily planner and inventory tracker :3",
};

export default function Inventory() {
	return (<>
		<div style={{padding: "1rem", gap: "1rem", display: "grid", gridTemplateColumns: "repeat(6, 1fr)", width: "100%", placeItems: "center"}}>
			{Object.values(getAllMaterials()).map((material, index) => {
				return <MaterialBlock key={index} material={material} quantity={0}/>
			})}
		</div>
	</>)
}