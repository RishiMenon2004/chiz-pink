import routes from "@/database/routes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: routes["/settings"].head,
};

export default function Settings() {
	
}