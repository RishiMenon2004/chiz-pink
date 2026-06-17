import routes from "@/database/routes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: routes["/characters"].head,
};

export default function Characters() {
	
}