/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { toast } from 'react-toastify';

import PlatformLayout from '~/layouts/platform';
import { BasicButton } from '~/app/_components/ui/basic-button';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate, UInt32, UInt64, Signature, fetchAccount } from 'o1js';

export default function Dashboard() {
	const router = useRouter();

	useEffect(() => {
		if (router.query.login === 'success') toast.success('Logged in successfully');
		if (router.query.register === 'success') toast.success('Registered successfully');
		if (router.query.login === 'wallet') toast.success('Logged in with wallet successfully');
	}, [router.query.login, router.query.register]);

	const handleClick = async () => {
		try {
			const mina = (window as any).mina;
			console.log('Before import');

			const { FungibleToken } = await import('../../../contracts/build/src/token/FungibleToken');
			console.log('After import');

			const publicKeyBase58: string = (await mina.requestAccounts())[0];
			const publicKey = PublicKey.fromBase58(publicKeyBase58);
			// This is the public key of the deployed zkapp you want to interact with.
			const zkAppAddress = PrivateKey.random();

			console.log('Before compile');

			// await FungibleToken.compile().then(() => {
			// 	console.log('complete');
			// });

			console.log('Before fetch account');

			await fetchAccount({ publicKey: publicKey });
			await fetchAccount({ publicKey: zkAppAddress.toPublicKey() });

			console.log('Before transaction');

			const tx = await Mina.transaction(async () => {
				const YourSmartContractInstance = new FungibleToken(zkAppAddress.toPublicKey());
				await YourSmartContractInstance.mint(publicKey, new UInt64(100));
			});

			console.log('After transaction');

			await tx.prove();

			console.log('After proof');

			const { hash } = await window.mina.sendTransaction({
				transaction: tx.toJSON(),
				feePayer: {
					fee: '',
					memo: 'zk',
				},
			});

			console.log(hash);
		} catch (err) {
			// You may want to show the error message in your UI to the user if the transaction fails.
			console.log(err.message);
		}
	};

	return (
		<div>
			<h1>Hello (USER)!</h1>

			<BasicButton type={'primary'} onClick={handleClick}>
				TEST MINT
			</BasicButton>
		</div>
	);
}

Dashboard.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
