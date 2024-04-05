/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
'use client';
import React, { type ChangeEvent, useCallback, useEffect, useState } from 'react';

import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';

import { toast } from 'react-toastify';

import Link from 'next/link';
import { BasicButton } from '../ui/basic-button';
import { InlineLink } from '../ui/inline-link';
import { useWallet } from '~/providers/walletprovider';
import { MinaButton } from '../ui/mina-button';

export const Navbar = () => {
	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);
	const { logOutUser } = useUserStore((state) => state);
	const { walletDisplayAddress, isConnected } = useWallet();
	const exampleUserId = '69e8f4d1';

	const handleLogOut = () => {
		logOutUser();
		toast.success('Logged out successfully');
	};

	return (
		<header className="border-b fixed w-full z-40 bg-white h-20">
			<div className="container flex justify-between items-center h-full">
				<div className="flex flex-1">
					<MinaButton
						children={isConnected ? walletDisplayAddress : 'Connect'}
						disabled={false}
						checkInstall={true}
						type="connnect"
					/>
					{isConnected == true && (
						<MinaButton children={'Switch Chain'} disabled={false} checkInstall={true} type="chain" />
					)}
				</div>
				<div className="flex-1">
					<Link href="/">
						<h1 className="text-2xl text-center">Sliced</h1>
					</Link>
				</div>
				<div className="flex-1 flex items-center justify-end">
					{isLoggedIn ? (
						<div className="flex items-center gap-2 me-5">
							<InlineLink href={`/profile/${exampleUserId}`}>My Profile</InlineLink>
							<BasicButton type="secondary" onClick={handleLogOut}>
								Logout
							</BasicButton>
						</div>
					) : (
						<div className="flex gap-2 me-5">
							<Link href="/login">
								<BasicButton type="secondary">Login</BasicButton>
							</Link>
							<Link href="/register">
								<BasicButton type="primary">Register</BasicButton>
							</Link>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};
