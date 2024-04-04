/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useState } from 'react';
import { type FirebaseCommentModel } from '~/models/firebase-comment-model';
import { IPFSPostModel } from '~/models/ipfs-post-model';
import { api } from '~/trpc/react';

const PostCommentItem = (currentComment: FirebaseCommentModel) => {
	const { data: commentData } = api.PinataPost.getMessage.useQuery({ hash: currentComment.hash });

	const [comment, setComment] = useState<IPFSPostModel>();

	const [isLoading, setIsLoading] = useState(false);

	const fetchData = () => {
		setIsLoading(true);
		try {
			if (commentData) {
				setComment(commentData.post);
			}
		} catch (err) {
			console.log(err);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, [commentData]);
	return (
		<div>
			<div className="text-wrap: wrap flex flex-row justify-between text-gray-400 mt-1 mx-2">
				<div className="text-xs overflow-hidden">{currentComment.posterKey}</div>
			</div>
			<div className="text-wrap: wrap flex  px-5 py-2 bg-gray-300 w-full rounded-xl">{comment?.content}</div>
		</div>
	);
};

export default PostCommentItem;
