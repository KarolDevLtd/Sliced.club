import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../trpc';
import { URLBuilder, defaultPageLimit, defaultStatus } from '~/helpers/search-helper';
import { type PinataGroupsDataType, type IPFSGroupModel } from '@/models/ipfs/ipfs-group-model';
import { type IPFSGroupParticipantModel } from '@/models/ipfs/ipfs-participant-model';
import { PinataSDK } from 'pinata';
import { type IPFSSearchModel } from '@/models/ipfs/ipfs-search-model';
import Search from '@/app/_components/ui/Search';

const pinata = new PinataSDK({
	pinataJwt: process.env.PINATA_BEARER_TOKEN!,
	pinataGateway: process.env.PINATA_GATEWAY_URL,
});

// const files = await pinata.listFiles().name('pinnie');

export const PinataGroupRouter = createTRPCRouter({
	postGroup: publicProcedure
		.input(
			z.object({
				name: z.string(),
				description: z.string(),
				price: z.string(),
				duration: z.string(),
				participants: z.string(),
				instalments: z.number(),
				productHash: z.string(),
				productName: z.string().nullish(),
				productPrice: z.string().nullish(),
				creatorKey: z.string(),
				dateTime: z.string(),
				userObjectHash: z.string().nullish(),
				chainPubKey: z.string(),
				period: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			let data;
			const pinataMetadata = {
				name: input.name,
				keyvalues: {
					productHash: input.productHash,
					productPrice: input.productPrice,
					productName: input.productName,
					type: 'group',
					creatorKey: input.creatorKey,
				},
			};

			try {
				const options = {
					method: 'POST',
					headers: {
						accept: 'application/json',
						'content-type': 'application/json',
						authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
					},
					body: JSON.stringify({ pinataContent: input, pinataMetadata }),
				};
				const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', options);
				data = (await response.json()) as IPFSGroupModel;
			} catch (err) {
				console.log(err);
			}
			return { data };
		}),

	//TODO - Could this be refactored to be the same for posts, comments, groups and groups?
	getGroup: publicProcedure.input(z.object({ hash: z.string().nullish() })).query(async ({ input }) => {
		let group;
		if (input.hash != null) {
			try {
				group = (await pinata.gateways.get(input.hash)).data as unknown as IPFSGroupModel;
			} catch (err) {
				console.log('Error getting hash from IPFS');
			}
		} else {
			console.log('sliced-server-msg:getGroup, current query group id is null');
		}
		return { group };
	}),

	//getGroups based on creator key
	getGroups: publicProcedure
		.input(
			z.object({
				creatorKey: z.string().nullish(),
				groupCount: z.number(),
				searchValue: z.string(),
			})
		)
		.query(async ({ input }) => {
			let groups;

			try {
				// const options = {
				// 	method: 'GET',
				// 	headers: {
				// 		'content-type': 'application/json',
				// 		authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
				// 	},
				// };
				// const response = await fetch(
				// 	// URLBuilder(input.creatorKey ?? null, 'group', input.groupCount, input.searchValue),
				// 	URLBuilder({
				// 		creatorKey: input.creatorKey,
				// 		type: 'group',
				// 		pageLimit: input.groupCount,
				// 		searchValue: input.searchValue,
				// 	}),
				// 	options
				// );
				// groups = (await response.json()) as PinataGroupsDataType;
				const files = (await pinata
					.listFiles()
					.pageLimit(input.groupCount)
					.keyValue('type', 'group')
					.keyValue('productName', `${input.searchValue}%`, 'iLike')) as unknown as IPFSSearchModel[]; // .pageLimit(input.groupCount)

				groups = {
					rows: files,
					count: files.length,
				};
				// groups = x as IPFSSearchModel[];
				// console.log(groups);
			} catch (err) {
				console.log('Error getting hash from IPFS');
			}
			return groups;
		}),

	//getGroups based on creator key
	getUserGroups: publicProcedure
		.input(z.object({ creatorKey: z.string().nullish(), groupCount: z.number() }))
		.query(async ({ input }) => {
			let groups;
			if (input.creatorKey != null) {
				try {
					const options = {
						method: 'GET',
						headers: {
							'content-type': 'application/json',
							authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
						},
					};
					const response = await fetch(
						URLBuilder({ creatorKey: input.creatorKey, type: 'group', pageLimit: input.groupCount }),
						options
					);
					groups = (await response.json()) as IPFSGroupModel;
				} catch (err) {
					console.log('Error getting hash from IPFS');
				}
			} else {
				console.log('sliced-server-msg:getGroups, current creatorKey id is null');
			}
			return { groups };
		}),

	createGroupParticipantObject: publicProcedure
		.input(
			z.object({
				groupHash: z.string(),
				creatorKey: z.string(),
				userKey: z.string(),
				status: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			let data;
			const pinataMetadata = {
				name: `participant - ${input.groupHash}`,
				keyvalues: {
					userKey: input.userKey,
					groupHash: input.groupHash,
					type: 'participant',
					status: input.status,
				},
			};

			try {
				const options = {
					method: 'POST',
					headers: {
						accept: 'application/json',
						'content-type': 'application/json',
						authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
					},
					body: JSON.stringify({ pinataContent: input, pinataMetadata }),
				};
				const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', options);
				data = (await response.json()) as IPFSGroupParticipantModel;
				console.log(data);
			} catch (err) {
				console.log(err);
			}
			return { data };
		}),

	deleteGroupParticipantObject: publicProcedure
		.input(
			z.object({
				groupHash: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			let data;

			try {
				const options = {
					method: 'DELETE',
					headers: {
						accept: 'application/json',
						'content-type': 'application/json',
						authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
					},
				};
				const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${input.groupHash}`, options);
				data = (await response.json()) as IPFSGroupParticipantModel;
				console.log(data);
			} catch (err) {
				console.log(err);
			}
			return { data };
		}),

	getGroupParticipants: publicProcedure
		.input(z.object({ groupHash: z.string(), status: z.string().nullish() }))
		.query(async ({ input }) => {
			let participants;
			// console.log(input.groupHash);
			if (input.groupHash != null) {
				try {
					const options = {
						method: 'GET',
						headers: {
							'content-type': 'application/json',
							authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
						},
					};
					const response = await fetch(
						`https://api.pinata.cloud/data/pinList?status=${defaultStatus}&metadata[keyvalues]={"type":{"value":"${'participant'}","op":"eq"},"groupHash":{"value":"${input.groupHash}","op":"eq"}${input.status ? `,"status":{"value":"${input.status}","op":"eq"}` : ''}}&pageLimit=${defaultPageLimit}&includeCount=true`,
						options
					);
					participants = (await response.json()) as IPFSGroupParticipantModel[];
				} catch (err) {
					console.log('Error getting hash from IPFS');
				}
			} else {
				console.log('sliced-server-msg:getGroups, current creatorKey id is null');
			}
			return { participants };
		}),

	getGroupParticipant: publicProcedure
		.input(z.object({ groupHash: z.string(), userKey: z.string() }))
		.query(async ({ input }) => {
			let participant;
			// console.log(input.groupHash);
			if (input.groupHash != null) {
				try {
					const options = {
						method: 'GET',
						headers: {
							'content-type': 'application/json',
							authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
						},
					};
					const response = await fetch(
						`https://api.pinata.cloud/data/pinList?status=${defaultStatus}&metadata[keyvalues]={"type":{"value":"${'participant'}","op":"eq"},"groupHash":{"value":"${input.groupHash}","op":"eq"},"userKey":{"value":"${input.userKey}","op":"eq"}}&pageLimit=${defaultPageLimit}&includeCount=true`,
						options
					);
					participant = (await response.json()) as IPFSGroupParticipantModel;
				} catch (err) {
					console.log('Error getting hash from IPFS');
				}
			} else {
				console.log('sliced-server-msg:getGroups, current creatorKey id is null');
			}
			return participant;
		}),
});
