/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { z } from 'zod';
import { firestore } from 'src/firebaseConfig';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { addDoc, collection, getDocs, query as firestorequery, where, orderBy, deleteDoc } from 'firebase/firestore';
import { type FirebasePostModel } from '~/models/firebase-post-model';
import { type FirebaseLikeModel } from '~/models/firebase-like-model';
import { type FirebaseCommentModel } from '~/models/firebase-comment-model';

const postCollection = collection(firestore, 'posts');
const commentCollection = collection(firestore, 'comments');
const likesCollection = collection(firestore, 'likes');

//CREATE POST
export const FirebasePostRouter = createTRPCRouter({
	postToCollection: publicProcedure
		.input(
			z.object({
				posterKey: z.string(),
				groupId: z.string(),
				messageHash: z.string(),
				imageHash: z.string().nullable(),
				dateTime: z.string(),
			})
		)
		.mutation(({ input }) => {
			const post = {
				poster: input.posterKey,
				group: input.groupId,
				message: input.messageHash,
				image: input.imageHash,
				datetime: input.dateTime,
			};
			addDoc(postCollection, post);
			return { post };
		}),

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
	getPosts: publicProcedure
		.input(
			z.object({
				groupId: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const q = firestorequery(postCollection, where('group', '==', input.groupId), orderBy('datetime', 'desc'));
			const posts: FirebasePostModel[] = [];
			await getDocs(q).then((response) => {
				response.forEach((doc) => {
					// console.log(doc.data());
					posts.push({
						hash: doc.data().message as string,
						group: doc.data().group as string,
						posterKey: doc.data().poster as string,
						imageHash: doc.data().poster as string | null,
					});
				});
			});
			return { posts };
		}),

	//LIKE POST
	likePost: publicProcedure
		.input(
			z.object({
				postId: z.string(),
				userId: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const like = {
				postId: input.postId,
				userId: input.userId,
			};
			addDoc(likesCollection, like);
			return { like };
		}),

	//UNLIKE POST
	unlikePost: publicProcedure
		.input(
			z.object({
				postId: z.string(),
				userId: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const query = firestorequery(
				likesCollection,
				where('postId', '==', input.postId),
				where('userId', '==', input.userId)
			);
			const likesSnapshot = await getDocs(query);
			likesSnapshot.forEach(async (likeDoc) => {
				await deleteDoc(likeDoc.ref);
			});
			return { success: true };
		}),

	//GET POST LIKES
	getPostLikes: publicProcedure
		.input(
			z.object({
				postId: z.string(),
				// userId: z.string(),
			})
		)
		.query(async ({ input }) => {
			const q = firestorequery(likesCollection, where('postId', '==', input.postId));
			const likes: FirebaseLikeModel[] = [];
			await getDocs(q).then((response) => {
				response.forEach((doc) => {
					likes.push({
						hash: doc.data().postId as string,
						posterKey: doc.data().userId as string,
					});
				});
			});
			return { likes };
		}),

	//CREATE COMMENT
	commentToCollection: publicProcedure
		.input(
			z.object({
				posterKey: z.string(),
				parentMessageId: z.string(),
				commentContent: z.string(),
				dateTime: z.string(),
			})
		)
		.mutation(({ input }) => {
			const comment = {
				poster: input.posterKey,
				parentMessageId: input.parentMessageId,
				commentContent: input.commentContent,
				datetime: input.dateTime,
			};
			addDoc(commentCollection, comment);
			return { comment };
		}),

	//GET COMMENTS
	getComments: publicProcedure
		.input(
			z.object({
				parentMessageId: z.string(),
			})
		)
		.query(async ({ input }) => {
			const q = firestorequery(
				commentCollection,
				where('parentMessageId', '==', input.parentMessageId),
				orderBy('datetime', 'desc')
			);
			const comments: FirebaseCommentModel[] = [];
			await getDocs(q).then((response) => {
				response.forEach((doc) => {
					comments.push({
						hash: doc.data().commentContent as string,
						posterKey: doc.data().poster as string,
					});
				});
			});
			return { comments };
		}),
});
