import { Metadata } from "next";
import routes from "@/database/routes";
import RenderInventory from "./RenderInventory"

export const metadata: Metadata = {
  title: routes["/inventory"].head,
};

export default function Inventory() {
	return <RenderInventory/>
}