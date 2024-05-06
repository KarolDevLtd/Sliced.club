import { z } from 'zod';
import { firestore } from 'src/firebaseConfig';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { addDoc, collection, getDocs, query as firestorequery, where, orderBy } from 'firebase/firestore';
import { type FirebaseProductModel } from '~/models/firebase-product-model';

const productsCollection = collection(firestore, 'products');

//CREATE PRODUCT
export const FirebaseProductRouter = createTRPCRouter({
	productToCollection: publicProcedure
		.input(
			z.object({
				name: z.string(),
				creatorKey: z.string(),
				productHash: z.string(),
				price: z.string(),
				dateTime: z.string(),
			})
		)
		.mutation(({ input }) => {
			const product = {
				name: input.name,
				creatorId: input.creatorKey,
				productHash: input.productHash,
				price: input.price,
				datetime: input.dateTime,
			};
			//https://stackoverflow.com/questions/55558875/void-before-promise-syntax
			void addDoc(productsCollection, product);
			return { product };
		}),

	//GET PRODUCTS
	getProducts: publicProcedure
		.input(
			z.object({
				creatorKey: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const q = firestorequery(
				productsCollection,
				where('creatorId', '==', input.creatorKey),
				orderBy('datetime', 'desc')
			);
			const products: FirebaseProductModel[] = [];
			await getDocs(q).then((response) => {
				// console.log(response);
				response.forEach((doc) => {
					products.push({
						name: doc.data().name as string,
						creatorKey: input.creatorKey!,
						price: doc.data().price as string,
						productHash: doc.data().productHash as string,
					});
				});
			});
			return { products };
		}),
});
