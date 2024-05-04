import React from 'react';
import Link from 'next/link';

import { SidebarItem } from './sidebar-item';
import { MinaButton } from '../../ui/mina-button';
import { LogoutButton } from './logout-button';

import { FaHome } from 'react-icons/fa';
import { FaUserGroup } from 'react-icons/fa6';
import { FaUser } from 'react-icons/fa';
import { IoIosSettings } from 'react-icons/io';
import { FaShoppingCart } from 'react-icons/fa';
import { FaMoneyBill } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';

type PlatformSidebarProps = {
	hidden: boolean | undefined;
};

export const PlatformSidebar = ({ hidden = false }: PlatformSidebarProps) => {
	return (
		<aside
			className={`${hidden ? 'hidden sm:flex' : null} fixed top-0 flex flex-col justify-between items-center pt-6 min-h-screen w-full sm:w-1/4 md:w-1/5 lg:w-1/6 bg-light-grey`}
		>
			<div className="min-w-full flex flex-col">
				<p className="text-center mb-6">
					<Link href="/">Sliced</Link>
				</p>
				<SidebarItem text="Home" href="/" icon={<FaHome />} />
				<SidebarItem text="Groups" href="/groups" icon={<FaUserGroup />} />
				<SidebarItem text="My Products" href="/products" icon={<FaShoppingCart />} />
				<SidebarItem text="My Payments" href="/payments" icon={<FaMoneyBill />} />
				<SidebarItem text="My Profile" href="/profile/69" icon={<FaUser />} />
				<SidebarItem text="Categories" href="/categories" icon={<FaSearch />} />
				<SidebarItem text="Notifications" href="/notifications" icon={<IoMdNotifications />} />
				<SidebarItem text="Settings" href="/settings" icon={<IoIosSettings />} />
			</div>
			<MinaButton types={['connect', 'chain']} />
			<div className="min-w-full">
				<LogoutButton />
			</div>
		</aside>
	);
};
