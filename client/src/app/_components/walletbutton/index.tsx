'use client';
import React, { useEffect, useState } from 'react';
import { useWallet } from '../../../providers/WalletProvider';
import { BasicButton } from '../ui/basic-button';

export const WalletButton = () => {
	const { walletDisplayAddress, isConnected, tryConnectWallet } = useWallet();
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<>
			{isClient && (
				<BasicButton type="tertiary" onClick={() => tryConnectWallet()}>
					{isConnected && walletDisplayAddress ? walletDisplayAddress : 'Connect Wallet'}
				</BasicButton>
			)}
		</>
	);
};
