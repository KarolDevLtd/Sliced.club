/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { ProviderError, SendTransactionResult } from '@aurowallet/mina-provider';
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { boolean, number } from 'zod';
import { Field, PrivateKey, PublicKey, UInt64 } from 'o1js';
import ZkappWorkerClient from '@/pages/zkappWorkerClient';
// import { useWallet } from '../WalletProvider';
import { stat } from 'fs';

interface MinaContextType {
	spinUp: () => Promise<void>;
	triggerDeployGroup: () => void;
	logFetchAccount: (key: string) => void;
	compileContracts: (type: string) => Promise<void>;
	deployToken: () => Promise<void>;
	mintTokenTo: (pubkey: string) => Promise<void>;
	isMinaLoading: boolean;
}

const MinaProviderContext = createContext<MinaContextType | undefined>(undefined);

// Custom hook to use the wallet context
export const useMinaProvider = (): MinaContextType => {
	try {
		const context = useContext(MinaProviderContext);
		if (!context) {
			throw new Error('useMinaProvider must be used within a MinaProvider');
		}
		return context;
	} catch (err) {
		throw err;
	}
};

// Define props interface for WalletProvider component
interface MinaProviderProps {
	children: ReactNode;
}

export const MinaProvider: React.FC<MinaProviderProps> = ({ children }) => {
	// const { walletAddress, isConnected } = useWallet();

	const [state, setState] = useState({
		// zkappWorkerClient: null as null | ZkappWorkerClient,
		hasWallet: null as null | boolean,
		hasBeenSetup: false,
		accountExists: false,
		currentSupply: null as null | UInt64,
		// userPublicKey: null as null | PublicKey,
		tokenPubKey: null as null | PublicKey,
		stableTokenId: null as null | Field,
		creatingTransaction: false,
	});

	const [zkappWorkerClient, setZkappWorkerClient] = useState<null | ZkappWorkerClient>();
	const [userPublicKey, setUserPublicKey] = useState<null | PublicKey>();
	const [deployingGroup, setDeployingGroup] = useState<boolean>(false);
	const [isMinaLoading, setIsMinaLoading] = useState<boolean>(false);

	const spinUp = async () => {
		try {
			setIsMinaLoading(true);
			// if (!state.hasBeenSetup) {
			// setDisplayText('Loading web worker...');
			console.log('Loading web worker...');
			const zkappWorkerClient = new ZkappWorkerClient();
			await timeout(5);

			// setDisplayText('Done loading web worker');
			console.log('Done loading web worker');

			await zkappWorkerClient.setActiveInstanceToLightnet();
			// await zkappWorkerClient.setActiveInstanceToDevnet();

			const mina = (window as any).mina;

			if (mina == null) {
				setState({ ...state, hasWallet: false });
				return;
			}

			const userPubKey58: string = (await mina.requestAccounts())[0];
			const userPublicKey = PublicKey.fromBase58(userPubKey58);
			setUserPublicKey(PublicKey.fromBase58(userPubKey58));

			// console.log(`Using key:${userPublicKey.toBase58()}`);
			// setDisplayText(`Using key:${userPublicKey.toBase58()}`);

			// setDisplayText('Checking if fee payer account exists...');
			console.log('Checking if fee payer account exists...');

			// const res = await zkappWorkerClient.fetchAccount({
			// 	publicKey: userPubKey58,
			// });
			// console.log('res', res);
			const res = await logFetchAccount(userPubKey58, zkappWorkerClient);

			console.log('userPubKey58', userPubKey58);
			console.log('userPublicKey', userPublicKey);
			const accountExists = res?.error == null;
			console.log('index fetchAcc log ', res);

			console.log('Getting zkApp state...');
			// setDisplayText('Getting zkApp state...');
			// await zkappWorkerClient.fetchAccount({ publicKey: tokenPubKey.toBase58() });

			// await zkappWorkerClient.createTransferTransaction(
			// 	publicKeyBase58,
			// 	'B62qq6LVZ2E3RgJoDMaCzQepYShJ339B6BW6myUrra9vgXMZbN2sGtE',
			// 	6
			// );
			const currentSupply = new UInt64(2);

			// const currentSupply = await zkappWorkerClient.getSupply();
			// console.log(`Current supply in zkApp: ${currentSupply.toString()}`);
			// setDisplayText('');

			console.log('Getting zkApp state Complete');

			setState({
				...state,
				// zkappWorkerClient,
				hasWallet: true,
				hasBeenSetup: true,
				// userPublicKey,
				// tokenPubKey,
				accountExists,
				currentSupply,
			});
			// }
			setZkappWorkerClient(zkappWorkerClient);
		} catch (err) {
		} finally {
			setIsMinaLoading(false);
		}
	};

	useEffect(() => {
		const setTokenNoDeploy = async () => {
			try {
				if (zkappWorkerClient) {
					setIsMinaLoading(true);
					const zkappWorker = zkappWorkerClient;
					await compileContracts('token');

					const tokenPrivKey = PrivateKey.random();
					// const tokenPrivKey = PrivateKey.fromBase58('EKEBKqSxCj8FNSjCCuFUmzygBKsTUE1zM7wZXSTf9DjYyUgvekDn');
					console.log('priv key', tokenPrivKey.toBase58());
					const tokenPubKey = tokenPrivKey.toPublicKey();
					console.log('Token public key:', tokenPubKey.toBase58());

					await zkappWorker.initTokenInstance(tokenPubKey);

					if (userPublicKey) {
						await zkappWorker.deployToken(userPublicKey.toBase58(), tokenPrivKey.toBase58());

						await zkappWorker.proveTransaction();
						console.log('Transaction proved');
						const tx = await zkappWorker.getTransactionJSON();
						const { hash } = await (window as any).mina.sendTransaction({
							transaction: tx,
							feePayer: {
								fee: 0.01 * 1e9,
								memo: 'abc',
							},
						});
						console.log('hash', hash);
					}
				} else {
					console.log('zkappWorkerClient null in setTokenNoDeploy');
				}
			} catch (err) {
				console.log(err);
			} finally {
				setIsMinaLoading(false);
			}
		};

		setTokenNoDeploy();
	}, [zkappWorkerClient]);

	const compileContracts = async (type: string) => {
		setIsMinaLoading(true);
		if (zkappWorkerClient) {
			if (type == 'token') {
				await zkappWorkerClient.loadTokenContract();
				console.log('Compiling token contract...');
				// setDisplayText('Compiling token contract...');
				await zkappWorkerClient.compileTokenContract();
				console.log('zkApp token contract compiled');
				// setDisplayText('zkApp token contract compiled');
			} else if (type == 'group') {
				console.log('Compiling group contract...');
				await zkappWorkerClient.loadGroupContract();
				await zkappWorkerClient.compileGroupContract();
			}
			console.log('Finished compiling...');
		}
		setIsMinaLoading(false);
	};

	const logFetchAccount = async (key: string, zkappWorkerClientt?: ZkappWorkerClient) => {
		console.log('pub key', key);
		console.log('zkapp worker client', zkappWorkerClientt ?? zkappWorkerClient);

		const res = await zkappWorkerClient?.fetchAccount({
			publicKey: key,
		});

		console.log('res', res);
		return res;
	};

	async function timeout(seconds: number): Promise<void> {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, seconds * 1000);
		});
	}

	const triggerDeployGroup = () => {
		setDeployingGroup(true);
	};

	const handleDeployGroup = useCallback(async () => {
		try {
			console.log('INTO DEPLOY');
			if (zkappWorkerClient == null) {
				console.log('zkappWorkerClient is null');
				return;
			}
			setIsMinaLoading(true);
			const res = await zkappWorkerClient.fetchAccount({ publicKey: userPublicKey!.toBase58() });
			console.log('index fetchAcc log in groupDeploy ', res);
			const groupPrivKey = PrivateKey.random();
			const groupPubKey = groupPrivKey.toPublicKey();
			console.log('Group public key:', groupPubKey.toBase58());
			// console.log('compiling group contract...');
			// await zkappWorkerClient.compileGroupContract();
			console.log('deploying group contract...');
			await zkappWorkerClient.deployGroup(
				userPublicKey!.toBase58(),
				groupPrivKey.toBase58(),
				48,
				24000,
				24,
				3,
				0
			);
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

			//check if worked...
			await logFetchAccount(groupPubKey.toBase58(), zkappWorkerClient);
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
		} finally {
			setDeployingGroup(false);
			setIsMinaLoading(false);
		}
	}, [deployingGroup]);

	useEffect(() => {
		if (deployingGroup) {
			const deploy = async () => {
				await handleDeployGroup();
			};

			void deploy();
		}
	}, [deployingGroup, handleDeployGroup]);

	const deployToken = async () => {
		const tokenPrivKey = PrivateKey.random();
		// const tokenPrivKey = PrivateKey.fromBase58('EKEBKqSxCj8FNSjCCuFUmzygBKsTUE1zM7wZXSTf9DjYyUgvekDn');
		console.log('priv key', tokenPrivKey.toBase58());
		const tokenPubKey = tokenPrivKey.toPublicKey();
		console.log('Token public key:', tokenPubKey.toBase58());
		if (userPublicKey && zkappWorkerClient) {
			await zkappWorkerClient.deployToken(userPublicKey.toBase58(), tokenPrivKey.toBase58());
		}
	};

	const mintTokenTo = async (key: string) => {
		// const tokenPrivKey = PrivateKey.random();
		// // const tokenPrivKey = PrivateKey.fromBase58('EKEBKqSxCj8FNSjCCuFUmzygBKsTUE1zM7wZXSTf9DjYyUgvekDn');
		// console.log('priv key', tokenPrivKey.toBase58());
		// const tokenPubKey = tokenPrivKey.toPublicKey();
		// console.log('Token public key:', tokenPubKey.toBase58());
		// if (userPublicKey && zkappWorkerClient) {
		// 	await zkappWorkerClient.deployToken(userPublicKey.toBase58(), tokenPrivKey.toBase58());
		// }
		if (userPublicKey && zkappWorkerClient && key) {
			const reciverPubKey = PublicKey.fromBase58(key);
			const admin = userPublicKey!.toBase58();
			console.log('here 0');
			//only deployer of initial token can mint
			// await zkappWorkerClient.mintToken(admin, reciverPubKey.toBase58(), 96);
			await zkappWorkerClient.mintToken(admin, reciverPubKey.toBase58(), 96);
		}
	};

	const value: MinaContextType = {
		spinUp,
		triggerDeployGroup,
		logFetchAccount,
		compileContracts,
		deployToken,
		mintTokenTo,
		isMinaLoading,
	};

	return <MinaProviderContext.Provider value={value}>{children}</MinaProviderContext.Provider>;
};
