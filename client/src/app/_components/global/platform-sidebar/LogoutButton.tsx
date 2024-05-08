import React from 'react';
import router from 'next/router';

import { useUserStore } from '~/providers/store-providers/userStoreProvider';

import { RiLogoutBoxFill } from 'react-icons/ri';
import BasicButton from '../../ui/BasicButton';

const LogoutButton = () => {
	const { logOutUser } = useUserStore((state) => state);

	const handleLogOut = () => {
		logOutUser();
		void router.push('/login?logout=success');
	};

	return (
		<BasicButton type="ghost" icon={<RiLogoutBoxFill />} iconBefore={true} onClick={handleLogOut}>
			Log out
		</BasicButton>
	);
};

export default LogoutButton;
