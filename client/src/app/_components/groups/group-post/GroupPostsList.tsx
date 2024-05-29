/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import { type FirebasePostModel } from '../../../../models/firebase/firebase-post-model';
import GroupPostItem from './GroupPostItem';

type GroupPostsListProps = {
	groupId: string;
	refreshPosts: boolean;
	onRefresh: () => void;
};

const GroupPostsList = ({ groupId, refreshPosts, onRefresh }: GroupPostsListProps) => {
	const { data: postsData, error, refetch } = api.FirebasePost.getPosts.useQuery({ groupId });
	const [posts, setPosts] = useState<FirebasePostModel[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// If refreshPosts is true, trigger a manual refetch of posts
		if (refreshPosts) {
			void refetch();
			onRefresh();
		}
	}, [onRefresh, refetch, refreshPosts]);

	useEffect(() => {
		setIsLoading(true);

		if (postsData) {
			setPosts(postsData.posts);
			setIsLoading(false);
		}
	}, [postsData]);

	useEffect(() => {
		if (error) {
			console.error('Error fetching posts:', error);
			setIsLoading(false);
		}
	}, [error]);

	return (
		<div className="flex-1 flex flex-col min-w-full mt-2">
			{isLoading ? (
				<div>Loading...</div>
			) : (
				<div className="flex flex-col h-80 overflow-hidden overflow-y-auto">
					{posts.map((post, index) => (
						<GroupPostItem
							id={index.toString()}
							key={post.hash}
							posterKey={post.posterKey}
							hash={post.hash}
							imageHash={post.imageHash}
							group={post.group}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default GroupPostsList;
