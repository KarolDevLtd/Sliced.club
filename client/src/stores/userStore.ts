/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

export type UserState = {
	isLoggedIn: boolean;
	walletConnected: boolean;
	userFirstName: string;
	userWalletAddress: string;
	_hasHydrated: boolean | undefined;
};

export type UserActions = {
	logInUser: () => void;
	logOutUser: () => void;
	connectUserWallet: () => void;
	disconnectUserWallet: () => void;
	setUserFirstName: (userFirstName: string) => void;
	setUserWalletAddress: (userWalletAddress: string) => void;
	setHasHydrated: (arg0: boolean) => void;
};

export type UserStore = UserState & UserActions;

export const initUserStore = (): UserState => {
	return {
		isLoggedIn: false,
		walletConnected: false,
		userFirstName: 'Karol',
		userWalletAddress: '',
		_hasHydrated: undefined,
	};
};

export const defaultInitState: UserState = {
	isLoggedIn: false,
	walletConnected: false,
	userFirstName: 'Karol',
	userWalletAddress: '',
	_hasHydrated: undefined,
};

export const createUserStore = (initState: UserState = defaultInitState) => {
	return createStore<UserStore>()(
		persist(
			(set) => ({
				...initState,
				logInUser: () => set((state) => ({ isLoggedIn: (state.isLoggedIn = true) })),
				logOutUser: () => set((state) => ({ isLoggedIn: (state.isLoggedIn = false) })),
				connectUserWallet: () => set((state) => ({ walletConnected: (state.walletConnected = true) })),
				disconnectUserWallet: () => set((state) => ({ walletConnected: (state.walletConnected = false) })),
				setUserFirstName: (userFirstName) =>
					set((state) => ({ userFirstName: (state.userFirstName = userFirstName) })),
				setUserWalletAddress: (userWalletAddress) =>
					set((state) => ({ userWalletAddress: (state.userWalletAddress = userWalletAddress) })),
				setHasHydrated: () => set((state) => ({ _hasHydrated: (state._hasHydrated = !!state) })),
			}),
			{
				name: 'sliced/user',
				onRehydrateStorage: () => (state) => {
					state?.setHasHydrated(true);
				},
			}
		)
	);
};
