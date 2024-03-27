/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
'use client';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BasicButton } from '../ui/basic-button';
import { InlineLink } from '../ui/inline-link';
import { useWallet } from '~/providers/walletprovider';
import { MinaButton } from '../ui/mina-button';

export const Navbar = () => {
	const exampleUserId = '69e8f4d1';
	const { walletDisplayAddress, isConnected, tryConnectWallet, tryChainChange, chainType } = useWallet();
	const [isClient, setIsClient] = useState(false);
	const [selectedValue, setSelectedValue] = useState('');

	const onClickConnect = useCallback(async (isOnLoad: boolean) => {
		console.log('Connect');
		await tryConnectWallet(isOnLoad);
	}, []);

	const onClickChain = async () => {
		console.log(selectedValue);
		await tryChainChange(selectedValue);
	};

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		console.log('handleSelectChange');
		console.log(event);
		setSelectedValue(event.target.value);
	};

	useEffect(() => {
		setIsClient(true);
		onClickConnect(true);
		setSelectedValue(chainType!);
	}, [onClickConnect, chainType]);

	return (
		<header className="border-b">
			<div className="container flex justify-between items-center py-3">
				<div className="flex flex-1">
					<MinaButton
						children={isConnected ? walletDisplayAddress : 'Connect'}
						disabled={false}
						onClick={() => {
							onClickConnect(false);
							return {};
						}}
						checkInstall={true}
					/>
					{isConnected == true && (
						<div>
							<MinaButton
								children={'Switch Chain'}
								disabled={false}
								onClick={onClickChain}
								checkInstall={true}
							/>
							<select value={selectedValue} onChange={(e) => handleSelectChange(e)}>
								<option value="mainnet">mainnet</option>
								<option value="devnet">devnet</option>
								<option value="berkeley">berkeley</option>
							</select>
						</div>
					)}
				</div>
				<div className="flex-1">
					<Link href="/">
						<h1 className="text-2xl text-center">Sliced</h1>
					</Link>
				</div>
				<div className="flex-1 flex items-center justify-end">
					<div className="flex gap-2 me-5">
						<Link href="/login">
							<BasicButton type="secondary">Login</BasicButton>
						</Link>
						<Link href="/register">
							<BasicButton type="primary">Register</BasicButton>
						</Link>
					</div>
					<InlineLink href={`/profile/${exampleUserId}`}>My Profile</InlineLink>
				</div>
			</div>
		</header>
	);
};
