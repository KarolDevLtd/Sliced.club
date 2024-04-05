import React from 'react';
import Link from 'next/link';

import { SidebarItem } from './sidebar-item';
import { LogoutButton } from './logout-button';

import { FaHome } from 'react-icons/fa';
import { FaUserGroup } from 'react-icons/fa6';
import { FaUser } from 'react-icons/fa';
import { IoIosSettings } from 'react-icons/io';
import { FaShoppingCart } from 'react-icons/fa';
import { FaMoneyBill } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';

export const PlatformSidebar = () => {
	return (
		<aside className="flex flex-col justify-between items-center p-6 w-1/6 bg-light-grey">
			<div>
				<p className="text-center mb-6">
					<Link href="/">Sliced</Link>
				</p>
				<SidebarItem text="Home" href="/dashboard" icon={<FaHome />} />
				<SidebarItem text="Groups" href="/groups" icon={<FaUserGroup />} />
				<SidebarItem text="My Products" href="/products" icon={<FaShoppingCart />} />
				<SidebarItem text="My Payments" href="/payments" icon={<FaMoneyBill />} />
				<SidebarItem text="My Profile" href="/profile/69/edit" icon={<FaUser />} />
				<SidebarItem text="Categories" href="/categories" icon={<FaSearch />} />
				<SidebarItem text="Notifications" href="/profile/69/edit" icon={<IoMdNotifications />} />
				<SidebarItem text="Settings" href="/settings" icon={<IoIosSettings />} />
			</div>
			<LogoutButton />
		</aside>
	);
};
