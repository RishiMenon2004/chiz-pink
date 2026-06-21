import { Metadata } from "next";
import routes from "@/database/routes";
import PopulateInventory from "./PopulateInventory"

export const metadata: Metadata = {
  title: routes["/inventory"].head,
};

export default function Inventory() {
	return <PopulateInventory/>
}