import { createStore } from 'zustand/vanilla';

export type UserState = {
	isLoggedIn: boolean;
};

export type UserActions = {
	logInUser: () => void;
	logOutUser: () => void;
};

export type UserStore = UserState & UserActions;

export const initUserStore = (): UserState => {
	return { isLoggedIn: false };
};

export const defaultInitState: UserState = {
	isLoggedIn: false,
};

export const createUserStore = (initState: UserState = defaultInitState) => {
	return createStore<UserStore>()((set) => ({
		...initState,
		logInUser: () => set((state) => ({ isLoggedIn: (state.isLoggedIn = true) })),
		logOutUser: () => set((state) => ({ isLoggedIn: (state.isLoggedIn = false) })),
	}));
};
