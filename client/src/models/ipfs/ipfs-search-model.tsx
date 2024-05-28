import { type IPFSMetadataModel } from './ipfs-metdata-model';

export interface IPFSSearchModel {
	id: string;
	ipfs_pin_hash: string;
	metadata: IPFSMetadataModel;
}
