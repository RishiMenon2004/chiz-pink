import routes from "@/database/routes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: routes["/checklist"].head,
};

export default function Checklist() {
	
}