/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { BasicButton } from '../basic-button';

import { FaWallet } from 'react-icons/fa';
import { GoArrowSwitch } from 'react-icons/go';

import { useWallet } from '~/providers/walletprovider';
import { SelectOption } from '../select-option';
import { MinaChainOptions } from '~/models/chain-options';

type MinaButtonTypes = 'chain' | 'connect';

export type MinaButtonProps = {
	types?: MinaButtonTypes[];
	disabled?: boolean;
};

export const MinaButton = ({ types, disabled }: MinaButtonProps) => {
	const { walletDisplayAddress, isConnected, tryConnectWallet, tryChainChange, chainType } = useWallet();
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

	useEffect(() => {
		onClickConnect(true);
		setSelectedValue(chainType!);
	}, [onClickConnect, chainType]);

	return (
		<div className="flex flex-col gap-1">
			{types?.includes('connect') && (
				<BasicButton
					type="tertiary"
					icon={<FaWallet />}
					disabled={disabled}
					onClick={() => {
						void onClickConnect(false);
					}}
				>
					{isConnected ? walletDisplayAddress : 'Connect'}
				</BasicButton>
			)}
			{isConnected && types?.includes('chain') && (
				<>
					<BasicButton
						type="tertiary"
						icon={<GoArrowSwitch />}
						disabled={disabled}
						onClick={() => {
							void onClickChain();
						}}
					>
						Switch Chain
					</BasicButton>
					<SelectOption
						id="wallet-chain"
						name="wallet-chain"
						value={selectedValue}
						onChange={(e) => handleSelectChange(e)}
						options={MinaChainOptions}
					/>
				</>
			)}
		</div>
	);
};
