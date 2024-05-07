import { BasicButton } from '~/app/_components/ui/basic-button';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { toast } from 'react-toastify';

import { Field, Mina, PrivateKey, PublicKey, AccountUpdate, UInt32, UInt64, Signature, fetchAccount } from 'o1js';
import PageHeader from '~/app/_components/ui/page-header';
import PlatformLayout from '~/layouts/platform';

export default function Categories() {
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
			const Network = Mina.Network({
				networkId: 'testnet',
				mina: 'http://localhost:8080/graphql',
				archive: 'http://localhost:8282',
				lightnetAccountManager: 'http://localhost:8181',
			});
			const fee = Number(0.01) * 1e9; // in nanomina (1 billion = 1.0 mina)
			Mina.setActiveInstance(Network);
			// const Local = await Mina.LocalBlockchain({ proofsEnabled: true });
			// Mina.setActiveInstance(Local);
			const { FungibleToken } = await import('~/../../contracts/src/token/FungibleToken');
			console.log('After import');

			const publicKeyBase58: string = (await mina.requestAccounts())[0];
			console.log('users pubkey ', publicKeyBase58);
			const publicKey = PublicKey.fromBase58(publicKeyBase58);
			// This is the public key of the deployed zkapp you want to interact with.
			const zkAppAddress = PublicKey.fromBase58('B62qibDQ9yLEoLeHVQ3SuTdUDJMYv4xU1Av2HSugSDGu7BF3XxVEyye');
			console.log('Before compile');

			await FungibleToken.compile().then(() => {
				console.log('compile complete');
			});
			const tokenApp = new FungibleToken(zkAppAddress);

			console.log('Before fetch account');

			await fetchAccount({ publicKey: publicKey });
			await fetchAccount({ publicKey: zkAppAddress });

			console.log('Before transaction');
			const reciever = PublicKey.fromBase58('B62qq6LVZ2E3RgJoDMaCzQepYShJ339B6BW6myUrra9vgXMZbN2sGtE');
			const txn = await Mina.transaction(async () => {
				AccountUpdate.fundNewAccount(publicKey);
				// await tokenApp.transfer(publicKey, reciever, new UInt64(100));
				await tokenApp.mint(reciever, new UInt64(100));
			});
			await txn.prove();

			console.log('After proof');

			// await (
			// 	await txn.sign([deployer.key, tokenPrivateKey]).send()
			// ).wait();

			// const tx = await Mina.transaction(async () => {
			// 	const YourSmartContractInstance = new FungibleToken(zkAppAddress);
			// 	await YourSmartContractInstance.mint(publicKey, new UInt64(100));
			// });

			const { hash } = await window.mina.sendTransaction({
				transaction: txn.toJSON(),
				feePayer: {
					fee,
					memo: 'zk',
				},
			});

			console.log(hash);
		} catch (err) {
			// You may want to show the error message in your UI to the user if the transaction fails.
			console.log(err);
		}
	};

	return (
		<>
			<PageHeader text="Categories" />
			<BasicButton type={'primary'} onClick={handleClick}>
				TEST MINT
			</BasicButton>{' '}
		</>
	);
}

Categories.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
