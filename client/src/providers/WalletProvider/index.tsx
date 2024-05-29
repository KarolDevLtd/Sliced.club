/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// providers/walletprovider.tsx
'use client';
import { ChainInfoArgs, ProviderError } from '@aurowallet/mina-provider';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { sliceWalletAddress } from '~/helpers/user-helper';

import { useUserStore } from '~/providers/store-providers/userStoreProvider';

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

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
	const LOCAL_STORAGE_KEY = 'MINA';

	const [isConnected, setIsConnected] = useState(false);
	const [walletAddress, setWalletAddress] = useState<string | null>(null);
	const [walletDisplayAddress, setWalletDisplayAddress] = useState<string | null>(null);
	const [chainType, setChainType] = useState('');

	const { connectUserWallet } = useUserStore((state) => state);
	const { disconnectUserWallet } = useUserStore((state) => state);

	const tryConnectWallet = async (onLoad: boolean) => {
		//console.log('Attempting to connect');
		try {
			window.mina?.on('accountsChanged', async (accounts: string[]) => {
				if (accounts.length != 0) {
					await connectWallet();
					return;
				} else {
					disconnectWallet();
				}
			});
			if (onLoad) {
				//on page load, get account info automatically
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
			const switchResult: ChainInfoArgs | ProviderError = await window?.mina
				?.switchChain({
					chainId: chain,
				})
				.catch((err: ProviderError) => {
					throw err;
				});
			if ((switchResult as ProviderError).message) {
				console.log(switchResult);
			} else {
				setChainType(chain);
			}
			setChainType(chain);
		} catch (err) {
			console.log(err);
		}
	};

	const getCurrentChainType = async () => {
		try {
			// console.log('getCurrentChainType');
			const chain = await window.mina?.requestNetwork().catch((err: ProviderError) => {
				throw err;
			});
			// console.log(chain.chainId);
			setChainType(chain.chainId);
		} catch (err) {
			console.log(err);
		}
	};

	// Function to connect wallet
	const connectWallet = async () => {
		// console.log('connectWallet');
		try {
			const account = await window.mina.requestAccounts();
			await getCurrentChainType();
			updateWalletUI(account);
		} catch (err) {
			throw err;
		}
	};

	// Function to disconnect wallet
	const disconnectWallet = () => {
		// console.log('disconnectWallet');
		try {
			// console.log('disconnectWallet');
			updateWalletUI(null);
		} catch (err) {
			throw err;
		}
	};

	// Function to update wallet UI
	const updateWalletUI = (account: string | null) => {
		if (account?.[0]) {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(account));
			setWalletDisplayAddress(sliceWalletAddress(account[0]));
			setIsConnected(true);
			connectUserWallet();
		} else {
			// console.log('Disconneting wallet');
			localStorage.removeItem(LOCAL_STORAGE_KEY);
			setWalletDisplayAddress(null);
			setIsConnected(false);
			disconnectUserWallet();
		}
		setWalletAddress(account);
	};

	//Function to get wallet address from local storage
	//simply so user does not have to manually click wallet button to see if already connected
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
			throw err;
		}
	};

	// useEffect to initialize wallet address
	useEffect(() => {
		const address = getWalletAddress();
		setWalletAddress(address);
		updateWalletUI(address);
	}, [isConnected]);

	// Value to be provided by the context
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
