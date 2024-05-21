/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../trpc';

const productAttributesSchema = z.object({
	propertyName: z.string(),
	propertyValue: z.string().nullish(),
});
const productsAttributesSchema = z.array(productAttributesSchema);

/* eslint-disable @typescript-eslint/no-unsafe-argument */
export const PinataProductRouter = createTRPCRouter({
	postProduct: publicProcedure
		.input(
			z.object({
				name: z.string(),
				price: z.string(),
				category: z.string(),
				imageHash: z.array(z.string()),
				productAttributes: productsAttributesSchema,
				creatorKey: z.string(),
				dateTime: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			let data;
			const pinataMetadata = {
				name: input.name,
				keyvalues: {
					price: input.price,
					type: 'product',
					creatorKey: input.creatorKey,
				},
			};

			try {
				const options = {
					method: 'POST',
					headers: {
						'content-type': 'application/json',
						authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
					},
					body: JSON.stringify({
						pinataContent: input,
						pinataMetadata,
					}),
				};
				const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', options);
				data = await response.json();
			} catch (err) {
				console.log(err);
			}
			return { data };
		}),

	//TODO - Could this be refactored to be the same for posts, comments, products and groups?
	getProduct: publicProcedure.input(z.object({ hash: z.string().nullish() })).query(async ({ input }) => {
		let product;
		if (input.hash != null) {
			try {
				const response = await fetch(`https://${process.env.PINATA_GATEWAY_URL}/ipfs/${input.hash}`, {
					method: 'GET',
				});
				product = await response.json(); // This parses the JSON from the response body
			} catch (err) {
				console.log('Error getting hash from IPFS');
			}
		} else {
			console.log('sliced-server-msg:getProduct, current query product id is null');
		}
		return { product };
	}),

	//getProducts based on creator key
	getProducts: publicProcedure.input(z.object({ creatorKey: z.string().nullish() })).query(async ({ input }) => {
		let products;
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
					`https://api.pinata.cloud/data/pinList?status=pinned&metadata[keyvalues]={"type":{"value":"product","op":"eq"},"creatorKey":{"value":"${input.creatorKey}","op":"eq"}}`,
					options
				);
				products = await response.json();
			} catch (err) {
				console.log('Error getting hash from IPFS');
			}
		} else {
			console.log('sliced-server-msg:getProducts, current creatorKey id is null');
		}
		return { products };
	}),
});
