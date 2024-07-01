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
