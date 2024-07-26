export interface IPFSMetadataModel {
	name: string;
	keyvalues: {
		type: string;
		price: string;
		creatorKey: string;
		productHash: string;
		groupHash: string;
		userKey: string;
		status: string;
	};
}
