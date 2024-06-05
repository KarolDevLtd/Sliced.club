import BasicButton from '~/app/_components/ui/BasicButton';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import {
	AwaitedReactNode,
	JSXElementConstructor,
	ReactElement,
	ReactNode,
	ReactPortal,
	useEffect,
	useState,
} from 'react';

import { useRouter } from 'next/router';

import { toast } from 'react-toastify';

import {
	Field,
	Mina,
	PrivateKey,
	PublicKey,
	AccountUpdate,
	UInt32,
	UInt64,
	Signature,
	fetchAccount,
	TokenId,
} from 'o1js';
// const { Field, Mina, PrivateKey, PublicKey, AccountUpdate, UInt32, UInt64, Signature, fetchAccount } = await import(
// 	'o1js'
// );
import PageHeader from '~/app/_components/ui/PageHeader';
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
		userPublicKey: null as null | PublicKey,
		tokenPubKey: null as null | PublicKey,
		stableTokenId: null as null | Field,
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

				// await zkappWorkerClient.setActiveInstanceToLightnet();
				await zkappWorkerClient.setActiveInstanceToDevnet();

				const mina = (window as any).mina;

				if (mina == null) {
					setState({ ...state, hasWallet: false });
					return;
				}

				const userPubKey58: string = (await mina.requestAccounts())[0];
				const userPublicKey = PublicKey.fromBase58(userPubKey58);

				console.log(`Using key:${userPublicKey.toBase58()}`);
				setDisplayText(`Using key:${userPublicKey.toBase58()}`);

				setDisplayText('Checking if fee payer account exists...');
				console.log('Checking if fee payer account exists...');
				const res = await zkappWorkerClient.fetchAccount({
					publicKey: userPubKey58,
				});
				const accountExists = res.error == null;

				await zkappWorkerClient.loadContracts();

				console.log('Compiling token contract...');
				setDisplayText('Compiling token contract...');
				await zkappWorkerClient.compileTokenContract();
				console.log('zkApp token contract compiled');
				setDisplayText('zkApp token contract compiled');

				const tokenPrivKey = PrivateKey.random();
				const tokenPubKey = tokenPrivKey.toPublicKey();
				console.log('Token public key:', tokenPubKey.toBase58());

				await zkappWorkerClient.initTokenInstance(tokenPubKey);

				console.log('Getting zkApp state...');
				setDisplayText('Getting zkApp state...');
				await zkappWorkerClient.fetchAccount({ publicKey: tokenPubKey.toBase58() });

				// await zkappWorkerClient.createTransferTransaction(
				// 	publicKeyBase58,
				// 	'B62qq6LVZ2E3RgJoDMaCzQepYShJ339B6BW6myUrra9vgXMZbN2sGtE',
				// 	6
				// );
				const currentSupply = new UInt64(2);
				await zkappWorkerClient.deployToken(userPubKey58, tokenPrivKey.toBase58());

				await zkappWorkerClient.proveTransaction();
				console.log('Transaction proved');
				const tx = await zkappWorkerClient.getTransactionJSON();
				const { hash } = await (window as any).mina.sendTransaction({
					transaction: tx,
					feePayer: {
						fee: 0.01 * 1e9,
						memo: 'abc',
					},
				});
				console.log('hash', hash);
				// const currentSupply = await zkappWorkerClient.getSupply();
				// console.log(`Current supply in zkApp: ${currentSupply.toString()}`);
				setDisplayText('');

				setState({
					...state,
					zkappWorkerClient,
					hasWallet: true,
					hasBeenSetup: true,
					userPublicKey,
					tokenPubKey,
					accountExists,
					currentSupply,
				});
			}
		})();
	}, [state]);

	// -------------------------------------------------------
	// Wait for account to exist, if it didn't

	// useEffect(() => {
	// 	(async () => {
	// 		if (state.hasBeenSetup && !state.accountExists) {
	// 			for (;;) {
	// 				setDisplayText('Checking if fee payer account exists...');
	// 				console.log('Checking if fee payer account exists...');
	// 				const res = await state.zkappWorkerClient!.fetchAccount({
	// 					publicKey: state.publicKey!,
	// 				});
	// 				const accountExists = res.error == null;
	// 				if (accountExists) {
	// 					break;
	// 				}
	// 				await new Promise((resolve) => setTimeout(resolve, 5000));
	// 			}
	// 			setState({ ...state, accountExists: true });
	// 		}
	// 	})();
	// }, [state.hasBeenSetup]);

	const handleDeployGroup = async () => {
		try {
			const { zkappWorkerClient } = state;
			if (zkappWorkerClient == null) {
				console.log('zkappWorkerClient is null');
				return;
			}

			await zkappWorkerClient.fetchAccount({ publicKey: state.userPublicKey!.toBase58() });

			const groupPrivKey = PrivateKey.random();
			const groupPubKey = groupPrivKey.toPublicKey();
			console.log('Group public key:', groupPubKey.toBase58());
			console.log('compiling group contract...');
			await zkappWorkerClient.compileGroupContract();
			console.log('deploying group contract...');
			await zkappWorkerClient.deployGroup(state.userPublicKey!.toBase58(), groupPrivKey.toBase58());
			await zkappWorkerClient.proveTransaction();
			const txn = await zkappWorkerClient.getTransactionJSON();
			const { hash } = await window.mina.sendTransaction({
				transaction: txn,
				feePayer: {
					fee: 0.01 * 1e9,
					memo: 'zk',
				},
			});

			console.log('hash', hash);
			// await zkappWorkerClient.loopUntilAccountExists(
			// 	groupPubKey,
			// 	// () => {
			// 	// 	console.log('no existo on chaino');
			// 	// },
			// 	true
			// );
		} catch (err) {
			// You may want to show the error message in your UI to the user if the transaction fails.
			console.log(err);
		}
	};
	const handleMint = async () => {
		try {
			const { zkappWorkerClient } = state;
			if (zkappWorkerClient == null) {
				console.log('zkappWorkerClient is null');
				return;
			}

			await zkappWorkerClient.fetchAccount({ publicKey: state.userPublicKey!.toBase58() });
			await zkappWorkerClient.fetchAccount({ publicKey: state.tokenPubKey!.toBase58() });

			const reciverPubKey = PublicKey.fromBase58('B62qpwAGs3Gy8vDWga4sCWwis5Yiv9s6puSvwZ4J6528hccPHyU3nEY');
			const admin = state.userPublicKey!.toBase58();
			console.log('here 0');
			//only deployer of initial token can mint
			// await zkappWorkerClient.mintToken(admin, reciverPubKey.toBase58(), 96);
			await zkappWorkerClient.mintToken(admin, admin, 96);
			await zkappWorkerClient.proveTransaction();
			const txn = await zkappWorkerClient.getTransactionJSON();
			const { hash } = await window.mina.sendTransaction({
				transaction: txn,
				feePayer: {
					fee: 0.1 * 1e9,
					memo: 'zk',
				},
			});
			console.log('hash', hash);
			//todo how to wait for tx to be approved ?
			await zkappWorkerClient.fetchAccount({ publicKey: reciverPubKey.toBase58() });
			console.log('balance', await zkappWorkerClient.getBalanceOf(reciverPubKey));
		} catch (err) {
			// You may want to show the error message in your UI to the user if the transaction fails.
			console.log(err);
		}
	};

	const logBalance = async () => {
		const { zkappWorkerClient } = state;
		if (zkappWorkerClient == null) {
			console.log('zkappWorkerClient is null');
			return;
		}

		await zkappWorkerClient.fetchAccount({ publicKey: state.tokenPubKey!.toBase58() });
		const reciverPubKey = PublicKey.fromBase58('B62qpwAGs3Gy8vDWga4sCWwis5Yiv9s6puSvwZ4J6528hccPHyU3nEY');
		await zkappWorkerClient.fetchAccount({ publicKey: reciverPubKey.toBase58() });
		await zkappWorkerClient.fetchAccount({
			publicKey: reciverPubKey.toBase58(),
			tokenId: TokenId.derive(state.tokenPubKey!).toString(),
		});

		// console.log(
		// 	'admin acc',
		// 	(await zkappWorkerClient.fetchAccount({ publicKey: state.userPublicKey!.toBase58() })).account
		// );
		// console.log(
		// 	'admin acc token',
		// 	(
		// 		await zkappWorkerClient.fetchAccount({
		// 			publicKey: state.userPublicKey!.toBase58(),
		// 			tokenId: TokenId.derive(state.tokenPubKey!).toString(),
		// 		})
		// 	).account
		// );
		await zkappWorkerClient.fetchAccount({ publicKey: state.tokenPubKey!.toBase58() });
		await zkappWorkerClient.fetchAccount({
			publicKey: state.tokenPubKey!.toBase58(),
			tokenId: TokenId.derive(state.tokenPubKey!).toString(),
		});
		console.log('balance', await zkappWorkerClient.getBalanceOf(state.userPublicKey!));
	};
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
			<BasicButton type={'primary'} onClick={handleDeployGroup}>
				Deploy Group
			</BasicButton>{' '}
			<BasicButton type={'primary'} onClick={handleMint}>
				Mint tokens
			</BasicButton>{' '}
			<BasicButton type={'primary'} onClick={logBalance}>
				Log token balance
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

Categories.getLayout = function getLayout(
	page:
		| string
		| number
		| boolean
		| ReactElement<any, string | JSXElementConstructor<any>>
		| Iterable<ReactNode>
		| ReactPortal
		| Promise<AwaitedReactNode>
		| null
		| undefined
) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
