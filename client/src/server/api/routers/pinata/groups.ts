/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../trpc';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
			})
		)
		.mutation(async ({ input }) => {
			let data;
			try {
				const options = {
					method: 'POST',
					headers: {
						accept: 'application/json',
						'content-type': 'application/json',
						authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
					},
					body: JSON.stringify({ pinataContent: input }),
				};
				const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', options);
				data = await response.json();
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
				const response = await fetch(`https://${process.env.PINATA_GATEWAY_URL}/ipfs/${input.hash}`, {
					method: 'GET',
				});
				group = await response.json(); // This parses the JSON from the response body
			} catch (err) {
				console.log('Error getting hash from IPFS');
			}
		} else {
			console.log('sliced-server-msg:getGroup, current query group id is null');
		}
		return { group };
	}),
});
