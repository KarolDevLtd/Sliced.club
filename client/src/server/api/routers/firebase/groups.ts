import { z } from 'zod';
import { firestore } from 'src/firebaseConfig';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { addDoc, collection, getDocs, query as firestorequery, where, orderBy } from 'firebase/firestore';
import { type FirebaseGroupModel } from '~/models/firebase-group-model';

const groupsCollection = collection(firestore, 'groups');

//CREATE PRODUCT
export const FirebaseGroupRouter = createTRPCRouter({
	groupToCollection: publicProcedure
		.input(
			z.object({
				name: z.string(),
				creatorKey: z.string(),
				groupHash: z.string(),
				dateTime: z.string(),
			})
		)
		.mutation(({ input }) => {
			const group = {
				name: input.name,
				creatorId: input.creatorKey,
				groupHash: input.groupHash,
				datetime: input.dateTime,
			};
			//https://stackoverflow.com/questions/55558875/void-before-promise-syntax
			void addDoc(groupsCollection, group);
			return { group };
		}),

	//GET PRODUCTS
	getGroups: publicProcedure
		.input(
			z.object({
				creatorKey: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const q = firestorequery(
				groupsCollection,
				where('creatorId', '==', input.creatorKey),
				orderBy('datetime', 'desc')
			);
			const groups: FirebaseGroupModel[] = [];
			await getDocs(q).then((response) => {
				// console.log(response);
				response.forEach((doc) => {
					groups.push({
						name: doc.data().name as string,
						creatorKey: input.creatorKey!,
						// groupHash: doc.data().groupHash as string,
					});
				});
			});
			return { groups };
		}),
});
