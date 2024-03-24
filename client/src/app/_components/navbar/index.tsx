'use client';
import React from 'react';
import { WalletButton } from '~/app/_components/walletbutton';

import Link from 'next/link';
import { BasicButton } from '../ui/basic-button';

export const Navbar = () => {
	const exampleUserId = '69e8f4d1';

	return (
		<header className="border-b">
			<div className="container flex justify-between items-center py-3">
				<div className="flex-1">
					<WalletButton />
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
					<Link href={`/profile/${exampleUserId}`}>My Profile</Link>
				</div>
			</div>
		</header>
	);
};
