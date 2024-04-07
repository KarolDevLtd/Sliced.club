import React, { type ReactElement } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

type SidebarItemProps = {
	text: string;
	href: string;
	icon: ReactElement;
};

export const SidebarItem = ({ text, href, icon }: SidebarItemProps) => {
	const router = useRouter();

	const activeLink = router.pathname.split('/')[1] === href.split('/')[1];

	return (
		<Link
			className={`flex justify-center sm:justify-start items-center gap-2 px-4 py-2 w-100 ${activeLink ? 'bg-black text-white' : ''} sm:hover:bg-medium-grey hover:cursor-pointer`}
			href={href}
		>
			<span>{icon}</span>
			<span>{text}</span>
		</Link>
	);
};
