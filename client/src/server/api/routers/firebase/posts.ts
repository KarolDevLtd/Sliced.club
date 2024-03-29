/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { z } from 'zod';
import { firestore } from 'src/firebaseConfig';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { addDoc, collection } from 'firebase/firestore';

const postCollection = collection(firestore, 'posts');

//CREATE POST
export const CreateFirebasePostRouter = createTRPCRouter({
	postToCollection: publicProcedure
		.input(z.object({ posterKey: z.string(), groupId: z.number(), messageHash: z.string() }))
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
export const UpdateFirebasePostRouter = createTRPCRouter({
	postSample: publicProcedure
		.input(z.object({ name: z.string(), email: z.string(), age: z.string() }))
		.mutation(({ input }) => {
			const user = {
				name: input.name,
				email: input.email,
				age: input.age,
			};

			addDoc(postCollection, user);
			return { user };
		}),
});

//DELETE POST

//GET POST

//GET POSTS
