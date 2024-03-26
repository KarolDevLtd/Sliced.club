/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { z } from 'zod';
import { firestore } from 'src/firebaseConfig';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { addDoc, collection } from 'firebase/firestore';

const sampleCollection = collection(firestore, 'sample');

export const PostToFirebaseRouter = createTRPCRouter({
	postSample: publicProcedure
		.input(z.object({ name: z.string(), email: z.string(), age: z.string() }))
		.mutation(({ input }) => {
			const user = {
				name: input.name,
				email: input.email,
				age: input.age,
			};

			addDoc(sampleCollection, user);
			return { user };
		}),
});
