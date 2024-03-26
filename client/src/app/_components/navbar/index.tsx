/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
'use client';
import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { BasicButton } from '../ui/basic-button';
import { InlineLink } from '../ui/inline-link';
import { useWallet } from '~/providers/walletprovider';
import { MinaButton } from '../minabutton';

export const Navbar = () => {
	const exampleUserId = '69e8f4d1';
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
		<header className="border-b">
			<div className="container flex justify-between items-center py-3">
				<div className="flex-1">
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
>>>>>>> 74e91beea530a323123e30624a3bd1e2976850c7
	);
};
