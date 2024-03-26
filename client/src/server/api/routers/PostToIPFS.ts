/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { z } from 'zod';
import { firestore } from 'src/firebaseConfig';
import { of } from 'typestub-ipfs-only-hash';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { addDoc, collection } from 'firebase/firestore';

const sampleCollection = collection(firestore, 'sample');

export const PostToIPFSRouter = createTRPCRouter({
	postMessage: publicProcedure
		.input(z.object({ name: z.string(), email: z.string(), age: z.string() }))
		.mutation(async ({ input }) => {
			const dataX = input.name.trim();
			const hashData = await of(JSON.stringify(dataX));
			const options = {
				method: 'POST',
				headers: {
					accept: 'application/json',
					'content-type': 'application/json',
					authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
				},
				body: JSON.stringify({ pinataContent: dataX }),
			};

			fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', options)
				.then((response) => response.json())
				.then((response) => console.log(response));
		}),
});
