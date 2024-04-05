/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { BasicButton } from '../basic-button';

import { FaWallet } from 'react-icons/fa';
import { useWallet } from '~/providers/walletprovider';

export type IMinaButton = {
	children?: React.ReactNode;
	disabled?: boolean;
	checkInstall?: boolean;
	type?: 'chain' | 'connnect';
};

export const MinaButton = ({ children, disabled, checkInstall = true, type }: IMinaButton) => {
	const { walletDisplayAddress, isConnected, tryConnectWallet, tryChainChange, chainType } = useWallet();
	const [isClient, setIsClient] = useState(false);
	const [selectedValue, setSelectedValue] = useState('');

	const onClickConnect = useCallback(async (isOnLoad: boolean) => {
		await tryConnectWallet(isOnLoad);
	}, []);

	const onClickChain = useCallback(async () => {
		await tryChainChange(selectedValue);
	}, [selectedValue]);

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setSelectedValue(event.target.value);
	};

	useEffect(() => {
		setIsClient(true);
		onClickConnect(true);
		setSelectedValue(chainType!);
	}, [onClickConnect, chainType]);

	return (
		<div>
			<BasicButton
				type="tertiary"
				icon={<FaWallet />}
				disabled={disabled}
				onClick={() => {
					type == 'chain' ? void onClickChain() : void onClickConnect(false);
				}}
			>
				{children}
			</BasicButton>
			{type == 'chain' ? (
				<select value={selectedValue} onChange={(e) => handleSelectChange(e)}>
					<option value="mainnet">mainnet</option>
					<option value="devnet">devnet</option>
					<option value="berkeley">berkeley</option>
				</select>
			) : null}
		</div>
	);
};
