// THIS IS A TEMPORARY FILE TO KEEP TRACK OF USER STORE STATUS DURING TESTING
import { useState } from 'react';

import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { BasicButton } from './ui/basic-button';

export const UserStoreStatus = ({}) => {
	const [display, setDisplay] = useState(false);

	const { isLoggedIn, logInUser, logOutUser } = useUserStore((state) => state);

	return (
		<div className="fixed z-50 mt-1 ms-1">
			{display ? (
				<>
					<p className="hover:cursor-pointer hover:underline" onClick={() => setDisplay(false)}>
						Hide User Store
					</p>
					<div className="bg-purple-light p-3 border border-purple">
						<p>
							<strong>USER STORE</strong>
						</p>
						<p>
							<strong>isLoggedIn:</strong> {isLoggedIn.toString()}
						</p>
						<div className="flex items-center gap-1 mt-1">
							<BasicButton type="secondary" onClick={() => void logInUser()}>
								Log In
							</BasicButton>
							<BasicButton type="secondary" onClick={() => void logOutUser()}>
								Log Out
							</BasicButton>
						</div>
					</div>
				</>
			) : (
				<p className="hover:cursor-pointer hover:underline" onClick={() => setDisplay(true)}>
					Show User Store
				</p>
			)}
		</div>
	);
};
