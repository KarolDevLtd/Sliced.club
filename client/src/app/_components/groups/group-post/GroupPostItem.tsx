/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { useCallback, useEffect, useState } from 'react';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import { type FirebasePostModel } from '~/models/firebase/firebase-post-model';
import { type IPFSPostModel } from '~/models/ipfs/ipfs-post-model';
import { api } from '~/trpc/react';
import BasicButton from '../../ui/BasicButton';
import { FaRegCommentDots } from 'react-icons/fa6';
import { useWallet } from '~/providers/WalletProvider';
import PostComment from './group-post-comment/PostComment';
import PostCommentList from './group-post-comment/PostCommentList';
import { preventActionNotLoggedIn, preventActionWalletNotConnected, sliceWalletAddress } from '~/helpers/user-helper';
import { toast } from 'react-toastify';
import ZoomableImage from '../../ui/ZoomableImage';
import { fetchImageData } from '~/helpers/image-helper';
import { IoMdThumbsUp } from 'react-icons/io';
import { MdOutlineThumbUp } from 'react-icons/md';
import UserAvatar from '../../ui/UserAvatar';

const GroupPostItem = (currentPost: FirebasePostModel) => {
	const { data: postData } = api.PinataPost.getMessage.useQuery({ hash: currentPost.hash });
	const { data: likesData } = api.FirebasePost.getPostLikes.useQuery({ postId: currentPost.hash });
	const { data: commentCountData, refetch: refetchComments } = api.FirebasePost.getTotalCommentNumber.useQuery({
		parentMessageId: currentPost.hash,
	});

	const [post, setPost] = useState<IPFSPostModel>();
	const [isLoading, setIsLoading] = useState(false);
	const [likeCount, setLikeCount] = useState(0);
	const [isLiked, setIsLiked] = useState(false);
	const [showComments, setShowComments] = useState(false);
	const [totalCommentCount, setTotalCommentCount] = useState(0);
	const { isConnected, walletAddress } = useWallet();
	const [imageData, setImageData] = useState<string[]>([]);
	const [hasImage, setHasImage] = useState<boolean>(false);
	const [imageError, setImageError] = useState(false);

	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);
	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);

	const likePostToFirebase = api.FirebasePost.likePost.useMutation();
	const unlikePostToFirebase = api.FirebasePost.unlikePost.useMutation();

	//Get data from Firebase
	const fetchAndDisplayImages = useCallback(async () => {
		setIsLoading(true);
		try {
			if (postData) {
				setPost(postData.post);
				//Fetch post image if exists
				if (currentPost.imageHash!.length > 0) {
					setHasImage(true);
					await fetchImageData(currentPost, setHasImage, setImageData, setImageError);
				}
			}
		} catch (err) {
			console.log(err);
			toast.error('Error fetching one or more images');
		}
		setIsLoading(false);
	}, [currentPost, postData]);

	//Get likes from Firebase
	const fetchLikeData = useCallback(async () => {
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
	}, [likesData?.likes, postData, walletAddress]);

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
			// console.log('Error unliking');
			toast.error('Error unliking post');
		}
	};

	const toggleComments = () => {
		setShowComments(!showComments);
	};

	useEffect(() => {
		//Use void here as do not need result, use state set inside result
		void fetchAndDisplayImages();
	}, [fetchAndDisplayImages, postData]);

	useEffect(() => {
		void fetchLikeData();
	}, [fetchLikeData, likesData?.likes, postData, walletAddress]);

	//Post comment triggers refetch of total comment number, if this has changed re-render comment list w. new comment
	useEffect(() => {
		setTotalCommentCount(commentCountData == null ? 0 : commentCountData.totalComments);
	}, [commentCountData, totalCommentCount]);

	return (
		<div className="flex flex-col mb-4 rounded-xl bg-white border-solid border border-neutral bg-accent p-4">
			{isLoading ? (
				'Loading...'
			) : (
				<div>
					{/* <div className=""> */}
					<div className="flex items-center gap-2 mb-2">
						<UserAvatar walletAddress={currentPost.posterKey} />
						<div className="flex flex-col">
							<span className="text-sm overflow-hidden">{sliceWalletAddress(currentPost.posterKey)}</span>
							<div className="flex items-center">
								<span className="text-xs">15.05.2024</span>
								<time className="ms-1 text-xs opacity-50">22:19</time>
							</div>
						</div>
					</div>
					<div className="my-4 flex flex-col gap-1">
						<span className="text-xl">{post?.title}</span>
						<span className="text-sm">{post?.content}</span>
					</div>
					<div className="flex justify-start gap-4 my-2">
						{imageData.map(function (value, index) {
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

					<div className="border-t border-neutral flex items-center gap-2 pt-2">
						<BasicButton
							type="ghost"
							icon={isLiked ? <IoMdThumbsUp /> : <MdOutlineThumbUp />}
							iconBefore={true}
							onClick={isLiked ? onUnLike : onLike}
						>
							{}
							{likeCount}
						</BasicButton>
						<div className="flex items-center gap-1 hover:cursor-pointer" onClick={toggleComments}>
							<BasicButton
								type="ghost"
								active={showComments}
								icon={<FaRegCommentDots />}
								iconBefore={true}
							>
								{commentCountData != null ? commentCountData.totalComments : 0}
							</BasicButton>
						</div>
					</div>
					{showComments ? (
						<div>
							<PostComment postId={currentPost.hash} refetchComments={refetchComments} />
							<PostCommentList
								parentMessageId={currentPost.hash}
								totalCommentCountNumber={totalCommentCount}
							/>
						</div>
					) : null}
				</div>
			)}
		</div>
	);
};

export default GroupPostItem;
