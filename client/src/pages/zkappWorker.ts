/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Mina, PublicKey, fetchAccount } from 'o1js';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { FungibleToken } from '../../../contracts/src/token/FungibleToken';

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
		const { FungibleToken } = await import('../../../contracts/src/token/FungibleToken');
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
	// createUpdateTransaction: async (args: {}) => {
	// 	const transaction = await Mina.transaction(async () => {
	// 		await state.zkapp!.update();
	// 	});
	// 	state.transaction = transaction;
	// },
	proveUpdateTransaction: async (args: {}) => {
		await state.transaction!.prove();
	},
	getTransactionJSON: async (args: {}) => {
		return state.transaction!.toJSON();
	},
};

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
