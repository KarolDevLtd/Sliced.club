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

	interface SignedData {
		publicKey: string;
		data: string;
		signature: {
			field: string;
			scalar: string;
		};
	}

	interface ProviderError extends Error {
		message: string;
		code: number;
		data?: unknown;
	}
	type SignMessageArgs = {
		message: string;
	};

	const content = `Click "Sign" to sign in. No password needed!
    This request will not trigger a blockchain transaction or cost any gas fees.
    I accept the Auro Test zkApp Terms of Service: ${window.location.href}
    address: ${walletAddress}
    iat: ${new Date().getTime()}`;

	const signContent: SignMessageArgs = {
		message: content,
	};

	const signTransaction = async () => {
		await window.mina?.signMessage(signContent).catch((err: string) => console.log(err));
	};

	const sendTransaction = async (
		amount: number,
		address: string,
		fee: number | null,
		memo: string | null
	): Promise<SendTransactionResult | ProviderError> => {
		return await window.mina
			?.sendPayment({
				amount: amount,
				to: address,
				fee: fee, // option
				memo: memo, // option
			})
			.catch((err: string) => console.log(err));
	};

	const value: MinaContextType = {};
	return <MinaProviderContext.Provider value={value}>{children}</MinaProviderContext.Provider>;
};
