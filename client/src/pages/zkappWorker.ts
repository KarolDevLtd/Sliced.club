/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { AccountUpdate, Mina, PublicKey, Signature, UInt32, UInt64, fetchAccount, type Field, TokenId } from 'o1js';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

type VerificationKey = {
	data: string;
	hash: Field;
};
// ---------------------------------------------------------------------------------------

import { FungibleToken, GroupBasic, GroupUserStorage, GroupSettings } from 'sliced-contracts';

const state = {
	FungibleToken: null as null | typeof FungibleToken,
	GroupBasic: null as null | typeof GroupBasic,
	GroupUserStorage: null as null | typeof GroupUserStorage, // todo fix linting
	tokenZkapp: null as null | FungibleToken,
	groupZkapp: null as null | GroupBasic,
	groupVerificationKey: null as null | VerificationKey,
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
		const Network = Mina.Network('https://api.minascan.io/node/devnet/v1/graphql');
		console.log('Devnet network instance configured.');
		Mina.setActiveInstance(Network);
	},
	/** 
	General
	*/
	fetchAccount: async (args: { publicKey58: string; tokenId?: string }) => {
		const publicKey = PublicKey.fromBase58(args.publicKey58);
		const tokenId = args.tokenId;
		if (tokenId) {
			return await fetchAccount({ publicKey });
		} else {
			return await fetchAccount({ publicKey, tokenId });
		}
	},
	proveTransaction: async (args: {}) => {
		await state.transaction!.prove();
	},
	getTransactionJSON: async (args: {}) => {
		return state.transaction!.toJSON();
	},
	/**
	General contract setup
	*/
	loadContracts: async (args: {}) => {
		state.FungibleToken = FungibleToken;
		state.GroupBasic = GroupBasic;
		state.GroupUserStorage = GroupUserStorage;
	},
	compileContracts: async (args: {}) => {
		await state.FungibleToken!.compile();
		const { verificationKey: vk } = await state.GroupBasic!.compile();
		state.groupVerificationKey = vk;
	},
	initContractsInstance: async (args: { groupAddress: string; tokenAddress: string }) => {
		const groupAddress = PublicKey.fromBase58(args.groupAddress);
		const tokenAddress = PublicKey.fromBase58(args.tokenAddress);
		state.groupZkapp = new state.GroupBasic!(groupAddress);
		state.tokenZkapp = new state.FungibleToken!(tokenAddress);
	},
	/** 
	 Token contract setup
	*/
	loadTokenContract: async (args: {}) => {
		// const { FungibleToken } = await import('../../../contracts/src/token/FungibleToken');
		state.FungibleToken = FungibleToken;
	},
	compileTokenContract: async (args: {}) => {
		await state.FungibleToken!.compile();
	},
	initTokenInstance: async (args: { publicKey58: string }) => {
		const publicKey = PublicKey.fromBase58(args.publicKey58);
		state.tokenZkapp = new state.FungibleToken!(publicKey);
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
	initGroupInstance: async (args: { publicKey58: string }) => {
		const publicKey = PublicKey.fromBase58(args.publicKey58);
		state.groupZkapp = new state.GroupBasic!(publicKey);
	},

	/** 
	Group transactions
	*/
	deployGroup: async (args: { adminPublicKey: string; deployer?: string }) => {
		const admin = PublicKey.fromBase58(args.adminPublicKey);
		const deployer = args.deployer ? PublicKey.fromBase58(args.deployer) : admin;
		const transaction = await Mina.transaction(deployer, async () => {
			AccountUpdate.fundNewAccount(deployer);
			await state.groupZkapp!.deploy({ admin: admin });
		});
		state.transaction = transaction;
	},
	setGroupSettings: async (args: {
		maxMembers: number;
		itemPrice: number;
		groupDuration: number;
		signature: string;
	}) => {
		const maxMembers = UInt32.from(args.maxMembers);
		const itemPrice = UInt32.from(args.itemPrice);
		const groupDuration = UInt32.from(args.groupDuration);
		const tokenAddress = state.tokenZkapp!.address;
		const groupSettings = new GroupSettings(maxMembers, itemPrice, groupDuration, tokenAddress);
		const signature = Signature.fromJSON(args.signature);
		const transaction = await Mina.transaction(async () => {
			await state.groupZkapp!.setGroupSettings(groupSettings, signature);
		});
		state.transaction = transaction;
	},
	addUserToGroup: async (args: { userKey: string }) => {
		const userKey = PublicKey.fromBase58(args.userKey);
		const vk = state.groupVerificationKey!;
		const transaction = await Mina.transaction(async () => {
			AccountUpdate.fundNewAccount(userKey);
			await state.groupZkapp!.addUserToGroup(userKey, vk);
		});
		state.transaction = transaction;
	},
	roundPayment: async (args: {
		maxMembers: number;
		itemPrice: number;
		groupDuration: number;
		amountOfBids: number;
	}) => {
		const maxMembers = UInt32.from(args.maxMembers);
		const itemPrice = UInt32.from(args.itemPrice);
		const groupDuration = UInt32.from(args.groupDuration);
		const tokenAddress = state.tokenZkapp!.address;
		const groupSettings = new GroupSettings(maxMembers, itemPrice, groupDuration, tokenAddress);
		const amountOfBids = UInt64.from(args.amountOfBids);
		const transaction = await Mina.transaction(async () => {
			//gonna have to fund group with token first
			await state.groupZkapp!.roundPayment(groupSettings, amountOfBids);
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

	getUserStorage: async (args: { userKey: string }) => {
		const userKey = PublicKey.fromBase58(args.userKey);
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
	createTransferTransaction: async (args: { fromKey: string; toKey: string; amount: number }) => {
		const fromKey = PublicKey.fromBase58(args.fromKey);
		const toKey = PublicKey.fromBase58(args.toKey);
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
	getBalanceOf: async (args: { publicKey58: string }) => {
		const publicKey = PublicKey.fromBase58(args.publicKey58);
		const balance = await state.tokenZkapp!.getBalanceOf(publicKey);
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
			const message: string = (error as Error).message;
			const errorMessage: ZkappWorkerReponse = {
				id: event.data.id,
				data: null,
				error: true,
				errorMessage: message,
			};
			postMessage(errorMessage);
		}
	});
}
console.log('Web Worker Successfully Initialized.');
