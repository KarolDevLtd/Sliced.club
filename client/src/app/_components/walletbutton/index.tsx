'use client';
import React, { useEffect, useState } from 'react';
import { useWallet } from '../../../providers/WalletProvider';

export const WalletButton = () => {
	const { walletDisplayAddress, isConnected, tryConnectWallet } = useWallet();
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<>
			{isClient && (
				<div className="flex items-center md:ml-12">
					<button
						onClick={() => tryConnectWallet()}
						className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-3 text-base font-medium text-white hover:bg-indigo-700 md:px-5 md:py-2 "
					>
						{isConnected && walletDisplayAddress ? walletDisplayAddress : 'Connect Wallet'}
					</button>
				</div>
			)}
		</>
	);
};
