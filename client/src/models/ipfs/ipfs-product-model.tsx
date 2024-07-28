import { type AttributeModel } from '../attribute-model';
import { type IPFSSearchModel } from './ipfs-search-model';

export interface IPFSProductModel {
	name: string;
	price: string;
	category: string;
	imageHash: string[] | null;
	productAttributes: AttributeModel[] | null;
}

export const defaultProduct: IPFSProductModel = {
	name: '',
	price: '',
	category: '',
	imageHash: null,
	productAttributes: null,
};

export interface PinataProductDataType {
	product: IPFSProductModel;
}

export interface PinataProductsDataType {
	products: {
		rows: IPFSProductModel[];
		count: number;
	};
}
