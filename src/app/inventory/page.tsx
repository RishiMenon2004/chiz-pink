import { Metadata } from "next";
import routes from "@/database/routes";
import styles from "@/app/inventory/page.module.css"
import PopulateInventory from "./PopulateInventory"

export const metadata: Metadata = {
  title: routes["/inventory"].head,
};

export default function Inventory() {
	return (<div className={styles.page}>
		<PopulateInventory/>
	</div>)
}