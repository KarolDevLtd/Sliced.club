/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
'use client';
import React, { useEffect, useState } from 'react';
import { MinaButton } from '../minabutton';
import { useWallet } from '~/providers/walletprovider';

export const Navbar = () => {
	const { walletDisplayAddress, isConnected, tryConnectWallet, tryChainChange } = useWallet();
	const [isClient, setIsClient] = useState(false);
	const [selectedValue, setSelectedValue] = useState('');

	useEffect(() => {
		setIsClient(true);
	}, []);

	const onClickConnect = async () => {
		await tryConnectWallet();
	};

	const onClickChain = async () => {
		console.log(selectedValue);
		await tryChainChange(selectedValue);
	};

	const handleSelectChange = (event) => {
		setSelectedValue(event.target.value);
	};

	return (
		<div className="flex bg-red-200">
			<MinaButton
				children={isConnected ? walletDisplayAddress : 'Connect'}
				disabled={false}
				onClick={onClickConnect}
				checkInstall={true}
			/>
			{isConnected == true && (
				<div>
					<MinaButton children={'Switch Chain'} disabled={false} onClick={onClickChain} checkInstall={true} />
					<select value={selectedValue} onChange={handleSelectChange}>
						<option value="mainnet">mainnet</option>
						<option value="devnet">devnet</option>
						<option value="berkeley">berkeley</option>
					</select>
				</div>
			)}
		</div>
	);
};
