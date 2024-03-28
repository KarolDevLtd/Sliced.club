export interface PostModel {
	id: string;
	user: string;
	title: string;
	ipfs_hash: string;
	content: string;
	timestamp: number;
	votes: number;
}
