/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

export type UserState = {
	isLoggedIn: boolean;
	_hasHydrated: boolean | undefined;
};

export type UserActions = {
	logInUser: () => void;
	logOutUser: () => void;
	setHasHydrated: (arg0: boolean) => void;
};

export type UserStore = UserState & UserActions;

export const initUserStore = (): UserState => {
	return { isLoggedIn: false, _hasHydrated: undefined };
};

export const defaultInitState: UserState = {
	isLoggedIn: false,
	_hasHydrated: undefined,
};

export const createUserStore = (initState: UserState = defaultInitState) => {
	return createStore<UserStore>()(
		persist(
			(set) => ({
				...initState,
				logInUser: () => set((state) => ({ isLoggedIn: (state.isLoggedIn = true) })),
				logOutUser: () => set((state) => ({ isLoggedIn: (state.isLoggedIn = false) })),

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
