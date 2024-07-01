/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// providers/walletprovider.tsx
'use client';
import MinaProvider, { ChainInfoArgs, ProviderError } from '@aurowallet/mina-provider';
import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { sliceWalletAddress } from '~/helpers/user-helper';

import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { useMinaProvider } from '../minaprovider';
import { useStartUpProvider } from '../start-up-provider';

// Define the type for the context value
interface WalletContextType {
	walletDisplayAddress: string | null;
	walletAddress: string | null;
	isConnected: boolean;
	chainType: string | null;
	connectWallet: () => Promise<void>;
	tryConnectWallet: (onLoad: boolean) => Promise<void>;
	tryChainChange: (chain: string) => Promise<void>;
	disconnectWallet: () => void;
}

//TODO: extract into seperate file for global variables?
declare global {
	interface Window {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mina: any;
	}
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Custom hook to use the wallet context
export const useWallet = (): WalletContextType => {
	try {
		const context = useContext(WalletContext);
		if (!context) {
			throw new Error('useWallet must be used within a WalletProvider');
		}
		return context;
	} catch (err) {
		throw err;
	}
};

// Define props interface for WalletProvider component
interface WalletProviderProps {
	children: ReactNode;
}

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const LOCAL_STORAGE_KEY = 'MINA';

	const { setUserWalletAddress } = useUserStore((state) => state);
	const { startingUp, hasCompletedStartUp, setStartingUp } = useStartUpProvider();
	const { spinUp } = useMinaProvider();

	const [isConnected, setIsConnected] = useState(false);
	const [walletAddress, setWalletAddress] = useState<string | null>(null);
	const [walletDisplayAddress, setWalletDisplayAddress] = useState<string | null>(null);
	const [chainType, setChainType] = useState('');

	const { connectUserWallet, disconnectUserWallet } = useUserStore((state) => state);

	const tryConnectWallet = async (onLoad: boolean) => {
		try {
			if (onLoad) {
				await window?.mina?.getAccounts();
				return;
			}
			await connectWallet();
		} catch (err) {
			console.log(err);
		}
	};

	const tryChainChange = async (chain: string) => {
		try {
			const switchResult = await window?.mina?.switchChain({ chainId: chain }).catch((err) => {
				throw err;
			});
			if (switchResult && 'message' in switchResult) {
				console.log(switchResult);
			} else {
				setChainType(chain);
			}
		} catch (err) {
			console.log(err);
		}
	};

	const getCurrentChainType = async () => {
		try {
			const chain = await window.mina?.requestNetwork().catch((err) => {
				throw err;
			});
			setChainType(chain.chainId);
		} catch (err) {
			console.log(err);
		}
	};

	const connectWallet = async () => {
		try {
			const account = await window.mina.requestAccounts();
			await getCurrentChainType();
			console.log('con');

			updateWalletUI(account);
		} catch (err) {
			console.log(err);
		}
	};

	const disconnectWallet = () => {
		try {
			console.log('dis');
			updateWalletUI(null);
		} catch (err) {
			console.log(err);
		}
	};

	const updateWalletUI = (account: string | null) => {
		if (account?.[0]) {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(account));
			setWalletDisplayAddress(sliceWalletAddress(account[0]));
			setIsConnected(true);
			connectUserWallet();
		} else {
			localStorage.removeItem(LOCAL_STORAGE_KEY);
			setWalletDisplayAddress(null);
			setIsConnected(false);
			disconnectUserWallet();
		}
		setWalletAddress(account);
		setUserWalletAddress(account ?? '');
	};

	const getWalletAddress = (): string | null => {
		try {
			if (typeof window !== 'undefined') {
				const value = localStorage.getItem(LOCAL_STORAGE_KEY);
				if (value !== null) {
					return JSON.parse(value);
				}
			}
			return null;
		} catch (err) {
			console.log(err);
			return null;
		}
	};

	useEffect(() => {
		const address = getWalletAddress();
		updateWalletUI(address);
	}, []);

	useEffect(() => {
		if (walletAddress) {
			console.log('Checking startUp value:', startingUp);
			setStartingUp(true);
		}
	}, [walletAddress]);

	useEffect(() => {
		if (startingUp) {
			setStartingUp(false);
			// console.log('Spinning up');
			const performSpinUp = async () => {
				console.log('Spinning up');
				await spinUp();
				// hasCompletedStartUp(true);
			};
			void performSpinUp();
		}
	}, [startingUp]);

	useEffect(() => {
		const handleAccountsChanged = async (accounts: string[]) => {
			// console.log(accounts[0]);
			if (accounts.length !== 0) {
				await connectWallet();
			} else {
				disconnectWallet();
			}
		};

		window.mina?.on('accountsChanged', handleAccountsChanged);

		// Clean up the event listener on unmount or when dependencies change
		return () => {
			window.mina?.removeListener('accountsChanged', handleAccountsChanged);
		};
	}, []);

	const value: WalletContextType = {
		walletDisplayAddress,
		walletAddress,
		isConnected,
		chainType,
		tryConnectWallet,
		tryChainChange,
		connectWallet,
		disconnectWallet,
	};

	return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
