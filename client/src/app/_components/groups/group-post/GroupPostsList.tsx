/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import { type FirebasePostModel } from '../../../../models/firebase/firebase-post-model';
import GroupPostItem from './GroupPostItem';
import { defaultPageLimit } from '~/helpers/search-helper';
import { useInView } from 'react-intersection-observer';
import Spinner from '../../ui/Spinner';

type GroupPostsListProps = {
	groupId: string;
	refreshPosts: boolean;
	onRefresh: () => void;
};

const GroupPostsList = ({ groupId, refreshPosts, onRefresh }: GroupPostsListProps) => {
	const [posts, setPosts] = useState<FirebasePostModel[]>([]);
	const [totalPostCount, setTotalPostCount] = useState<number>(0);
	const [displayPostCount, setDisplayPostCount] = useState(defaultPageLimit);
	const {
		data: postsData,
		error,
		refetch,
		isLoading,
	} = api.FirebasePost.getPosts.useQuery({ groupId: groupId, postCount: displayPostCount });

	const { data: totalPostCountData } = api.FirebasePost.getTotalPostNumber.useQuery({ groupId: groupId });

	const { ref, inView } = useInView();

	useEffect(() => {
		// If refreshPosts is true, trigger a manual refetch of posts
		if (refreshPosts) {
			void refetch();
			onRefresh();
		}
	}, [onRefresh, refetch, refreshPosts]);

	useEffect(() => {
		if (postsData) {
			// console.log('displayed posts', postsData?.posts.length);
			setPosts(postsData.posts);
		}
	}, [postsData]);

	useEffect(() => {
		// console.log('total posts', totalPostCountData?.totalPosts);
		setTotalPostCount(totalPostCountData?.totalPosts == null ? 0 : totalPostCountData.totalPosts);
	}, [totalPostCountData]);

	useEffect(() => {
		if (error) {
			console.error('Error fetching posts:', error);
		}
	}, [error]);

	useEffect(() => {
		if (inView) {
			setDisplayPostCount((prevCount) => prevCount + defaultPageLimit);
		}
	}, [inView]);

	return (
		<div className="flex-1 flex flex-col min-w-full mt-2">
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
				{totalPostCount > displayPostCount ? <div ref={ref} /> : 'No more posts to display...'}
				{isLoading ? <Spinner /> : null}
			</div>
		</div>
	);
};

export default GroupPostsList;
