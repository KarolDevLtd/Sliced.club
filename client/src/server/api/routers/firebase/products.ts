import { z } from 'zod';
import { firestore } from 'src/firebaseConfig';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { addDoc, collection, getDocs, query as firestorequery, where, orderBy, deleteDoc } from 'firebase/firestore';
import { FirebaseProductModel } from '~/models/firebase-product-model';

const productsCollection = collection(firestore, 'products');

//CREATE PRODUCT
export const FirebaseProductRouter = createTRPCRouter({
	productToCollection: publicProcedure
		.input(
			z.object({
				creatorKey: z.string(),
				productHash: z.string(),
				dateTime: z.string(),
			})
		)
		.mutation(({ input }) => {
			const product = {
				creatorId: input.creatorKey,
				productHash: input.productHash,
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
			// console.log(input.creatorKey);
			const q = firestorequery(
				productsCollection,
				where('creatorId', '==', input.creatorKey),
				orderBy('datetime', 'desc')
			);
			const products: FirebaseProductModel[] = [];
			await getDocs(q).then((response) => {
				// console.log(response);
				response.forEach((doc) => {
					console.log(doc);
					products.push({
						creatorKey: doc.data().creator as string,
						productHash: doc.data().productHash as string,
					});
				});
			});
			return { products };
		}),
});
