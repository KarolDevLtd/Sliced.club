/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// providers/walletprovider.tsx
'use client';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Define the type for the context value
interface WalletContextType {
	walletDisplayAddress: string | null;
	walletAddress: string | null;
	isConnected: boolean;
	connectWallet: () => Promise<void>;
	tryConnectWallet: () => Promise<void>;
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

	const tryConnectWallet = async () => {
		try {
			window.mina?.on('accountsChanged', async (accounts: string[]) => {
				if (accounts.length != 0) {
					await connectWallet();
					return;
				} else {
					disconnectWallet();
				}
			});
			await connectWallet();
		} catch (err) {
			console.log(err);
		}
	};

	// Function to connect wallet
	const connectWallet = async () => {
		try {
			const account = await window.mina.requestAccounts();
			updateWalletUI(account);
		} catch (err) {
			throw err;
		}
	};

	// Function to disconnect wallet
	const disconnectWallet = () => {
		try {
			updateWalletUI(null);
		} catch (err) {
			throw err;
		}
	};

	// Function to update wallet UI
	const updateWalletUI = (account: string | null) => {
		if (account?.[0]) {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(account));
			setWalletDisplayAddress(`${account[0].slice(0, 6)}...${account[0].slice(-4)}`);
			setIsConnected(true);
		} else {
			localStorage.removeItem(LOCAL_STORAGE_KEY);
			setWalletDisplayAddress(null);
			setIsConnected(false);
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
		tryConnectWallet,
		connectWallet,
		disconnectWallet,
	};

	return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
