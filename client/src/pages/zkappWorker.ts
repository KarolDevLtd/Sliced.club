/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import {
	AccountUpdate,
	Mina,
	PublicKey,
	Signature,
	UInt32,
	UInt64,
	fetchAccount,
	Field,
	TokenId,
	PrivateKey,
	checkZkappTransaction,
} from 'o1js';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

type VerificationKey = {
	data: string;
	hash: Field;
};
// ---------------------------------------------------------------------------------------
// import { GroupBasic, GroupSettings } from '../../../contracts/src/GroupBasic';
// import { FungibleToken } from '../../../contracts/src/token/FungibleToken';
// import { GroupUserStorage } from '../../../contracts/src/GroupUserStorage';
import { FungibleToken, GroupBasic, GroupUserStorage, GroupSettings } from 'sliced-contracts';

const state = {
	FungibleToken: null as null | typeof FungibleToken,
	GroupBasic: null as null | typeof GroupBasic,
	GroupUserStorage: null as null | typeof GroupUserStorage, // todo fix linting
	tokenZkapp: null as null | FungibleToken,
	groupZkapp: null as null | GroupBasic,
	groupVerificationKey: null as null | VerificationKey,
	tokenVerificationKey: null as null | VerificationKey,
	transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
	/**
	 Network setup
	*/
	setActiveInstanceToLightnet: async (args: {}) => {
		const Network = Mina.Network({
			networkId: 'testnet',
			mina: 'http://localhost:8080/graphql',
			archive: 'http://localhost:8282',
			lightnetAccountManager: 'http://localhost:8181',
		});
		console.log('Lightnet network instance configured.');
		Mina.setActiveInstance(Network);
	},
	setActiveInstanceToDevnet: async (args: {}) => {
		// mina-devnet.obscura.network/v1/f4cb4f0d-95dd-4a68-a7b7-31bf350d6ef1/graphql
		const MINAURL = 'mina-devnet.obscura.network/v1/f4cb4f0d-95dd-4a68-a7b7-31bf350d6ef1/graphql';
		// const ARCHIVEURL = 'https://archive.devnet.minaexplorer.com';
		// const Network = Mina.Network({
		// 	mina: MINAURL,
		// 	networkId: 'testnet',
		// 	// archive: ARCHIVEURL,
		// });
		const Network = Mina.Network('https://api.minascan.io/node/devnet/v1/graphql');
		console.log('Devnet network instance configured.');
		Mina.setActiveInstance(Network);
	},
	setActiveInstanceToBerkeley: async (args: {}) => {
		const MINAURL = 'https://proxy.berkeley.minaexplorer.com/graphql';
		const ARCHIVEURL = 'https://archive.berkeley.minaexplorer.com';
		const Network = Mina.Network({
			mina: MINAURL,
			archive: ARCHIVEURL,
		});
		console.log('berkeley network instance configured.');
		Mina.setActiveInstance(Network);
	},

	/** 
	General
	*/
	// Worker code
	fetchAccount: async (args: { publicKey: string; tokenId?: string }) => {
		if (!args?.publicKey) {
			throw new Error('Invalid arguments: publicKey is required');
		}

		const publicKey = PublicKey.fromBase58(args.publicKey);
		// console.log('Received args:', args);
		// console.log('Converted publicKey:', publicKey.toBase58());
		// console.log(await fetchLastBlock());
		try {
			if (args.tokenId === undefined) {
				const result = await fetchAccount({ publicKey: args.publicKey });
				// console.log('fetchAccount result:', result);
				return result;
			} else {
				const tokenId = new Field(args.tokenId);
				console.log('fetching account with token id', args.tokenId);
				const result = await fetchAccount({ publicKey, tokenId: tokenId });
				return result;
			}
		} catch (error) {
			console.error('Error in fetchAccount:', error);
			// throw error;
		}
	},
	proveTransaction: async (args: {}) => {
		await state.transaction!.prove();
	},
	getTransactionJSON: async (args: {}) => {
		return state.transaction!.toJSON();
	},
	loopUntilAccountExists: async (args: { account: string; tokenId?: string }) => {
		const account = PublicKey.fromBase58(args.account);
		for (;;) {
			try {
				const response =
					args.tokenId === undefined
						? await fetchAccount({ publicKey: account })
						: await fetchAccount({ publicKey: account, tokenId: new Field(args.tokenId) });
				if (response.account === undefined) {
					console.log('no existo on chaino');
					await new Promise((resolve) => setTimeout(resolve, 5000));
				} else {
					console.log('existo');
					return response.account;
				}
			} catch (error: any) {
				if (error.toString().includes('TypeError: Cannot destructure property ')) {
					console.log('not exists yet');
					await new Promise((resolve) => setTimeout(resolve, 5000));
				} else {
					throw error;
				}
			}
		}
	},
	loopUntilConfirmed: async (args: { txId: string }) => {
		for (;;) {
			const result = await checkZkappTransaction(args.txId);
			if (!result.success) {
				console.log('not included yet');
				await new Promise((resolve) => setTimeout(resolve, 5000));
				//todo limit amount of retries
			} else {
				return result;
			}
		}
	},
	//doesAccountExists

	/**
	General contract setup
	*/
	loadContracts: async (args: {}) => {
		state.FungibleToken = FungibleToken;
		state.GroupBasic = GroupBasic;
		state.GroupUserStorage = GroupUserStorage;
	},
	compileContracts: async (args: {}) => {
		const { verificationKey: vkToken } = await state.FungibleToken!.compile();
		const { verificationKey: vkGroup } = await state.GroupBasic!.compile();
		state.tokenVerificationKey = vkToken;
		state.groupVerificationKey = vkGroup;
	},
	initContractsInstance: async (args: { groupAddress: PublicKey; tokenAddress: PublicKey }) => {
		// const groupAddress = PublicKey.fromBase58(args.groupAddress);
		// const tokenAddress = PublicKey.fromBase58(args.tokenAddress);
		state.groupZkapp = new state.GroupBasic!(args.groupAddress);
		state.tokenZkapp = new state.FungibleToken!(args.tokenAddress);
	},
	/** 
	 Token contract setup
	*/
	loadTokenContract: async (args: {}) => {
		// const { FungibleToken } = await import('../../../contracts/src/token/FungibleToken');
		state.FungibleToken = FungibleToken;
	},
	compileTokenContract: async (args: {}) => {
		const { verificationKey: vkToken } = await state.FungibleToken!.compile();
		state.tokenVerificationKey = vkToken;
	},
	initTokenInstance: async (args: { publicKey: PublicKey }) => {
		// const publicKey = PublicKey.fromBase58(args.publicKey58);
		// console.log('initTokenInstance', publicKey.toBase58());
		state.tokenZkapp = new state.FungibleToken!(args.publicKey);
	},

	/** 
	 Group contract setup
	*/
	loadGroupContract: async (args: {}) => {
		state.GroupBasic = GroupBasic;
		state.GroupUserStorage = GroupUserStorage;
	},
	compileGroupContract: async (args: {}) => {
		const { verificationKey: vk } = await state.GroupBasic!.compile();
		state.groupVerificationKey = vk;
	},
	initGroupInstance: async (args: { publicKey: PublicKey }) => {
		// const publicKey = PublicKey.fromBase58(args.publicKey58);
		state.groupZkapp = new state.GroupBasic!(args.publicKey);
	},

	areContractsCompiled: async (args: {}) => {
		return JSON.stringify({
			token: state.tokenVerificationKey !== null,
			group: state.groupVerificationKey !== null,
		});
	},

	/** 
	Group transactions
	*/
	deployGroup: async (args: {
		adminPublicKey: string;
		groupPrivKey: string;
		maxMembers: number;
		itemPrice: number;
		groupDuration: number;
		missable: number; // number of payment that can be missed
		payemntDuration?: number;
		deployer?: PublicKey;
	}) => {
		const admin = PublicKey.fromBase58(args.adminPublicKey);
		const groupPrivKey = PrivateKey.fromBase58(args.groupPrivKey);
		const deployer = args.deployer ? args.deployer : admin;
		const instance = new GroupBasic(groupPrivKey.toPublicKey());
		const maxMembers = UInt32.from(args.maxMembers);
		const itemPrice = UInt32.from(args.itemPrice);
		const groupDuration = UInt32.from(args.groupDuration);
		const tokenAddress = state.tokenZkapp!.address;
		const missable = UInt32.from(args.missable);
		const payemntDuration = args.payemntDuration ? UInt64.from(args.payemntDuration) : UInt64.from(0);
		const groupSettings = new GroupSettings(
			maxMembers,
			itemPrice,
			groupDuration,
			tokenAddress,
			missable,
			payemntDuration
		);
		const transaction = await Mina.transaction(deployer, async () => {
			AccountUpdate.fundNewAccount(deployer);
			await instance.deploy({ admin, groupSettings });
		});
		transaction.sign([groupPrivKey]);
		state.groupZkapp = instance;
		state.transaction = transaction;
	},
	addUserToGroup: async (args: {
		userKey: PublicKey;
		maxMembers: number;
		itemPrice: number;
		groupDuration: number;
		missable: number;
		payemntDuration?: number;
	}) => {
		const userKey = args.userKey;
		const vk = state.groupVerificationKey!;
		const maxMembers = UInt32.from(args.maxMembers);
		const itemPrice = UInt32.from(args.itemPrice);
		const groupDuration = UInt32.from(args.groupDuration);
		const tokenAddress = state.tokenZkapp!.address;
		const missable = UInt32.from(args.missable);
		const payemntDuration = args.payemntDuration ? UInt64.from(args.payemntDuration) : UInt64.from(0);
		const groupSettings = new GroupSettings(
			maxMembers,
			itemPrice,
			groupDuration,
			tokenAddress,
			missable,
			payemntDuration
		);
		const transaction = await Mina.transaction(async () => {
			AccountUpdate.fundNewAccount(userKey);
			await state.groupZkapp!.addUserToGroup(groupSettings, userKey, vk);
		});
		state.transaction = transaction;
	},
	roundPayment: async (args: {
		maxMembers: number;
		itemPrice: number;
		groupDuration: number;
		missable: number;
		payemntDuration?: number;
		amountOfBids: number;
	}) => {
		const maxMembers = UInt32.from(args.maxMembers);
		const itemPrice = UInt32.from(args.itemPrice);
		const groupDuration = UInt32.from(args.groupDuration);
		const tokenAddress = state.tokenZkapp!.address;
		const missable = UInt32.from(args.missable);
		const payemntDuration = args.payemntDuration ? UInt64.from(args.payemntDuration) : UInt64.from(0);
		const groupSettings = new GroupSettings(
			maxMembers,
			itemPrice,
			groupDuration,
			tokenAddress,
			missable,
			payemntDuration
		);
		const amountOfBids = UInt64.from(args.amountOfBids);
		const transaction = await Mina.transaction(async () => {
			//gonna have to fund group with token first
			await state.groupZkapp!.roundPayment(groupSettings, amountOfBids, UInt32.from(1));
		});
		state.transaction = transaction;
	},

	/** 
	Group get functions
	*/
	getGroupAdmin: async (args: {}) => {
		const admin = state.groupZkapp!.admin.get();
		return JSON.stringify(admin.toBase58());
	},
	getPaymentRound: async (args: {}) => {
		const paymentRound = state.groupZkapp!.paymentRound.get();
		return JSON.stringify(paymentRound.toJSON());
	},

	getUserStorage: async (args: { userKey: PublicKey }) => {
		const userKey = args.userKey;
		const groupAddress = state.groupZkapp!.address;
		const derivedTokenId = TokenId.derive(groupAddress);
		await fetchAccount({
			publicKey: userKey,
			tokenId: derivedTokenId,
		});
		const userStorage = new GroupUserStorage(userKey, derivedTokenId);
		return JSON.stringify({
			payments: userStorage.payments.get(),
			overpayments: userStorage.overpayments.get(),
			compensations: userStorage.compensations.get(),
			isParticipant: userStorage.isParticipant.get(),
		});
	},

	/** 
	Token transactions
	*/

	deployToken: async (args: { adminPublicKey: string; zkAppPrivateKey: string }) => {
		// console.log('args', args);
		// const Network = Mina.Network({
		// 	networkId: 'testnet',
		// 	mina: 'http://localhost:8080/graphql',
		// 	archive: 'http://localhost:8282',
		// 	lightnetAccountManager: 'http://localhost:8181',
		// });
		// console.log('Lightnet network instance configured.');
		// Mina.setActiveInstance(Network);
		// const admin = PublicKey.fromBase58('B62qmGtQ7kn6zbw4tAYomBJJri1gZSThfQZJaMG6eR3tyNP3RiCcEQZ');
		const admin = PublicKey.fromBase58(args.adminPublicKey);
		const zkAppPrivateKey = PrivateKey.fromBase58(args.zkAppPrivateKey);
		// const zkAppPrivateKey = PrivateKey.random();
		const instance = new FungibleToken(zkAppPrivateKey.toPublicKey());
		console.log('acutal token key', zkAppPrivateKey.toPublicKey().toBase58());
		const deployTokenTx = await Mina.transaction(admin, async () => {
			AccountUpdate.fundNewAccount(admin); //todo ?!?!
			// AccountUpdate.create(admin).send({ to: zkAppPrivateKey.toPublicKey(), amount: 1 });
			await instance.deploy({
				owner: admin,
				supply: UInt64.from(10_000_000_000_000),
				symbol: 'mUSD',
				src: 'source code link',
			});
		});
		deployTokenTx.sign([zkAppPrivateKey]);
		state.transaction = deployTokenTx;
		state.tokenZkapp = instance;
	},

	mintToken: async (args: { admin: string; toKey: string; amount: number }) => {
		const toKey = PublicKey.fromBase58(args.toKey);
		const admin = PublicKey.fromBase58(args.admin);
		const amount = UInt64.from(args.amount);
		console.log('is correct token?', state.tokenZkapp!.address.toBase58());
		console.log('admin', admin.toBase58());
		const instance = new FungibleToken(state.tokenZkapp!.address);
		// console.log('is correct admin?', state.tokenZkapp!.owner.get().toBase58()
		// const target = await fetchAccount({ publicKey: toKey, tokenId: state.tokenZkapp!.deriveTokenId() }); //TODO check
		const transaction = await Mina.transaction(admin, async () => {
			// if (!target.account) {
			AccountUpdate.fundNewAccount(admin);
			// }
			await state.tokenZkapp!.mint(toKey, amount);
		});
		console.log('minting transaction', transaction.toPretty());
		state.transaction = transaction;
	},

	createTransferTransaction: async (args: { fromKey: PublicKey; toKey: PublicKey; amount: number }) => {
		const fromKey = args.fromKey;
		const toKey = args.toKey;
		const amount = UInt64.from(args.amount);
		const target = await fetchAccount({ publicKey: toKey, tokenId: state.tokenZkapp!.deriveTokenId() }); //TODO check
		const transaction = await Mina.transaction(async () => {
			if (!target.account) {
				AccountUpdate.fundNewAccount(fromKey);
			}
			await state.tokenZkapp!.transfer(fromKey, toKey, amount);
		});
		state.transaction = transaction;
	},

	/** 
	Token get functions
	*/
	getTokenSupply: async (args: {}) => {
		const currentSupply = await state.tokenZkapp!.getSupply();
		return JSON.stringify(currentSupply.toJSON());
	},
	//todo getTokenBalanceOf
	getBalanceOf: async (args: { publicKey58: string }) => {
		const publicKey = PublicKey.fromBase58(args.publicKey58);
		const balance = await state.tokenZkapp!.getBalanceOf(publicKey);
		console.log('balanceee', balance.toJSON());
		return JSON.stringify(balance.toJSON());
	},
};
// let update = AccountUpdate.create(address, tokenId);
// let accountIsNew = update.account.isNew.getAndRequireEquals();
// if the account is new, we have to fund its creation

// const target = await fetchAccount({ publicKey: targetPublicKey, tokenId });
// const tx = await Mina.transaction(
//  {
//  sender: feePayer,
//  fee: txFee,
//  memo: '',
//  },
//  () => {
//  if (!target.account) {
//  AccountUpdate.fundNewAccount(feePayer);
//  }
//  transfer
//  }
// );
// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
	id: number;
	fn: WorkerFunctions;
	args: any;
};

export type ZkappWorkerReponse = {
	id: number;
	data: any;
	error: boolean;
	errorMessage: string;
	errorStack?: string;
};

if (typeof window) {
	// if (process.browser) { //TODO check if this is correct
	addEventListener('message', async (event: MessageEvent<ZkappWorkerRequest>) => {
		try {
			const returnData = await functions[event.data.fn](event.data.args);

			const message: ZkappWorkerReponse = {
				id: event.data.id,
				data: returnData,
				error: false,
				errorMessage: '',
			};
			postMessage(message);
		} catch (error: unknown) {
			// If an error occurs, create a response with an error flag and message
			const err: Error = error as Error;
			const errorMessage: ZkappWorkerReponse = {
				id: event.data.id,
				data: null,
				error: true,
				errorMessage: err.message,
				errorStack: err.stack,
			};
			postMessage(errorMessage);
		}
	});
}
console.log('Web Worker Successfully Initialized.');
