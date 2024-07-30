import { type IPFSSearchModel } from './ipfs-search-model';

export interface IPFSGroupModel {
	name: string;
	description: string;
	currency: string;
	price: string;
	duration: string;
	participants: string;
	instalments: string;
	country: string;
	productHash: string;
	creatorKey: string;
	userObjectHash: string;
	chainPubKey: string;
	period: string;
}

export const defaultGroup: IPFSGroupModel = {
	name: '',
	description: '',
	currency: '',
	price: '',
	duration: '',
	participants: '',
	instalments: '',
	country: '',
	productHash: '',
	creatorKey: '',
	userObjectHash: '',
	chainPubKey: '',
	period: '',
};

export interface PinataGroupDataType {
	group: IPFSGroupModel;
}

export interface PinataGroupsDataType {
	rows: IPFSSearchModel[];
	count: number;
}
