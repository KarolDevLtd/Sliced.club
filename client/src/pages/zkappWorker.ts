/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Mina, PublicKey, UInt64, fetchAccount } from 'o1js';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import { FungibleToken } from 'sliced-contracts';
// import { FungibleToken } from './FungibleToken';
// const { FungibleToken } =
// await import("@/contracts/snapshotVoteProof");

const state = {
	FungibleToken: null as null | typeof FungibleToken,
	zkapp: null as null | FungibleToken,
	transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
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
	loadContract: async (args: {}) => {
		// const { FungibleToken } = await import('../../../contracts/src/token/FungibleToken');
		state.FungibleToken = FungibleToken;
	},
	compileContract: async (args: {}) => {
		await state.FungibleToken!.compile();
	},
	fetchAccount: async (args: { publicKey58: string }) => {
		const publicKey = PublicKey.fromBase58(args.publicKey58);
		return await fetchAccount({ publicKey });
	},
	initZkappInstance: async (args: { publicKey58: string }) => {
		const publicKey = PublicKey.fromBase58(args.publicKey58);
		state.zkapp = new state.FungibleToken!(publicKey);
	},
	getSupply: async (args: {}) => {
		const currentSupply = await state.zkapp!.getSupply();
		return JSON.stringify(currentSupply.toJSON());
	},
	getBalanceOf: async (args: { publicKey58: string }) => {
		const publicKey = PublicKey.fromBase58(args.publicKey58);
		const balance = await state.zkapp!.getBalanceOf(publicKey);
		return JSON.stringify(balance.toJSON());
	},
	createTransferTransaction: async (args: { fromKey: string; toKey: string; amount: number }) => {
		const transaction = await Mina.transaction(async () => {
			const fromKey = PublicKey.fromBase58(args.fromKey);
			const toKey = PublicKey.fromBase58(args.toKey);
			const amount = UInt64.from(args.amount);
			console.log('wehere');
			await state.zkapp!.transfer(fromKey, toKey, amount);
		});
		state.transaction = transaction;
	},
	// createUpdateTransaction: async (args: {}) => {
	// 	const transaction = await Mina.transaction(async () => {
	// 		await state.zkapp!.update();
	// 	});
	// 	state.transaction = transaction;
	// },
	proveTransaction: async (args: {}) => {
		await state.transaction!.prove();
	},
	getTransactionJSON: async (args: {}) => {
		return state.transaction!.toJSON();
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
};

if (typeof window !== 'undefined') {
	addEventListener('message', async (event: MessageEvent<ZkappWorkerRequest>) => {
		const returnData = await functions[event.data.fn](event.data.args);

		const message: ZkappWorkerReponse = {
			id: event.data.id,
			data: returnData,
		};
		postMessage(message);
	});
}

console.log('Web Worker Successfully Initialized.');
