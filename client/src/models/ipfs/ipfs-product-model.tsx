import { type AttributeModel } from '../attribute-model';

export interface IPFSProductModel {
	name: string;
	price: string;
	category: string;
	imageHash: string[] | null;
	productAttributes: AttributeModel[] | null;
}
