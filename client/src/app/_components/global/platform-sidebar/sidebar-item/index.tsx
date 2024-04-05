import React, { type ReactElement } from 'react';
import Link from 'next/link';

type SidebarItemProps = {
	text: string;
	href: string;
	icon: ReactElement;
};

export const SidebarItem = ({ text, href, icon }: SidebarItemProps) => {
	return (
		<div className="p-2">
			<Link className="flex items-center gap-2" href={href}>
				<span>{icon}</span>
				<span>{text}</span>
			</Link>
		</div>
	);
};
