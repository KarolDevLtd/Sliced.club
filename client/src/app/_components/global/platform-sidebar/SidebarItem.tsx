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
		<Link className={`${activeLink ? ' border-r-2 border-bigred text-bigred' : ''} `} href={href}>
			<span
				className={`${activeLink ? 'bg-bigred border-bigred text-base-100' : 'bg-itemfade border-accent '} p-3 border rounded-xl text-xl `}
			>
				{icon}
			</span>
			<span className={`${activeLink ? 'text-bigred font-normal' : ''}`}>{text}</span>
		</Link>
	);
};

export default SidebarItem;
