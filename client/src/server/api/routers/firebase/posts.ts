/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { z } from 'zod';
import { firestore } from 'src/firebaseConfig';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { addDoc, collection, getDocs, query as firestorequery, where } from 'firebase/firestore';
import { type FirebasePostModel } from '~/models/firebase-post-model';

const postCollection = collection(firestore, 'posts');

//CREATE POST
export const CreateFirebasePostRouter = createTRPCRouter({
	postToCollection: publicProcedure
		.input(z.object({ posterKey: z.string(), groupId: z.string(), messageHash: z.string() }))
		.mutation(({ input }) => {
			const post = {
				poster: input.posterKey,
				group: input.groupId,
				message: input.messageHash,
			};
			addDoc(postCollection, post);
			return { post };
		}),
});

//UPDATE POST
// export const UpdateFirebasePostRouter = createTRPCRouter({
// 	postSample: publicProcedure
// 		.input(z.object({ name: z.string(), email: z.string(), age: z.string() }))
// 		.mutation(({ input }) => {
// 			const user = {
// 				name: input.name,
// 				email: input.email,
// 				age: input.age,
// 			};

// 			addDoc(postCollection, user);
// 			return { user };
// 		}),
// });

//DELETE POST

//GET POST

//GET POSTS
export const GetFirebasePostsRouter = createTRPCRouter({
	getPosts: publicProcedure
		.input(
			z.object({
				groupId: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const q = firestorequery(postCollection, where('group', '==', input.groupId));
			const posts: FirebasePostModel[] = [];
			await getDocs(q).then((response) => {
				response.forEach((doc) => {
					console.log(doc.data());
					posts.push({
						hash: doc.data().message as string,
						group: doc.data().group as string,
						posterKey: doc.data().poster as string,
					});
				});
			});
			return { posts };
		}),
});
