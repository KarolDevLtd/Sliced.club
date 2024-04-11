/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { useEffect, useState } from 'react';

import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';

import { type FirebasePostModel } from '~/models/firebase-post-model';
import { type IPFSPostModel } from '~/models/ipfs-post-model';
import { api } from '~/trpc/react';
import { BasicButton } from '../../ui/basic-button';
import { FaHeart, FaRegCommentDots } from 'react-icons/fa6';
import { CiHeart } from 'react-icons/ci';
import { MdErrorOutline } from 'react-icons/md';
import { useWallet } from '~/providers/walletprovider';
import PostComment from '../post-comment';
import PostCommentList from '../post-comments-list';
import { preventActionNotLoggedIn, preventActionWalletNotConnected } from '~/helpers/user-helper';
import { toast } from 'react-toastify';
import ZoomableImage from '../../ui/zoomable-image';

const GroupPostItem = (currentPost: FirebasePostModel) => {
	const { data: postData } = api.PinataPost.getMessage.useQuery({ hash: currentPost.hash });
	const { data: likesData } = api.FirebasePost.getPostLikes.useQuery({ postId: currentPost.hash });
	const [post, setPost] = useState<IPFSPostModel>();
	const [isLoading, setIsLoading] = useState(false);
	const [likeCount, setLikeCount] = useState(0);
	const [isLiked, setIsLiked] = useState(false);
	const [showComments, setShowComments] = useState(false);
	const { isConnected, walletAddress } = useWallet();
	const [refreshComments, setRefreshComments] = useState(false);
	const [imageData, setImageData] = useState<string[]>([]);
	const [hasImage, setHasImage] = useState<boolean>(false);
	const [imageError, setImageError] = useState(false);

	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);
	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);

	const likePostToFirebase = api.FirebasePost.likePost.useMutation();
	const unlikePostToFirebase = api.FirebasePost.unlikePost.useMutation();

	const fetchData = async () => {
		setIsLoading(true);
		try {
			if (postData) {
				setPost(postData.post);
				const postLikes = likesData?.likes;
				if (postLikes?.some((e) => e.posterKey === walletAddress?.toString())) {
					setIsLiked(true);
				} else {
					setIsLiked(false);
				}
				setLikeCount(postLikes!.length);

				//Fetch post image if exists
				if (currentPost.imageHash!.length > 0) {
					setHasImage(true);
					if (Array.isArray(currentPost.imageHash)) {
						currentPost.imageHash.forEach(async (element: string) => {
							await fetchImages(element);
						});
					}
				}
			}
		} catch (err) {
			console.log(err);
			toast.error('Error fetching posts');
		}
		setIsLoading(false);
	};

	const fetchImages = async (imageHash: string) => {
		try {
			// const response = await fetch(`/api/upload/${currentPost.imageHash}`);
			const response = await fetch(`/api/upload?imageHash=${imageHash}`);
			if (response.ok) {
				const blob = await response.blob();
				const imageUrl = URL.createObjectURL(blob);
				setImageData((prevImageData) => [...prevImageData, imageUrl]);
			} else {
				console.log('Error fetching image');
				setImageError(true);
			}
		} catch (err) {
			console.log(err);
			toast.error('Error fetching one or more images');
		}
	};

	useEffect(() => {
		//Use void here as do not need result, use state set inside result
		void fetchData();
	}, [likesData?.likes, postData, walletAddress]);

	const toggleComments = () => {
		setShowComments(!showComments);
		// console.log(showComments);
	};

	const onLike = async () => {
		if (preventActionNotLoggedIn(isLoggedIn, 'Log in to like a comment')) return;
		try {
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to like a comment')) return;
			await likePostToFirebase
				.mutateAsync({ postId: currentPost.hash, userId: walletAddress!.toString() })
				.then(() => {
					setIsLiked(true);
					setLikeCount(likeCount + 1);
				});
		} catch (err) {
			console.log('Error liking');
			toast.error('Error liking post');
		}
	};

	const onUnLike = async () => {
		if (preventActionNotLoggedIn(isLoggedIn, 'Log in to unlike a comment')) return;
		try {
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to unlike a comment')) return;
			await unlikePostToFirebase
				.mutateAsync({ postId: currentPost.hash, userId: walletAddress!.toString() })
				.then(() => {
					setIsLiked(false);
					setLikeCount(likeCount - 1);
				});
		} catch (err) {
			console.log('Error unliking');
			toast.error('Error unliking post');
		}
	};

	const handleCommentSubmission = (refreshing: boolean) => {
		// After the post is submitted successfully, set refreshComment to true to trigger a refresh of comments
		setRefreshComments(refreshing);
	};

	return (
		<div className="flex flex-col my-2 rounded-xl shadow-sm bg-white border-solid border-2 border-indigo-100">
			{isLoading ? (
				'Loading...'
			) : (
				<div>
					<div className="text-wrap: wrap flex flex-row justify-between text-gray-400 mt-1 mx-2">
						<div className="text-xs overflow-hidden">{currentPost.posterKey}</div>
					</div>

					<div className="my-5">
						<div className="text-md mt-2 mx-5">{post?.title}</div>
						<div className="text-md mt-2 mx-5 text-sm">{post?.content}</div>
						<div className="flex inline-block">
							{imageData.map(function (value, index) {
								return (
									<div key={value} className="p-2">
										<ZoomableImage
											source={value}
											width={200}
											height={200}
											alt={`Uploaded image ${index}`}
										/>
									</div>
								);
							})}
						</div>
						{imageError ? (
							<div className="mt-1 text-xs text-red-error">
								{'There was an error fetching one or more image'}
							</div>
						) : null}
					</div>

					<div className="flex justify-between">
						<BasicButton type={'secondary'} onClick={toggleComments}>
							<FaRegCommentDots />
						</BasicButton>
						<BasicButton
							icon={isLiked ? <FaHeart color="Red" /> : <CiHeart />}
							type={'secondary'}
							onClick={isLiked ? onUnLike : onLike}
						>
							{likeCount}
						</BasicButton>
					</div>
					{showComments ? (
						<div>
							<PostComment
								postId={currentPost.hash}
								refetchComments={() => handleCommentSubmission(true)}
							/>
							<PostCommentList
								postId={currentPost.hash}
								refreshComments={refreshComments}
								onRefresh={() => handleCommentSubmission(false)}
							/>
						</div>
					) : null}
				</div>
			)}
		</div>
	);
};

export default GroupPostItem;
