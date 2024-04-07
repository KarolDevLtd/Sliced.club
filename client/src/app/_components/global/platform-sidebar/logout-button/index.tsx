import React from 'react';
import router from 'next/router';

import { useUserStore } from '~/providers/store-providers/userStoreProvider';

import { RiLogoutBoxFill } from 'react-icons/ri';

export const LogoutButton = () => {
	const { logOutUser } = useUserStore((state) => state);

	const handleLogOut = () => {
		logOutUser();
		void router.push('/?logout=success');
	};

	return (
		<div
			className="flex items-center gap-2 px-4 py-2 w-100 hover:bg-medium-grey hover:cursor-pointer"
			onClick={handleLogOut}
		>
			<span>
				<RiLogoutBoxFill />
			</span>
			<span>Log out</span>
		</div>
	);
};
