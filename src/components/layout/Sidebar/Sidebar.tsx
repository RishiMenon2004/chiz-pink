"use client"

import { NavButton } from "@/components/layout/NavButton"

import styles from "./sidebar.module.css"

export function Sidebar() {
	return (
		<div className={styles.sidebar}>
			<nav role="navigation">
				<NavButton href="" icon="home" />
				<NavButton href="checklist" icon="checklist" />
				<NavButton href="planner" icon="planner" />
				<NavButton href="pulls" icon="pulls" />
				<NavButton href="inventory" icon="inventory" />
				<NavButton href="settings" icon="settings" />
			</nav>

			<svg xmlns="http://www.w3.org/2000/svg" className={styles.fender}>
				<path d="M68.1396 0C71.3754 0 74.293 1.94905 75.5312 4.93848L88.7852 36.9385C90.9669 42.2059 87.0959 47.9999 81.3945 48H0V0H68.1396Z" />
			</svg>

			<NavButton href="settings" icon="settings" />
		</div>
	)
}
