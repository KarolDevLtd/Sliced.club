/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import { type FirebaseCommentModel } from '~/models/firebase/firebase-comment-model';
import PostCommentItem from './PostCommentItem';

type PostCommentListProps = {
	postId: string;
	refreshComments: boolean;
	onRefresh: () => void;
};

const PostCommentList = ({ postId, refreshComments, onRefresh }: PostCommentListProps) => {
	const { data: commentsData, error, refetch } = api.FirebasePost.getComments.useQuery({ parentMessageId: postId });
	const [comments, setComments] = useState<FirebaseCommentModel[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// If refreshPosts is true, trigger a manual refetch of posts
		if (refreshComments) {
			void refetch();
			onRefresh();
		}
	}, [onRefresh, refetch, refreshComments]);

	useEffect(() => {
		setIsLoading(true);

		if (commentsData) {
			setComments(commentsData.comments);
			setIsLoading(false);
		}
	}, [commentsData]);

	useEffect(() => {
		if (error) {
			console.error('Error fetching comments:', error);
			setIsLoading(false);
		}
	}, [error]);

	return (
		<div className="flex flex-auto w-full overflow-hidden">
			{isLoading ? (
				<div>Loading...</div>
			) : (
				<ul className="overflow-auto flex flex-col">
					{comments.map((comment) => (
						<PostCommentItem key={comment.hash} hash={comment.hash} posterKey={comment.posterKey} />
					))}
				</ul>
			)}
		</div>
	);
};

export default PostCommentList;
