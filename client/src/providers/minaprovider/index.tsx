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

interface MinaContextType {
	spinUp: () => Promise<void>;
	// triggerDeployGroup: () => Promise<void>;
	logFetchAccount: (key: string) => void;
	compileContracts: (type: string) => Promise<void>;
	deployToken: () => Promise<void>;
	mintTokenTo: (pubkey: string) => Promise<void>;
	isMinaLoading: boolean;
	deployGroup: (
		maxMembers: number,
		itemPrice: number,
		groupDuration: number,
		missable: number,
		paymentDuration: number
	) => Promise<string | null>;
	addUserToGroup: (
		_groupPubKey: string,
		participantKey: string,
		maxMembers: number,
		itemPrice: number,
		groupDuration: number,
		missable: number,
		paymentDuration: number
	) => Promise<void>;
	userPayment: (
		_groupPubKey: string,
		participantKey: string,
		maxMembers: number,
		itemPrice: number,
		groupDuration: number,
		missable: number,
		paymentDuration: number,
		amountOfBids: number
	) => Promise<void>;
	// groupPublicKey: string;
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
	const [groupPublicKey, setGroupPublicKey] = useState<string>('');
	const [groupPrivateKey, setGroupPrivateKey] = useState<null | PublicKey>();
	// const [userPrivatecKey, setUserPublicKey] = useState<null | PublicKey>();
	const [deployingGroup, setDeployingGroup] = useState<boolean>(false);
	const [isMinaLoading, setIsMinaLoading] = useState<boolean>(false);
	const tokenPrivKeyBase58 = 'EKEBKqSxCj8FNSjCCuFUmzygBKsTUE1zM7wZXSTf9DjYyUgvekDn';

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
			await zkappWorkerClient.loadContracts();

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

	// useEffect(() => {
	// 	const setTokenNoDeploy = async () => {
	// 		try {
	// 			if (zkappWorkerClient) {
	// 				setIsMinaLoading(true);
	// 				const zkappWorker = zkappWorkerClient;
	// 				await compileContracts('token', true);

	// 				const tokenPrivKey = PrivateKey.random();
	// 				// const tokenPrivKey = PrivateKey.fromBase58('EKEBKqSxCj8FNSjCCuFUmzygBKsTUE1zM7wZXSTf9DjYyUgvekDn');
	// 				console.log('priv key', tokenPrivKey.toBase58());
	// 				const tokenPubKey = tokenPrivKey.toPublicKey();
	// 				console.log('Token public key:', tokenPubKey.toBase58());

	// 				await zkappWorker.initTokenInstance(tokenPubKey);

	// 				if (userPublicKey) {
	// 					await zkappWorker.deployToken(userPublicKey.toBase58(), tokenPrivKey.toBase58());

	// 					await zkappWorker.proveTransaction();
	// 					console.log('Transaction proved');
	// 					const tx = await zkappWorker.getTransactionJSON();
	// 					const { hash } = await (window as any).mina.sendTransaction({
	// 						transaction: tx,
	// 						feePayer: {
	// 							fee: 0.01 * 1e9,
	// 							memo: 'abc',
	// 						},
	// 					});
	// 					console.log('hash', hash);
	// 				}
	// 			} else {
	// 				console.log('zkappWorkerClient null in setTokenNoDeploy');
	// 			}
	// 		} catch (err) {
	// 			console.log(err);
	// 		} finally {
	// 			setIsMinaLoading(false);
	// 		}
	// 	};

	// 	setTokenNoDeploy();
	// }, [zkappWorkerClient]);

	const compileContracts = async (type: string, loadOnly?: boolean) => {
		setIsMinaLoading(true);
		try {
			if (zkappWorkerClient) {
				const areCompiled = JSON.parse((await zkappWorkerClient.areContractsCompiled()) as string);
				if (type == 'token' && !areCompiled.token) {
					// if (loadOnly) {
					// 	await zkappWorkerClient.loadTokenContract();
					// 	return;
					// }
					console.log('Compiling token contract...');
					// setDisplayText('Compiling token contract...');
					await zkappWorkerClient.compileTokenContract();
					console.log('zkApp token contract compiled');
					const tokenPubKey = PrivateKey.fromBase58(tokenPrivKeyBase58).toPublicKey();
					await zkappWorkerClient.initTokenInstance(tokenPubKey);
					// setDisplayText('zkApp token contract compiled');
				} else if (type == 'group' && !areCompiled.group) {
					console.log('Compiling group contract...');
					// if (loadOnly) {
					// 	await zkappWorkerClient.loadGroupContract();
					// 	return;
					// }
					await zkappWorkerClient.compileGroupContract();
					const tokenPubKey = PrivateKey.fromBase58(tokenPrivKeyBase58).toPublicKey();
					await zkappWorkerClient.initTokenInstance(tokenPubKey);
				}
				console.log('Finished compiling...');
			}
		} catch (err) {
			console.log(err);
		} finally {
			setIsMinaLoading(false);
		}
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

	// const triggerDeployGroup = () => {
	// 	setDeployingGroup(true);
	// };

	// const prepareForGroupDeploy = async () => {
	// 	try {
	// 		if (zkappWorkerClient == null) {
	// 			console.log('zkappWorkerClient is null');
	// 			return;
	// 		}
	// 		// const res = await zkappWorkerClient.fetchAccount({ publicKey: userPublicKey!.toBase58() });
	// 		// console.log('index fetchAcc log in groupDeploy ', res);
	// 		// const groupPrivKey = PrivateKey.random();
	// 		// const groupPubKey = groupPrivKey.toPublicKey();
	// 		// console.log('Group public key:', groupPubKey.toBase58());

	// 		// // console.log('compiling group contract...');
	// 		// // await zkappWorkerClient.compileGroupContract();
	// 		// const result = JSON.parse((await zkappWorkerClient.areContractsCompiled()) as string);
	// 		// // const x = await zkappWorkerClient.fetchAccount({ publicKey: tokenPubKey.toBase58() });

	// 		// if (!result.group) {
	// 		// 	setIsMinaLoading(true);
	// 		// 	console.log('Compiling token contract...');
	// 		// 	await zkappWorkerClient.compileGroupContract();
	// 		// }

	// 		// await zkappWorkerClient.initGroupInstance(groupPubKey);
	// 	} catch (error) {
	// 		console.log(error);
	// 	} finally {
	// 		setIsMinaLoading(false);
	// 	}
	// };
	const openGroup = async () => {
		if (zkappWorkerClient) {
			const areCompiled = JSON.parse((await zkappWorkerClient.areContractsCompiled()) as string);
			if (!areCompiled.group) {
				console.log('Compiling group contract...');
				// if (loadOnly) {
				// 	await zkappWorkerClient.loadGroupContract();
				// 	return;
				// }
				await zkappWorkerClient.compileGroupContract();
				const tokenPubKey = PrivateKey.fromBase58(tokenPrivKeyBase58).toPublicKey();
				await zkappWorkerClient.initTokenInstance(tokenPubKey);
			}
		}
	};

	const deployGroup = async (
		maxMembers: number,
		itemPrice: number,
		groupDuration: number,
		missable: number,
		paymentDuration: number
	): Promise<string | null> => {
		try {
			if (zkappWorkerClient == null) {
				console.log('zkappWorkerClient is null');
				return null;
			}
			const groupPrivKey = PrivateKey.random();
			const groupPubKey = groupPrivKey.toPublicKey();
			setGroupPublicKey(groupPubKey.toBase58());
			console.log('Group public key:', groupPubKey.toBase58());

			console.log('INTO DEPLOY');

			console.log('deploying group contract...');

			const res = await zkappWorkerClient.fetchAccount({ publicKey: userPublicKey!.toBase58() });
			console.log('index fetchAcc log in groupDeploy ', res);

			await zkappWorkerClient.initGroupInstance(groupPubKey.toBase58());

			// maxMembers: number,
			// itemPrice: number,
			// groupDuration: number,
			// missable: number,
			// paymentDuration?: number,
			// deployer?: PublicKey
			await zkappWorkerClient.deployGroup(
				userPublicKey!.toBase58(),
				groupPrivKey.toBase58(),
				maxMembers,
				itemPrice,
				groupDuration,
				missable,
				paymentDuration
			);

			setIsMinaLoading(true);
			await zkappWorkerClient.proveTransaction();
			const txn = await zkappWorkerClient.getTransactionJSON();
			const { hash } = await window.mina.sendTransaction({
				transaction: txn,
				feePayer: {
					fee: 0.01 * 1e9,
					memo: 'deploy group',
				},
			});

			console.log('hash', hash);
			await zkappWorkerClient.loopUntilConfirmed(hash);

			console.log('Group created');
			//check if worked...
			await logFetchAccount(groupPubKey.toBase58(), zkappWorkerClient);

			return groupPubKey.toBase58();
		} catch (err) {
			// You may want to show the error message in your UI to the user if the transaction fails.
			console.log(err);
			return null;
		} finally {
			//finally always executes, evenr with return...
			setDeployingGroup(false);
			setIsMinaLoading(false);
		}
	};

	const addUserToGroup = async (
		_groupPubKey: string,
		participantKey: string,
		maxMembers: number,
		itemPrice: number,
		groupDuration: number,
		missable: number,
		paymentDuration: number
	) => {
		if (userPublicKey && zkappWorkerClient) {
			// const admin = userPublicKey.toBase58();
			const groupPubKey = PublicKey.fromBase58(_groupPubKey);
			setGroupPublicKey(groupPubKey.toBase58());
			console.log(_groupPubKey, 'groupsssss');
			// console.log('admin', admin);
			const result = JSON.parse((await zkappWorkerClient.areContractsCompiled()) as string);
			console.log('here add', result);
			if (!result.group) {
				setIsMinaLoading(true);
				await zkappWorkerClient.initGroupInstance(_groupPubKey);

				const tokenPubKey = PrivateKey.fromBase58(tokenPrivKeyBase58).toPublicKey();
				await zkappWorkerClient.initTokenInstance(tokenPubKey);
				console.log('Compiling Group contract...');
				await zkappWorkerClient.compileGroupContract();
			}
			const res = await zkappWorkerClient.fetchAccount({ publicKey: _groupPubKey });
			console.log('res', res);
			setIsMinaLoading(true);
			console.log('participantKey:', participantKey);
			console.log('maxMembers:', maxMembers);
			console.log('itemPrice:', itemPrice);
			console.log('groupDuration:', groupDuration);
			console.log('missable:', missable);
			console.log('paymentDuration:', paymentDuration);

			await zkappWorkerClient.addUserToGroup(
				// admin,
				participantKey,
				maxMembers,
				itemPrice,
				groupDuration,
				missable,
				paymentDuration
			);
			await zkappWorkerClient.proveTransaction();
			console.log('Transaction proved');
			const txn = await zkappWorkerClient.getTransactionJSON();
			const { hash } = await window.mina.sendTransaction({
				transaction: txn,
				feePayer: {
					fee: 0.1 * 1e9,
					memo: 'add user to group',
				},
			});
			console.log('hash', hash);
			await zkappWorkerClient.loopUntilConfirmed(hash);
			console.log('User added');
		}
	};

	const userPayment = async (
		_groupPubKey: string,
		participantKey: string,
		maxMembers: number,
		itemPrice: number,
		groupDuration: number,
		missable: number,
		paymentDuration: number,
		amountOfBids: number
	) => {
		if (userPublicKey && zkappWorkerClient) {
			const groupPubKey = PublicKey.fromBase58(_groupPubKey);
			setGroupPublicKey(groupPubKey.toBase58());
			console.log(_groupPubKey, 'groupsssss');
			// console.log('admin', admin);
			const result = JSON.parse((await zkappWorkerClient.areContractsCompiled()) as string);
			console.log('here pay', result);
			if (!result.group) {
				setIsMinaLoading(true);
				await zkappWorkerClient.initGroupInstance(_groupPubKey);

				const tokenPubKey = PrivateKey.fromBase58(tokenPrivKeyBase58).toPublicKey();
				await zkappWorkerClient.initTokenInstance(tokenPubKey);
				console.log('Compiling Group contract...');
				await zkappWorkerClient.compileGroupContract();
			}
			if (!result.token) {
				console.log('Compiling token contract for transfer...');
				await zkappWorkerClient.compileTokenContract();
			}

			console.log('participantKey:', participantKey);
			console.log('maxMembers:', maxMembers);
			console.log('itemPrice:', itemPrice);
			console.log('groupDuration:', groupDuration);
			console.log('missable:', missable);
			console.log('paymentDuration:', paymentDuration);
			console.log('amountOfBids:', amountOfBids);
			await zkappWorkerClient.roundPayment(
				participantKey,
				maxMembers,
				itemPrice,
				groupDuration,
				missable,
				paymentDuration,
				amountOfBids
			);
			await zkappWorkerClient.proveTransaction();
			console.log('Transaction proved');
			const txn = await zkappWorkerClient.getTransactionJSON();
			const { hash } = await window.mina.sendTransaction({
				transaction: txn,
				feePayer: {
					fee: 0.1 * 1e9,
					memo: 'user payment',
				},
			});
			console.log('hash', hash);
			await zkappWorkerClient.loopUntilConfirmed(hash);
			console.log('User paid');
		}
	};

	// useEffect(() => {
	// 	if (deployingGroup) {
	// 		const deploy = async () => {
	// 			await handleDeployGroup();
	// 		};

	// 		void deploy();
	// 	}
	// }, [deployingGroup, handleDeployGroup]);

	const deployToken = async () => {
		// const tokenPrivKey = PrivateKey.random();
		const tokenPrivKey = PrivateKey.fromBase58(tokenPrivKeyBase58);
		// console.log('priv key', tokenPrivKey.toBase58());
		const tokenPubKey = tokenPrivKey.toPublicKey();
		console.log('Token public key:', tokenPubKey.toBase58());
		if (userPublicKey && zkappWorkerClient) {
			try {
				const result = JSON.parse((await zkappWorkerClient.areContractsCompiled()) as string);
				console.log('here 0', result);
				const x = await zkappWorkerClient.fetchAccount({ publicKey: tokenPubKey.toBase58() });
				if (x == undefined || x == null) {
					setIsMinaLoading(true);
					if (!result.token) {
						console.log('Compiling token contract...');
						await zkappWorkerClient.compileTokenContract();
					}
					await zkappWorkerClient.initTokenInstance(tokenPubKey);
					await zkappWorkerClient.deployToken(userPublicKey.toBase58(), tokenPrivKey.toBase58());
					await zkappWorkerClient.proveTransaction();
					console.log('Transaction proved');
					const txn = await zkappWorkerClient.getTransactionJSON();
					const { hash } = await window.mina.sendTransaction({
						transaction: txn,
						feePayer: {
							fee: 0.1 * 1e9,
							memo: 'deploy token',
						},
					});
					console.log('hash', hash);
					await zkappWorkerClient.loopUntilConfirmed(hash);
				}
				console.log('Token already exists');
			} catch (err) {
				console.log(err);
			} finally {
				setIsMinaLoading(false);
			}
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
			try {
				// const reciverPubKey = PublicKey.fromBase58(key);
				const admin = userPublicKey.toBase58();
				console.log('admin', admin);
				console.log('reciver', key);
				const result = JSON.parse((await zkappWorkerClient.areContractsCompiled()) as string);
				console.log('here 1', result);
				if (!result.token) {
					setIsMinaLoading(true);
					const tokenPrivKey = PrivateKey.fromBase58(tokenPrivKeyBase58);
					console.log('priv key', tokenPrivKey.toBase58());
					const tokenPubKey = tokenPrivKey.toPublicKey();
					await zkappWorkerClient.initTokenInstance(tokenPubKey);
					console.log('Compiling token contract...');
					await zkappWorkerClient.compileTokenContract();
				}
				//only deployer of initial token can mint
				// await zkappWorkerClient.mintToken(admin, reciverPubKey.toBase58(), 96);
				setIsMinaLoading(true);
				await zkappWorkerClient.mintToken(admin, key, 50_000_000_000_000);
				await zkappWorkerClient.proveTransaction();
				console.log('Transaction proved');
				const txn = await zkappWorkerClient.getTransactionJSON();
				const { hash } = await window.mina.sendTransaction({
					transaction: txn,
					feePayer: {
						fee: 0.1 * 1e9,
						memo: 'mint token',
					},
				});
				console.log('hash', hash);
				await zkappWorkerClient.loopUntilConfirmed(hash);
				console.log('Token minted');
			} catch (error) {
				console.log(error);
			} finally {
			}
		}
	};

	const value: MinaContextType = {
		spinUp,
		// triggerDeployGroup,
		logFetchAccount,
		compileContracts,
		deployToken,
		mintTokenTo,
		isMinaLoading,
		deployGroup,
		addUserToGroup,
		userPayment,
		// groupPublicKey,
	};

	return <MinaProviderContext.Provider value={value}>{children}</MinaProviderContext.Provider>;
};
