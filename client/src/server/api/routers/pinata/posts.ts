/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const PinataPostRouter = createTRPCRouter({
	postMessage: publicProcedure
		.input(z.object({ title: z.string(), content: z.string() }))
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

	getMessage: publicProcedure.input(z.object({ hash: z.string().nullish() })).query(async ({ input }) => {
		let post;
		if (input.hash != null) {
			try {
				const response = await fetch(`https://${process.env.PINATA_GATEWAY_URL}/ipfs/${input.hash}`, {
					method: 'GET',
				});
				post = await response.json(); // This parses the JSON from the response body
			} catch (err) {
				console.log('Error getting hash from IPFS');
			}
			return { post };
		} else {
			console.log('sliced-server-msg:current query message id is null');
		}
	}),

	postComment: publicProcedure.input(z.object({ content: z.string() })).mutation(async ({ input }) => {
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
});
