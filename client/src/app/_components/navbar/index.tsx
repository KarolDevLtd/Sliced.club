'use client';
import React from 'react';
import { WalletButton } from '~/app/_components/walletbutton';

import Link from 'next/link';

export const Navbar = () => {
	const exampleUserId = '69e8f4d1';

	return (
		<header>
			<ul>
				<li>
					<Link href="/">Sliced</Link>
				</li>
				<li>
					<Link href="/login">Login</Link> | <Link href="/register">Register</Link>
				</li>
				<li>
					<Link href={`/profile/${exampleUserId}`}>My Profile</Link>
				</li>
			</ul>
			<WalletButton />
		</header>
	);
};
