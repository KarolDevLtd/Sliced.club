'use client';
import React from 'react';
import { WalletButton } from '~/app/_components/walletbutton';

export const Navbar = () => {
	return (
		<header>
			<p>Sliced</p>
			<WalletButton />
		</header>
	);
};
