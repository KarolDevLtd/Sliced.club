/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { z } from 'zod';
import { of } from 'typestub-ipfs-only-hash';
import { DateTime } from 'luxon';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const CreatePinataPostRouter = createTRPCRouter({
	postMessage: publicProcedure
		.input(z.object({ title: z.string(), content: z.string() }))
		.mutation(async ({ input }) => {
			let returnObject;
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
			const data = await response.json();
			return data;
		}),
});
