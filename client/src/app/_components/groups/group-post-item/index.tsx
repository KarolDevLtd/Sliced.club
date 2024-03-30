/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { useEffect, useState } from 'react';
import { type FirebasePostModel } from '~/models/firebase-post-model';
import { type IPFSPostModel } from '~/models/ipfs-post-model';
import { api } from '~/trpc/react';

const GroupPostItem = (currentPost: FirebasePostModel) => {
	const { data: postData, error } = api.GetPostsFromIPFS.getMessage.useQuery({ hash: currentPost.hash });
	const [post, setPost] = useState<IPFSPostModel>();
	const [isLoading, setIsLoading] = useState(false);
	useEffect(() => {
		setIsLoading(true);

		if (postData) {
			setPost(postData.post);
			setIsLoading(false);
		}
	}, [postData]);
	return (
		<div className="flex flex-col my-2 rounded-xl shadow-sm bg-white border-solid border-2 border-indigo-100">
			<div className="text-wrap: wrap flex flex-row justify-between text-gray-400 mt-1 mx-2">
				<div className="text-xs overflow-hidden">{currentPost.posterKey}</div>
			</div>

			<div className="my-5">
				<div className="text-md mt-2 mx-5">{post?.title}</div>
				<div className="text-md mt-2 mx-5 text-sm">{post?.content}</div>
			</div>
		</div>
	);
};

export default GroupPostItem;
