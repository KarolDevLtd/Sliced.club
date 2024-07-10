import React, { type ReactElement } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

type SidebarItemProps = {
	text: string;
	href: string;
	icon: ReactElement;
};

const SidebarItem = ({ text, href, icon }: SidebarItemProps) => {
	const router = useRouter();

	const activeLink = router.pathname.split('/')[1] === href.split('/')[1];

	return (
		<Link className={`${activeLink ? 'active border-r-2 border-bigred' : ''} `} href={href}>
			<span className="p-3 border border-accent rounded-xl bg-itemfade text-l">{icon}</span>
			<span>{text}</span>
		</Link>
	);
};

export default SidebarItem;
