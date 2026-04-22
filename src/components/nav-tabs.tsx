"use client";

import Link from "next/link";

interface NavTabsProps {
	active: "requests" | "chains";
}

const TABS: { key: NavTabsProps["active"]; label: string; href: string }[] = [
	{ key: "requests", label: "Requests", href: "/" },
	{ key: "chains", label: "Email Chains", href: "/chains" },
];

export default function NavTabs({ active }: NavTabsProps) {
	return (
		<nav className="mb-6 flex items-center gap-1 border-b border-border/60">
			{TABS.map((tab) => {
				const isActive = tab.key === active;
				return (
					<Link
						key={tab.key}
						href={tab.href}
						className={`px-3 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
							isActive
								? "border-primary text-foreground"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
					>
						{tab.label}
					</Link>
				);
			})}
		</nav>
	);
}
