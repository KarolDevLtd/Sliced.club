/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../trpc';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
export const PinataProductRouter = createTRPCRouter({
	postProduct: publicProcedure
		.input(
			z.object({
				name: z.string(),
				price: z.string(),
				category: z.string(),
				organiser: z.string(),
				imageHash: z.array(z.string()),
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
});
