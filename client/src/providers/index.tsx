import React, { type ReactNode } from 'react';
import { TRPCReactProvider } from '~/trpc/react';
import { WalletProvider } from '../providers/WalletProvider';
import { UserStoreProvider } from '~/providers/store-providers/userStoreProvider';

interface Props {
	children?: ReactNode;
	// any props that come into the component
}

const Providers = ({ children, ...props }: Props) => {
	return (
		<UserStoreProvider>
			<WalletProvider>
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</WalletProvider>
		</UserStoreProvider>
	);
};

export default Providers;
