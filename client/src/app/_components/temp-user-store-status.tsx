/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// THIS IS A TEMPORARY FILE TO KEEP TRACK OF USER STORE STATUS DURING TESTING
import { useState } from 'react';

import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';

export const UserStoreStatus = ({}) => {
	const [display, setDisplay] = useState(false);

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);
	const _hasHydrated = useStore(useUserStore, (state: UserState) => state._hasHydrated);

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
							<strong>isLoggedIn:</strong> {isLoggedIn?.toString()}
						</p>
						<p>
							<strong>walletConnected:</strong> {walletConnected?.toString()}
						</p>
						<p>
							<strong>storeHasHydrated:</strong> {_hasHydrated?.toString()}
						</p>
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
