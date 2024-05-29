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
		publicKey: PublicKey;
		tokenId?: Field;
	}): ReturnType<typeof fetchAccount> {
		return await this._callFetchAccount('fetchAccount', {
			publicKey,
			tokenId: tokenId,
		});
	}

	proveTransaction() {
		return this._call('proveTransaction', {});
	}

	async getTransactionJSON() {
		const result = await this._call('getTransactionJSON', {});
		return result;
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
			publicKey58: publicKey,
		});
	}

	loadGroupContract() {
		return this._call('loadGroupContract', {});
	}

	compileGroupContract() {
		return this._call('compileGroupContract', {});
	}
	initGroupInstance(publicKey: PublicKey) {
		return this._call('initGroupInstance', {
			publicKey58: publicKey,
		});
	}
	async deployGroup(adminPublicKey: PublicKey, deployer?: PublicKey) {
		return await this._call('deployGroup', {
			adminPublicKey,
			deployer,
		});
	}
	async setGroupSettings(maxMembers: number, itemPrice: number, groupDuration: number, signature: string) {
		return await this._call('setGroupSettings', {
			maxMembers,
			itemPrice,
			groupDuration,
			signature,
		});
	}
	async addUserToGroup(userKey: PublicKey) {
		return await this._call('addUserToGroup', {
			userKey,
		});
	}
	async roundPayment(maxMembers: number, itemPrice: number, groupDuration: number, amountOfBids: number) {
		return await this._call('roundPayment', {
			maxMembers,
			itemPrice,
			groupDuration,
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

	async deployToken(adminPublicKey: PublicKey, zkappPrivateKey: PrivateKey) {
		console.log('deployToken', adminPublicKey.toBase58(), zkappPrivateKey.toBase58());
		return await this._call('deployToken', {
			adminPublicKey,
			zkappPrivateKey,
		});
	}

	async createTransferTransaction(fromKey: PublicKey, toKey: PublicKey, amount: number) {
		return await this._call('createTransferTransaction', {
			fromKey,
			toKey,
			amount,
		});
	}
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
