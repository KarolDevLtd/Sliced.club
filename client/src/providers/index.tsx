import React, { type ReactNode } from 'react';
import { TRPCReactProvider } from '~/trpc/react';
import { WalletProvider } from './WalletProvider';
import { UserStoreProvider } from '~/providers/store-providers/userStoreProvider';
import { MinaProvider } from './minaprovider';
import { StartUpProvider } from './start-up-provider';

interface Props {
	children?: ReactNode;
	// any props that come into the component
}

const Providers = ({ children, ...props }: Props) => {
	return (
		<UserStoreProvider>
			<StartUpProvider>
				<MinaProvider>
					<WalletProvider>
						<TRPCReactProvider>{children}</TRPCReactProvider>
					</WalletProvider>
				</MinaProvider>
			</StartUpProvider>
		</UserStoreProvider>
	);
};

export default Providers;
