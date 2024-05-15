import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import SidebarItem from './SidebarItem';
import MinaButton from '../../ui/MinaButton';
import LogoutButton from './LogoutButton';

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

const PlatformSidebar = ({ hidden = false }: PlatformSidebarProps) => {
	return (
		<aside
			className={`${hidden ? 'hidden sm:flex' : null} fixed top-0 flex flex-col justify-between items-center pt-6 min-h-screen w-full sm:w-1/4 md:w-1/5 lg:w-1/6 bg-light-grey bg-accent`}
		>
			<div className="min-w-full flex flex-col">
				<ul className="menu p-0 [&_li>*]:rounded-none">
					<li className="menu-title pb-6">
						<Link href="/">
							<Image src={`/logos/slice-logo.png`} alt="slice logo" width="64" height="64" />
						</Link>
					</li>
					<li>
						<SidebarItem text="Home" href="/" icon={<FaHome />} />
					</li>
					<li>
						<SidebarItem text="Groups" href="/groups" icon={<FaUserGroup />} />
					</li>
					<li>
						<SidebarItem text="My Products" href="/products" icon={<FaShoppingCart />} />
					</li>
					<li>
						<SidebarItem text="My Payments" href="/payments" icon={<FaMoneyBill />} />
					</li>
					<li>
						<SidebarItem text="My Profile" href="/profile/69" icon={<FaUser />} />
					</li>
					<li>
						<SidebarItem text="Categories" href="/categories" icon={<FaSearch />} />
					</li>
					<li>
						<SidebarItem text="Notifications" href="/notifications" icon={<IoMdNotifications />} />
					</li>
					<li>
						<SidebarItem text="Settings" href="/settings" icon={<IoIosSettings />} />
					</li>
				</ul>
			</div>

			<div>
				<MinaButton types={['connect', 'chain']} />
			</div>

			<div className="min-w-full flex flex-col">
				<ul className="menu p-0 [&_li>*]:rounded-none">
					<li>
						<LogoutButton />
					</li>
				</ul>
			</div>
		</aside>
	);
};

export default PlatformSidebar;
