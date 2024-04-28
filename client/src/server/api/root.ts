import { FirebasePostRouter } from './routers/firebase/posts';
import { PinataPostRouter } from './routers/pinata/posts';
import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc';
import { PinataProductRouter } from './routers/pinata/products';
import { FirebaseProductRouter } from './routers/firebase/products';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	FirebasePost: FirebasePostRouter,
	FirebaseProduct: FirebaseProductRouter,
	PinataPost: PinataPostRouter,
	PinataProduct: PinataProductRouter,
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
