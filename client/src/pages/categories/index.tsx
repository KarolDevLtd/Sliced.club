import { BasicButton } from '~/app/_components/ui/basic-button';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { toast } from 'react-toastify';

import { Field, Mina, PrivateKey, PublicKey, AccountUpdate, UInt32, UInt64, Signature, fetchAccount } from 'o1js';
// const { Field, Mina, PrivateKey, PublicKey, AccountUpdate, UInt32, UInt64, Signature, fetchAccount } = await import(
// 	'o1js'
// );
import PageHeader from '~/app/_components/ui/page-header';
import PlatformLayout from '~/layouts/platform';
import ZkappWorkerClient from '../zkappWorkerClient';

const ZKAPP_ADDRESS = 'B62qibDQ9yLEoLeHVQ3SuTdUDJMYv4xU1Av2HSugSDGu7BF3XxVEyye';

export default function Categories() {
	// (async () => {
	// 	const { Field, Mina, PrivateKey, PublicKey, AccountUpdate, UInt32, UInt64, Signature, fetchAccount } =
	// 		await import('o1js');
	// })();
	const [state, setState] = useState({
		zkappWorkerClient: null as null | ZkappWorkerClient,
		hasWallet: null as null | boolean,
		hasBeenSetup: false,
		accountExists: false,
		currentSupply: null as null | UInt64,
		publicKey: null as null | PublicKey,
		zkappPublicKey: null as null | PublicKey,
		creatingTransaction: false,
	});
	const [displayText, setDisplayText] = useState('');
	const [transactionlink, setTransactionLink] = useState('');
	const router = useRouter();

	useEffect(() => {
		if (router.query.login === 'success') toast.success('Logged in successfully');
		if (router.query.register === 'success') toast.success('Registered successfully');
		if (router.query.login === 'wallet') toast.success('Logged in with wallet successfully');
	}, [router.query.login, router.query.register]);

	// -------------------------------------------------------
	// Do Setup

	useEffect(() => {
		async function timeout(seconds: number): Promise<void> {
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					resolve();
				}, seconds * 1000);
			});
		}

		(async () => {
			if (!state.hasBeenSetup) {
				setDisplayText('Loading web worker...');
				console.log('Loading web worker...');
				const zkappWorkerClient = new ZkappWorkerClient();
				await timeout(5);

				setDisplayText('Done loading web worker');
				console.log('Done loading web worker');

				await zkappWorkerClient.setActiveInstanceToLightnet();

				const mina = (window as any).mina;

				if (mina == null) {
					setState({ ...state, hasWallet: false });
					return;
				}

				const publicKeyBase58: string = (await mina.requestAccounts())[0];
				const publicKey = PublicKey.fromBase58(publicKeyBase58);

				console.log(`Using key:${publicKey.toBase58()}`);
				setDisplayText(`Using key:${publicKey.toBase58()}`);

				setDisplayText('Checking if fee payer account exists...');
				console.log('Checking if fee payer account exists...');

				const res = await zkappWorkerClient.fetchAccount({
					publicKey: publicKey,
				});
				const accountExists = res.error == null;

				await zkappWorkerClient.loadContract();

				console.log('Compiling zkApp...');
				setDisplayText('Compiling zkApp...');
				await zkappWorkerClient.compileContract();
				console.log('zkApp compiled');
				setDisplayText('zkApp compiled...');

				const zkappPublicKey = PublicKey.fromBase58(ZKAPP_ADDRESS);

				await zkappWorkerClient.initZkappInstance(zkappPublicKey);

				console.log('Getting zkApp state...');
				setDisplayText('Getting zkApp state...');
				await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });

				await zkappWorkerClient.createTransferTransaction(
					publicKeyBase58,
					'B62qq6LVZ2E3RgJoDMaCzQepYShJ339B6BW6myUrra9vgXMZbN2sGtE',
					6
				);

				// const currentSupply = await zkappWorkerClient.getSupply();
				// console.log(`Current supply in zkApp: ${currentSupply.toString()}`);
				setDisplayText('');

				setState({
					...state,
					zkappWorkerClient,
					hasWallet: true,
					hasBeenSetup: true,
					publicKey,
					zkappPublicKey,
					accountExists,
					currentSupply,
				});
			}
		})();
	}, []);

	// -------------------------------------------------------
	// Wait for account to exist, if it didn't

	useEffect(() => {
		(async () => {
			if (state.hasBeenSetup && !state.accountExists) {
				for (;;) {
					setDisplayText('Checking if fee payer account exists...');
					console.log('Checking if fee payer account exists...');
					const res = await state.zkappWorkerClient!.fetchAccount({
						publicKey: state.publicKey!,
					});
					const accountExists = res.error == null;
					if (accountExists) {
						break;
					}
					await new Promise((resolve) => setTimeout(resolve, 5000));
				}
				setState({ ...state, accountExists: true });
			}
		})();
	}, [state.hasBeenSetup]);

	// const handleClick = async () => {
	// 	try {
	// 		const mina = (window as any).mina;
	// 		console.log('Before import');
	// 		const Network = Mina.Network({
	// 			networkId: 'testnet',
	// 			mina: 'http://localhost:8080/graphql',
	// 			archive: 'http://localhost:8282',
	// 			lightnetAccountManager: 'http://localhost:8181',
	// 		});
	// 		const fee = Number(0.01) * 1e9; // in nanomina (1 billion = 1.0 mina)
	// 		Mina.setActiveInstance(Network);
	// 		// const Local = await Mina.LocalBlockchain({ proofsEnabled: true });
	// 		// Mina.setActiveInstance(Local);
	// 		const { FungibleToken } = await import('~/../../contracts/src/token/FungibleToken');
	// 		console.log('After import');

	// 		const publicKeyBase58: string = (await mina.requestAccounts())[0];
	// 		console.log('users pubkey ', publicKeyBase58);
	// 		const publicKey = PublicKey.fromBase58(publicKeyBase58);
	// 		// This is the public key of the deployed zkapp you want to interact with.
	// 		const zkAppAddress = PublicKey.fromBase58('B62qibDQ9yLEoLeHVQ3SuTdUDJMYv4xU1Av2HSugSDGu7BF3XxVEyye');
	// 		console.log('Before compile');

	// 		await FungibleToken.compile().then(() => {
	// 			console.log('compile complete');
	// 		});
	// 		const tokenApp = new FungibleToken(zkAppAddress);

	// 		console.log('Before fetch account');

	// 		await fetchAccount({ publicKey: publicKey });
	// 		await fetchAccount({ publicKey: zkAppAddress });

	// 		console.log('Before transaction');
	// 		const reciever = PublicKey.fromBase58('B62qq6LVZ2E3RgJoDMaCzQepYShJ339B6BW6myUrra9vgXMZbN2sGtE');
	// 		const txn = await Mina.transaction(async () => {
	// 			AccountUpdate.fundNewAccount(publicKey);
	// 			// await tokenApp.transfer(publicKey, reciever, new UInt64(100));
	// 			await tokenApp.mint(reciever, new UInt64(100));
	// 		});
	// 		await txn.prove();

	// 		console.log('After proof');

	// 		// await (
	// 		// 	await txn.sign([deployer.key, tokenPrivateKey]).send()
	// 		// ).wait();

	// 		// const tx = await Mina.transaction(async () => {
	// 		// 	const YourSmartContractInstance = new FungibleToken(zkAppAddress);
	// 		// 	await YourSmartContractInstance.mint(publicKey, new UInt64(100));
	// 		// });

	// 		const { hash } = await window.mina.sendTransaction({
	// 			transaction: txn.toJSON(),
	// 			feePayer: {
	// 				fee,
	// 				memo: 'zk',
	// 			},
	// 		});

	// 		console.log(hash);
	// 	} catch (err) {
	// 		// You may want to show the error message in your UI to the user if the transaction fails.
	// 		console.log(err);
	// 	}
	// };
	// -------------------------------------------------------
	// Create UI elements

	let hasWallet;
	if (state.hasWallet != null && !state.hasWallet) {
		const auroLink = 'https://www.aurowallet.com/';
		const auroLinkElem = (
			<a href={auroLink} target="_blank" rel="noreferrer">
				Install Auro wallet here
			</a>
		);
		hasWallet = <div>Could not find a wallet. {auroLinkElem}</div>;
	}

	const stepDisplay = transactionlink ? (
		<a href={transactionlink} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
			View transaction
		</a>
	) : (
		displayText
	);

	const setup = (
		<div style={{ fontWeight: 'bold', fontSize: '1.5rem', paddingBottom: '5rem' }}>
			{stepDisplay}
			{hasWallet}
		</div>
	);

	let accountDoesNotExist;
	if (state.hasBeenSetup && !state.accountExists) {
		const faucetLink = 'https://faucet.minaprotocol.com/?address=' + state.publicKey!.toBase58();
		accountDoesNotExist = (
			<div>
				<span style={{ paddingRight: '1rem' }}>Account does not exist.</span>
				<a href={faucetLink} target="_blank" rel="noreferrer">
					Visit the faucet to fund this fee payer account
				</a>
			</div>
		);
	}

	let mainContent;
	if (state.hasBeenSetup && state.accountExists) {
		mainContent = (
			<div style={{ justifyContent: 'center', alignItems: 'center' }}>
				<div style={{ padding: 0 }}>Current state in zkApp: {state.currentSupply!.toString()} </div>
				{/* <button onClick={onSendTransaction} disabled={state.creatingTransaction}>
					Send Transaction
				</button>
				<button onClick={onRefreshCurrentNum}>Get Latest State</button> */}
			</div>
		);
	}

	return (
		<>
			<PageHeader text="Categories" />
			<BasicButton
				type={'primary'}
				// onClick={handleClick}
			>
				TEST MINT
			</BasicButton>{' '}
			{/* <GradientBG> */}
			<div style={{ padding: 0 }}>
				<div style={{ padding: 0 }}>
					{setup}
					{accountDoesNotExist}
					{mainContent}
				</div>
			</div>
			{/* </GradientBG> */}
		</>
	);
}

Categories.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
