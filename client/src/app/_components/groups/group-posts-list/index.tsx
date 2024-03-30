/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import { type FirebasePostModel } from '../../../../models/firebase-post-model';
import GroupPostItem from '../group-post-item';

type GroupPostsListProps = {
	groupId: string;
};

const GroupPostsList = ({ groupId }: GroupPostsListProps) => {
	const { data: postsData, error } = api.GetPostsFromFirebase.getPosts.useQuery({ groupId });
	const [posts, setPosts] = useState<FirebasePostModel[]>([]);
	const [isLoading, setIsLoading] = useState(false);

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
		<div className="flex flex-auto w-1/2 overflow-hidden">
			{isLoading ? (
				<div>Loading...</div>
			) : (
				<ul className="overflow-auto h-48 flex flex-col">
					{posts.map((post) => (
						<GroupPostItem key={post.hash} posterKey={post.posterKey} hash={post.hash} group={post.group} />
					))}
				</ul>
			)}
		</div>
	);
};

export default GroupPostsList;
