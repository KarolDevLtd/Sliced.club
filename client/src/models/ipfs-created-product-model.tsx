export interface IPFSUserCreatedProductModel {
	name: string;
	price: string;
	category: string;
	organiser: string;
	imageHash: string[] | null;
	currentMembers: string[] | null;
}
