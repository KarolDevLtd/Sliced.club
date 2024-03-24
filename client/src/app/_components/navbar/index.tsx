'use client';
import React from 'react';
import { WalletButton } from '~/app/_components/walletbutton';

import Link from 'next/link';

export const Navbar = () => {
	const exampleUserId = '69e8f4d1';

	return (
		<header className="border-b">
			<div className="container flex justify-between items-center py-3">
				<WalletButton />
				<Link href="/">
					<h1 className="text-2xl">Sliced</h1>
				</Link>
				<div className="flex">
					<div className="me-5">
						<Link href="/login">Login</Link> | <Link href="/register">Register</Link>
					</div>
					<Link href={`/profile/${exampleUserId}`}>My Profile</Link>
				</div>
			</div>
		</header>
	);
};
