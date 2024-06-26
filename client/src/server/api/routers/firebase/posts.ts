import { z } from 'zod';
import { firestore } from '~/firebaseConfig';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import {
	addDoc,
	collection,
	getDocs,
	query as firestorequery,
	where,
	orderBy,
	deleteDoc,
	limit,
} from 'firebase/firestore';
import { type FirebasePostModel } from '~/models/firebase/firebase-post-model';
import { type FirebaseLikeModel } from '~/models/firebase/firebase-like-model';
import { type FirebaseCommentModel } from '~/models/firebase/firebase-comment-model';

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
				imageHash: z.array(z.string().nullish()),
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
			//https://stackoverflow.com/questions/55558875/void-before-promise-syntax
			void addDoc(postCollection, post);
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

	//GET POSTS W. LIMIT (INFINITE SCROLL)
	getPosts: publicProcedure
		.input(
			z.object({
				groupId: z.string().nullish(),
				postCount: z.number(),
			})
		)
		.query(async ({ input }) => {
			const posts: FirebasePostModel[] = [];
			if (input.groupId != null) {
				const q = firestorequery(
					postCollection,
					where('group', '==', input.groupId),
					orderBy('datetime', 'desc'),
					limit(input.postCount)
				);
				await getDocs(q).then((response) => {
					response.forEach((doc) => {
						// console.log(doc.data());
						posts.push({
							id: doc.id,
							hash: doc.data().message as string,
							group: doc.data().group as string,
							posterKey: doc.data().poster as string,
							imageHash: doc.data().image as string | null,
						});
					});
				});
			} else {
				console.log('sliced-server-msg:getposts, current query group id is null');
			}
			return { posts };
		}),

	//GET NUMBER OF POSTS FOR GROUP
	getTotalPostNumber: publicProcedure.input(z.object({ groupId: z.string().nullish() })).query(async ({ input }) => {
		const totalQuery = firestorequery(postCollection, where('group', '==', input.groupId));

		let totalPosts = 0;
		await getDocs(totalQuery).then((response) => {
			totalPosts = response.size;
		});
		return { totalPosts };
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
			void addDoc(likesCollection, like);
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
			likesSnapshot.forEach((likeDoc) => {
				void deleteDoc(likeDoc.ref);
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
						id: doc.id,
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
			void addDoc(commentCollection, comment);
			return { comment };
		}),

	//GET COMMENTS W NUMBER OF COMMENTS (INFINITE SCROLL)
	getComments: publicProcedure
		.input(
			z.object({
				parentMessageId: z.string(),
				commentCount: z.number(),
			})
		)
		.query(async ({ input }) => {
			const q = firestorequery(
				commentCollection,
				where('parentMessageId', '==', input.parentMessageId),
				orderBy('datetime', 'desc'),
				limit(input.commentCount)
			);
			const comments: FirebaseCommentModel[] = [];
			await getDocs(q).then((response) => {
				response.forEach((doc) => {
					comments.push({
						id: doc.id,
						hash: doc.data().commentContent as string,
						posterKey: doc.data().poster as string,
						dateTime: doc.data().datetime as string,
					});
				});
			});
			return { comments };
		}),

	//GET NUMBER OF POSTS FOR GROUP
	getTotalCommentNumber: publicProcedure
		.input(z.object({ parentMessageId: z.string().nullish() }))
		.query(async ({ input }) => {
			const totalQuery = firestorequery(commentCollection, where('parentMessageId', '==', input.parentMessageId));

			let totalComments = 0;
			await getDocs(totalQuery).then((response) => {
				totalComments = response.size;
			});
			return { totalComments };
		}),
});
