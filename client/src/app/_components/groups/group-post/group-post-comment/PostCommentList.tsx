/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react';
import { type FirebaseCommentModel } from '~/models/firebase/firebase-comment-model';
import PostCommentItem from './PostCommentItem';
import Spinner from '~/app/_components/ui/Spinner';
import { defaultPageLimit } from '~/helpers/search-helper';
import { api } from '~/trpc/react';
import { useInView } from 'react-intersection-observer';
import { DateTime } from 'luxon';

type PostCommentListProps = {
	parentMessageId: string;
	totalCommentCountNumber: number;
};

const PostCommentList = ({ parentMessageId, totalCommentCountNumber }: PostCommentListProps) => {
	const [comments, setComments] = useState<FirebaseCommentModel[]>([]);
	const [totalCommentCount, setTotalCommentCount] = useState<number>(totalCommentCountNumber);
	const [displayCommentCount, setDisplayCommentCount] = useState(defaultPageLimit);
	const {
		data: commentData,
		error,
		refetch,
		isLoading,
	} = api.FirebasePost.getComments.useQuery({ parentMessageId: parentMessageId, commentCount: displayCommentCount });

	const { ref, inView } = useInView();

	useEffect(() => {
		if (commentData) {
			setComments(commentData.comments);
		}
	}, [commentData]);

	useEffect(() => {
		void refetch();
	}, [refetch, totalCommentCount, totalCommentCountNumber]);

	useEffect(() => {
		if (inView) {
			setDisplayCommentCount((prevCount) => prevCount + defaultPageLimit);
		}
	}, [inView]);

	return (
		<div className="flex-1 flex w-full overflow-hidden">
			<ul className="flex flex-col min-w-full h-40 overflow-hidden overflow-y-auto">
				{comments.map((comment, index) => (
					<PostCommentItem
						id={index.toString()}
						key={`${comment.hash}${comment.dateTime}`}
						hash={comment.hash}
						posterKey={comment.posterKey}
						dateTime={comment.dateTime}
					/>
				))}
				{totalCommentCount > displayCommentCount ? <div ref={ref} /> : 'No more posts to display...'}
				{isLoading ? <Spinner /> : null}
			</ul>
		</div>
	);
};

export default PostCommentList;
