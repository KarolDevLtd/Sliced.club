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
