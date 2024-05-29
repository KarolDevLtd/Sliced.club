/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { type FirebaseCommentModel } from '~/models/firebase/firebase-comment-model';
import PostCommentItem from './PostCommentItem';

type PostCommentListProps = {
	comments: FirebaseCommentModel[] | null;
};

//Unlike like list, we pass in the comments to this component rather than fetching them, this is because we need comment count
//in parent component so we query comments there and pass data down resulting in 1 db call and getting all info we need...
const PostCommentList = ({ comments }: PostCommentListProps) => {
	return (
		<div className="flex-1 flex w-full overflow-hidden">
			<ul className="overflow-auto flex-1 flex flex-col min-w-full">
				{comments == null
					? 'no comments'
					: comments.map((comment, index) => (
							<PostCommentItem
								id={index.toString()}
								key={comment.hash}
								hash={comment.hash}
								posterKey={comment.posterKey}
							/>
						))}
			</ul>
		</div>
	);
};

export default PostCommentList;
