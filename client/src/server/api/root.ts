import { postRouter } from '~/server/api/routers/post';
import { CreateFirebasePostRouter, GetFirebasePostsRouter } from './routers/firebase/posts';
import { CreatePinataPostRouter, GetPinataPostRouter } from './routers/pinata/posts';
import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	post: postRouter,
	PostToFirebase: CreateFirebasePostRouter,
	GetPostsFromFirebase: GetFirebasePostsRouter,
	PostToIPFS: CreatePinataPostRouter,
	GetPostsFromIPFS: GetPinataPostRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
