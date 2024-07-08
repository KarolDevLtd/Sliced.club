/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { ReactNode, createContext, useContext, useState } from 'react';
import { PrivateKey, PublicKey, TokenId, fetchEvents } from 'o1js';
import ZkappWorkerClient from '@/pages/zkappWorkerClient';
interface MinaContextType {
	spinUp: () => Promise<void>;
	logFetchAccount: (key: string) => void;
	compileContracts: (type?: string) => Promise<void>;
	compileContractsOnly: () => Promise<void>;
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
	getUserStorage: (userKey: string, groupAddress: string) => Promise<void>;
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
		hasWallet: null as null | boolean,
		hasBeenSetup: false,
		tokenPubKey: null as null | PublicKey,
		creatingTransaction: false,
	});

	const [zkappWorkerClient, setZkappWorkerClient] = useState<null | ZkappWorkerClient>();
	const [userPublicKey, setUserPublicKey] = useState<null | PublicKey>();
	const [groupPublicKey, setGroupPublicKey] = useState<string>('');
	const [fungibleTokenId, setFungibleTokenId] = useState<string>('');
	const [groupPrivateKey, setGroupPrivateKey] = useState<null | PublicKey>();
	// const [userPrivatecKey, setUserPublicKey] = useState<null | PublicKey>();
	const [deployingGroup, setDeployingGroup] = useState<boolean>(false);
	const [isMinaLoading, setIsMinaLoading] = useState<boolean>(false);
	const tokenPrivKeyBase58 = 'EKEBKqSxCj8FNSjCCuFUmzygBKsTUE1zM7wZXSTf9DjYyUgvekDn';
	async function timeout(seconds: number): Promise<void> {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, seconds * 1000);
		});
	}

	const spinUp = async () => {
		try {
			setIsMinaLoading(true);
			console.log('Loading web worker...');
			const zkappWorkerClient = new ZkappWorkerClient();
			await timeout(3);

			console.log('Done loading web worker');

			await zkappWorkerClient.setActiveInstanceToLightnet();
			// await zkappWorkerClient.setActiveInstanceToDevnet();

			const mina = (window as any).mina;

			if (mina == null) {
				setState({ ...state, hasWallet: false });
				return;
			}

			const userPubKey58: string = (await mina.requestAccounts())[0];
			setUserPublicKey(PublicKey.fromBase58(userPubKey58));
			console.log('Checking if fee payer account exists...');

			await logFetchAccount(userPubKey58);

			console.log('userPubKey58', userPubKey58);

			console.log('Getting zkApp state...');
			await zkappWorkerClient.loadContracts();

			console.log('Getting zkApp state Complete');

			setState({
				...state,
				hasWallet: true,
				hasBeenSetup: true,
			});
			setZkappWorkerClient(zkappWorkerClient);
		} catch (err) {
			console.log(err);
		} finally {
			setIsMinaLoading(false);
		}
	};

	const compileContracts = async (type?: string) => {
		setIsMinaLoading(true);
		try {
			if (!zkappWorkerClient) return;

			const areCompiled = JSON.parse((await zkappWorkerClient.areContractsCompiled()) as string);

			if (!type) {
				console.log('Compiling all contracts...');
				if (!areCompiled.token) await zkappWorkerClient.compileTokenContract();
				if (!areCompiled.group) await zkappWorkerClient.compileGroupContract();
			} else {
				console.log(`Compiling ${type} contract...`);
				if (type === 'token' && !areCompiled.token) await zkappWorkerClient.compileTokenContract();
				if (type === 'group' && !areCompiled.group) await zkappWorkerClient.compileGroupContract();
			}

			const tokenPubKey = PrivateKey.fromBase58(tokenPrivKeyBase58).toPublicKey();
			await zkappWorkerClient.initTokenInstance(tokenPubKey);
			setFungibleTokenId(TokenId.derive(tokenPubKey).toString());
			console.log('Finished compiling...');
		} catch (err) {
			console.error(err);
		}
	};

	const logFetchAccount = async (key: string, tokenId?: string) => {
		try {
			console.log('pub key', key);
			const res = await zkappWorkerClient?.fetchAccount({ publicKey: key, tokenId: tokenId });

			if (!res) {
				console.log('fail to fetch account');
				return null;
			}

			const { account, error } = res;

			if (account) {
				console.log('account', account);
				return account;
			} else {
				console.error('error', error);
				return error;
			}
		} catch (err) {
			console.error('Unexpected error in logFetchAccount', err);
			return null;
		}
	};

	const proveSendWaitTx = async (memo: string, fee: number = 0.01 * 1e9) => {
		if (!zkappWorkerClient) {
			console.error('zkappWorkerClient is null in proveSendWaitTx');
			return null;
		}
		setIsMinaLoading(true);
		await zkappWorkerClient.proveTransaction();
		console.log('proved transaction');
		const { hash } = await window.mina.sendTransaction({
			transaction: await zkappWorkerClient.getTransactionJSON(),
			feePayer: {
				fee,
				memo,
			},
		});

		console.log('hash', hash);
		await zkappWorkerClient.loopUntilConfirmed(hash);
		setIsMinaLoading(false);
	};

	const deployGroup = async (
		maxMembers: number,
		itemPrice: number,
		groupDuration: number,
		missable: number,
		paymentDuration: number
	): Promise<string | null> => {
		setIsMinaLoading(true);
		try {
			if (zkappWorkerClient == null) {
				console.log('zkappWorkerClient is null in deployGroup');
				return null;
			}
			const groupPrivKey = PrivateKey.random();
			const groupPubKey = groupPrivKey.toPublicKey();
			setGroupPublicKey(groupPubKey.toBase58());
			console.log('Group public key:', groupPubKey.toBase58());
			console.log('deploying group contract...');

			console.log('index fetchAcc log in groupDeploy ', await logFetchAccount(userPublicKey!.toBase58()));

			console.log('here deployGroup');
			await compileContracts();

			await zkappWorkerClient.initGroupInstance(groupPubKey.toBase58());
			// const tokenPubKey = PrivateKey.fromBase58(tokenPrivKeyBase58).toPublicKey();
			// await zkappWorkerClient.initTokenInstance(tokenPubKey);

			await zkappWorkerClient.deployGroup(
				userPublicKey!.toBase58(),
				groupPrivKey.toBase58(),
				maxMembers,
				itemPrice,
				groupDuration,
				missable,
				paymentDuration
			);

			await proveSendWaitTx('deployGroup');

			console.log('Group created');
			//check if worked...
			await logFetchAccount(groupPubKey.toBase58());

			return groupPubKey.toBase58();
		} catch (err) {
			console.log(err);
			throw err;
		} finally {
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
		setIsMinaLoading(true);
		try {
			if (!zkappWorkerClient) {
				console.error('zkappWorkerClient is null in addUserToGroup');
				return undefined;
			}
			const groupPubKey = PublicKey.fromBase58(_groupPubKey);
			setGroupPublicKey(groupPubKey.toBase58());
			console.log(_groupPubKey, 'groupsssss');
			await compileContracts('group');
			await zkappWorkerClient.initGroupInstance(groupPubKey.toBase58());

			await logFetchAccount(_groupPubKey);
			// console.log('participantKey:', participantKey);
			// console.log('maxMembers:', maxMembers);
			// console.log('itemPrice:', itemPrice);
			// console.log('groupDuration:', groupDuration);
			// console.log('missable:', missable);
			// console.log('paymentDuration:', paymentDuration);

			await zkappWorkerClient.addUserToGroup(
				participantKey,
				maxMembers,
				itemPrice,
				groupDuration,
				missable,
				paymentDuration
			);
			await proveSendWaitTx('add user to group');
			console.log('User added');
		} catch (err) {
			console.log(err);
			throw err;
		} finally {
			setIsMinaLoading(false);
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
		setIsMinaLoading(true);
		try {
			if (userPublicKey && zkappWorkerClient) {
				const groupPubKey = PublicKey.fromBase58(_groupPubKey);
				setGroupPublicKey(groupPubKey.toBase58());
				console.log(_groupPubKey, 'groupsssss');
				await compileContracts();
				await zkappWorkerClient.initGroupInstance(_groupPubKey);
				await logFetchAccount(_groupPubKey);

				// console.log('participantKey:', participantKey);
				// console.log('maxMembers:', maxMembers);
				// console.log('itemPrice:', itemPrice);
				// console.log('groupDuration:', groupDuration);
				// console.log('missable:', missable);
				// console.log('paymentDuration:', paymentDuration);
				// console.log('amountOfBids:', amountOfBids);
				await zkappWorkerClient.roundPayment(
					participantKey,
					maxMembers,
					itemPrice,
					groupDuration,
					missable,
					paymentDuration,
					amountOfBids
				);
				console.log('are we here?');
				await proveSendWaitTx('round payment');
				console.log('User paid');
			}
		} catch (err) {
			console.log(err);
			throw err;
		} finally {
			setIsMinaLoading(false);
		}
	};

	const getUserStorage = async (userKey: string, groupAddress: string) => {
		try {
			if (zkappWorkerClient) {
				await logFetchAccount(userKey);
				console.log(await zkappWorkerClient.getUserStorage(userKey, groupAddress));
				await zkappWorkerClient.initGroupInstance(groupAddress);
				const allEvents = await zkappWorkerClient.fetchGroupEvents();
				console.log('log the events', allEvents);
			}
		} catch (error) {
			console.error(error);
		}
	};
	const deployToken = async () => {
		// const tokenPrivKey = PrivateKey.random();
		const tokenPrivKey = PrivateKey.fromBase58(tokenPrivKeyBase58);
		// console.log('priv key', tokenPrivKey.toBase58());
		const tokenPubKey = tokenPrivKey.toPublicKey();
		console.log('Token public key:', tokenPubKey.toBase58());
		setIsMinaLoading(true);
		try {
			if (userPublicKey && zkappWorkerClient) {
				const result = JSON.parse((await zkappWorkerClient.areContractsCompiled()) as string);
				console.log('here 0', result);
				const res = await logFetchAccount(tokenPubKey.toBase58());

				if (res && 'balance' in res) {
					console.log('Token already exists');
				} else {
					await compileContracts('token');
					await zkappWorkerClient.deployToken(userPublicKey.toBase58(), tokenPrivKey.toBase58());
					await proveSendWaitTx('deploy token');
					console.log('Token deployed');
				}
			}
		} catch (error) {
			console.log(error);
			throw error;
		} finally {
			setIsMinaLoading(false);
		}
	};

	const mintTokenTo = async (key: string) => {
		setIsMinaLoading(true);
		try {
			if (userPublicKey && zkappWorkerClient && key) {
				const admin = userPublicKey.toBase58();
				console.log('admin', admin);
				console.log('reciver', key);
				await compileContracts('token');
				//only deployer of initial token can mint
				// await zkappWorkerClient.mintToken(admin, reciverPubKey.toBase58(), 96);
				await zkappWorkerClient.mintToken(admin, key, 50_000_000_000_000);
				await proveSendWaitTx('mint token');

				console.log('Token minted');
			}
		} catch (error) {
			console.log(error);
			throw error;
		} finally {
			setIsMinaLoading(false);
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
		getUserStorage,
		async compileContractsOnly() {
			await compileContracts();
			setIsMinaLoading(false);
		},
	};

	return <MinaProviderContext.Provider value={value}>{children}</MinaProviderContext.Provider>;
};
