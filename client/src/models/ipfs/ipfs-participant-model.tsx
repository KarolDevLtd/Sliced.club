import { type IPFSSearchModel } from './ipfs-search-model';

export interface IPFSGroupParticipantModel {
	metadata: {
		keyvalues: {
			groupHash: string;
			creatorKey: string;
			userKey: string;
			status: string;
		};
	};
}

export const defaultParticipant: IPFSGroupParticipantModel = {
	metadata: {
		keyvalues: {
			groupHash: '',
			creatorKey: '',
			userKey: '',
			status: '',
		},
	},
};

export interface PinataGroupParticipantsModel {
	participants: {
		rows: IPFSSearchModel[];
		count: number;
	};
}
