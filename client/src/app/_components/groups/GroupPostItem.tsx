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
import BasicButton from '../ui/BasicButton';
import { FaHeart, FaRegCommentDots } from 'react-icons/fa6';
import { CiHeart } from 'react-icons/ci';
import { useWallet } from '~/providers/walletprovider';
import PostComment from './PostComment';
import PostCommentList from './PostCommentList';
import { preventActionNotLoggedIn, preventActionWalletNotConnected } from '~/helpers/user-helper';
import { toast } from 'react-toastify';
import ZoomableImage from '../ui/ZoomableImage';

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

	//Get data from Firebase
	const fetchImageData = async () => {
		setIsLoading(true);
		try {
			if (postData) {
				setPost(postData.post);
				//Fetch post image if exists
				if (currentPost.imageHash!.length > 0) {
					setHasImage(true);
					if (Array.isArray(currentPost.imageHash)) {
						currentPost.imageHash.forEach(async (element: string) => {
							await fetchImages(element, currentPost.imageHash);
						});
					}
				}
			}
		} catch (err) {
			console.log(err);
			toast.error('Error fetching one or more images');
		}
		setIsLoading(false);
	};

	//Get image from IPFS
	const fetchImages = async (imageHash: string, imageHashes) => {
		try {
			const response = await fetch(`/api/upload?imageHash=${imageHash}`);
			if (response.ok) {
				const blob = await response.blob();
				const imageUrl = URL.createObjectURL(blob);
				//Below used to render images in the order they were uploaded to db...
				// Find the index of the current imageHash in the imageHashes array
				const index = imageHashes.indexOf(imageHash);
				if (index !== -1) {
					// Update the state at the corresponding index
					setImageData((prevImageData) => {
						const newData = [...prevImageData];
						newData[index] = imageUrl;
						return newData;
					});
				} else {
					console.log('Image hash not found in imageHashes array');
				}
			} else {
				console.log('Error fetching image');
				setImageError(true);
			}
		} catch (err) {
			console.log(err);
		}
	};

	//Get likes from Firebase
	const fetchLikeData = async () => {
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
			}
		} catch (err) {
			console.log(err);
			toast.warn('Error fetching likes for post');
		}
		setIsLoading(false);
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
			// console.log('Error liking');
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

	const toggleComments = () => {
		setShowComments(!showComments);
	};

	const handleCommentSubmission = (refreshing: boolean) => {
		// After the post is submitted successfully, set refreshComment to true to trigger a refresh of comments
		setRefreshComments(refreshing);
	};

	useEffect(() => {
		//Use void here as do not need result, use state set inside result
		void fetchImageData();
	}, [postData]);

	useEffect(() => {
		void fetchLikeData();
	}, [likesData?.likes, postData, walletAddress]);

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
						<div className="flex inline-block justify-center">
							{imageData.map((value, index) => {
								return (
									value != null && (
										<div key={index} className="m-w-1 flex justify-center">
											<ZoomableImage
												source={value}
												width={100}
												height={100}
												alt={`Uploaded image ${index}`}
											/>
										</div>
									)
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
