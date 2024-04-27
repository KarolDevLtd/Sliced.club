/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import BasicButton from './BasicButton';
import SelectOption from './SelectOption';

import { FaWallet } from 'react-icons/fa';
import { GoArrowSwitch } from 'react-icons/go';

import { useWallet } from '~/providers/walletprovider';
import { MinaChainOptions } from '~/models/chain-options';

type MinaButtonTypes = 'chain' | 'connect';

export type MinaButtonProps = {
	types: MinaButtonTypes[];
	checkInstall?: boolean;
	disabled?: boolean;
};

const MinaButton = ({ types, checkInstall = true, disabled }: MinaButtonProps) => {
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

	const onClickBtn = useCallback(() => {
		if (checkInstall && !window?.mina) {
			toast.error('No provider was found - please install Auro Wallet');
			return;
		}
	}, [checkInstall]);

	useEffect(() => {
		onClickConnect(true);
		setSelectedValue(chainType!);
	}, [onClickConnect, chainType]);

	return (
		<div className="flex flex-col gap-1">
			{types.includes('connect') && (
				<BasicButton
					type="tertiary"
					icon={<FaWallet />}
					disabled={disabled}
					onClick={() => {
						onClickBtn;
						void onClickConnect(false);
					}}
				>
					{isConnected ? walletDisplayAddress : 'Connect'}
				</BasicButton>
			)}
			{isConnected && types.includes('chain') && (
				<>
					<BasicButton
						type="tertiary"
						icon={<GoArrowSwitch />}
						disabled={disabled}
						onClick={() => {
							onClickBtn;
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

export default MinaButton;
