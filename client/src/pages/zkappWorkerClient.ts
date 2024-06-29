/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { fetchAccount, PublicKey, Field, UInt64, PrivateKey } from 'o1js';

import type { ZkappWorkerRequest, ZkappWorkerReponse, WorkerFunctions } from './zkappWorker';

export default class ZkappWorkerClient {
	// ---------------------------------------------------------------------------------------

	setActiveInstanceToLightnet() {
		return this._call('setActiveInstanceToLightnet', {});
	}
	setActiveInstanceToDevnet() {
		return this._call('setActiveInstanceToDevnet', {});
	}
	setActiveInstanceToBerkeley() {
		return this._call('setActiveInstanceToBerkeley', {});
	}

	async fetchAccount({
		publicKey,
		tokenId,
	}: {
		publicKey: string;
		tokenId?: string;
	}): ReturnType<typeof fetchAccount> {
		return await this._callFetchAccount('fetchAccount', {
			publicKey,
			tokenId,
		});
	}

	proveTransaction() {
		return this._call('proveTransaction', {});
	}

	async getTransactionJSON() {
		const result = await this._call('getTransactionJSON', {});
		return result;
	}

	async loopUntilAccountExists(account: string, tokenId?: string) {
		return await this._call('loopUntilAccountExists', {
			account,
			tokenId,
		});
	}
	async loopUntilConfirmed(txId: string) {
		return await this._call('loopUntilConfirmed', {
			txId,
		});
	}

	loadContracts() {
		return this._call('loadContracts', {});
	}

	compileContracts() {
		return this._call('compileContracts', {});
	}

	initContractsInstance(groupAddress: PublicKey, tokenAddress: PublicKey) {
		return this._call('initContractsInstance', {
			groupAddress,
			tokenAddress,
		});
	}

	loadTokenContract() {
		return this._call('loadTokenContract', {});
	}

	compileTokenContract() {
		return this._call('compileTokenContract', {});
	}

	initTokenInstance(publicKey: PublicKey) {
		return this._call('initTokenInstance', {
			publicKey: publicKey,
		});
	}

	loadGroupContract() {
		return this._call('loadGroupContract', {});
	}

	compileGroupContract() {
		return this._call('compileGroupContract', {});
	}

	areContractsCompiled() {
		return this._call('areContractsCompiled', {});
	}

	initGroupInstance(publicKey: string) {
		return this._call('initGroupInstance', {
			publicKey: publicKey,
		});
	}
	async deployGroup(
		adminPublicKey: string,
		groupPrivKey: string,
		maxMembers: number,
		itemPrice: number,
		groupDuration: number,
		missable: number,
		paymentDuration?: number,
		deployer?: PublicKey
	) {
		return await this._call('deployGroup', {
			adminPublicKey,
			groupPrivKey,
			maxMembers,
			itemPrice,
			groupDuration,
			missable,
			paymentDuration,
			deployer,
		});
	}
	async addUserToGroup(
		// admin: string,
		userKey: string,
		maxMembers: number,
		itemPrice: number,
		groupDuration: number,
		missable: number,
		paymentDuration?: number
	) {
		return await this._call('addUserToGroup', {
			// admin,
			userKey,
			maxMembers,
			itemPrice,
			groupDuration,
			missable,
			paymentDuration,
		});
	}
	async roundPayment(
		userKey: string,
		maxMembers: number,
		itemPrice: number,
		groupDuration: number,
		missable: number,
		paymentDuration: number,
		amountOfBids: number
	) {
		console.log('roundPayment');
		return await this._call('roundPayment', {
			userKey,
			maxMembers,
			itemPrice,
			groupDuration,
			missable,
			paymentDuration,
			amountOfBids,
		});
	}
	async getGroupAdmin() {
		return await this._call('getGroupAdmin', {});
	}
	async getPaymentRound() {
		return await this._call('getPaymentRound', {});
	}

	async getUserStorage(userKey: PublicKey) {
		return await this._call('getUserStorage', {
			userKey,
		});
	}

	async deployToken(adminPublicKey: string, zkAppPrivateKey: string) {
		return await this._call('deployToken', {
			adminPublicKey,
			zkAppPrivateKey,
		});
	}
	async mintToken(admin: string, toKey: string, amount: number) {
		return await this._call('mintToken', {
			admin,
			toKey,
			amount,
		});
	}

	// async createTransferTransaction(fromKey: PublicKey, toKey: PublicKey, amount: number) {
	// 	return await this._call('createTransferTransaction', {
	// 		fromKey,
	// 		toKey,
	// 		amount,
	// 	});
	// }
	async getTokenSupply() {
		return await this._call('getTokenSupply', {});
		// return UInt64.fromJSON(JSON.parse(result as string));
	}

	async getBalanceOf(publicKey: PublicKey) {
		return await this._call('getBalanceOf', {
			publicKey58: publicKey.toBase58(),
		});
	}

	// ---------------------------------------------------------------------------------------

	worker: Worker;

	promises: {
		[id: number]: { resolve: (res: any) => void; reject: (err: any) => void };
	};

	nextId: number;

	constructor() {
		this.worker = new Worker(new URL('./zkappWorker.ts', import.meta.url));
		this.promises = {};
		this.nextId = 0;

		// this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
		// 	this.promises[event.data.id]?.resolve(event.data.data);
		// 	delete this.promises[event.data.id];
		// };
		this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
			const response = event.data;
			if (response.error) {
				const error = new Error(response.errorMessage);
				error.stack = response.errorStack ?? error.stack; // Preserve the original stack if available
				this.promises[response.id].reject(error);
			} else {
				this.promises[response.id].resolve(response.data);
			}
			delete this.promises[response.id];
		};
	}

	_call(fn: WorkerFunctions, args: any) {
		return new Promise((resolve, reject) => {
			this.promises[this.nextId] = { resolve, reject };

			const message: ZkappWorkerRequest = {
				id: this.nextId,
				fn,
				args,
			};

			this.worker.postMessage(message);

			this.nextId++;
		});
	}
	_callFetchAccount(fn: WorkerFunctions, args: any): Promise<ReturnType<typeof fetchAccount>> {
		return new Promise((resolve, reject) => {
			this.promises[this.nextId] = { resolve, reject };

			const message: ZkappWorkerRequest = {
				id: this.nextId,
				fn,
				args,
			};

			this.worker.postMessage(message);

			this.nextId++;
		});
	}
}
