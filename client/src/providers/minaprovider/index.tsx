/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { ProviderError, SendTransactionResult } from '@aurowallet/mina-provider';
import { ReactNode, createContext, useContext } from 'react';
import { useWallet } from '../walletprovider';
import { number } from 'zod';

interface MinaContextType {}

const MinaProviderContext = createContext<MinaContextType | undefined>(undefined);

// Custom hook to use the wallet context
export const useMinaProvider = (): MinaContextType => {
	try {
		const context = useContext(MinaProviderContext);
		if (!context) {
			throw new Error('useMinaProvider must be used within a MinaProvider');
		}
		return context;
	} catch (err) {
		throw err;
	}
};

// Define props interface for WalletProvider component
interface MinaProviderProps {
	children: ReactNode;
}

export const MinaProvider: React.FC<MinaProviderProps> = ({ children }) => {
	const { walletAddress, isConnected } = useWallet();

	const value: MinaContextType = {
		//exports go here
	};
	return <MinaProviderContext.Provider value={value}>{children}</MinaProviderContext.Provider>;
};
