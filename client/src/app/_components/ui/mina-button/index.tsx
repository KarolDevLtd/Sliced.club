/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { type ChangeEvent, useCallback, useEffect, useState } from 'react';
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
	const { tryConnectWallet, tryChainChange, chainType } = useWallet();
	const [isCient, setIsClient] = useState(false);
	const [selectedValue, setSelectedValue] = useState('');

	const onClickConnect = useCallback(
		async (isOnLoad: boolean) => {
			await tryConnectWallet(isOnLoad);
		},
		[tryConnectWallet]
	);

	const onClickChain = useCallback(async () => {
		await tryChainChange(selectedValue);
	}, [selectedValue, tryChainChange]);

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setSelectedValue(event.target.value);
	};

	const onClickBtn = useCallback(
		(e: Event) => {
			if (checkInstall && !window?.mina) {
				alert('No provider was found - please install Auro Wallet');
				return;
			}
			type === 'chain' ? void onClickChain() : void onClickConnect(false);
		},
		[checkInstall, onClickChain, onClickConnect, type]
	);

	useEffect(() => {
		setIsClient(true);
		onClickConnect(true);
		setSelectedValue(chainType!);
	}, [onClickConnect, chainType]);

	return (
		<div>
			<BasicButton type="tertiary" icon={<FaWallet />} disabled={disabled} onClick={onClickBtn}>
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
