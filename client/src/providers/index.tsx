import React, { ReactNode } from 'react';
import { TRPCReactProvider } from '~/trpc/react';
import { WalletProvider } from './walletprovider';

interface Props {
	children?: ReactNode;
	// any props that come into the component
}

const Providers = ({ children, ...props }: Props) => {
	return (
		<WalletProvider>
			<TRPCReactProvider>{children}</TRPCReactProvider>;
		</WalletProvider>
	);
};

export default Providers;
