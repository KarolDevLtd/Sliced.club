import { useEffect, useState } from 'react';
import UserAvatar from '~/app/_components/ui/UserAvatar';
import { sliceWalletAddress } from '~/helpers/user-helper';
import { type FirebaseCommentModel } from '~/models/firebase/firebase-comment-model';
import { type IPFSPostModel } from '~/models/ipfs/ipfs-post-model';
import { api } from '~/trpc/react';

const PostCommentItem = (currentComment: FirebaseCommentModel) => {
	const { data: commentData } = api.PinataPost.getMessage.useQuery({ hash: currentComment.hash });
	const [comment, setComment] = useState<IPFSPostModel>();
	const [isLoading, setIsLoading] = useState(false);

	const fetchData = () => {
		setIsLoading(true);
		try {
			if (commentData) {
				console.log(commentData.post);
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
		<div className="chat chat-start">
			<UserAvatar walletAddress={currentComment.posterKey} />
			<div className="chat-header">
				{sliceWalletAddress(currentComment.posterKey)}
				<time className="ms-1 text-xs opacity-50">2 hours ago</time>
			</div>
			<div className="chat-bubble">{comment?.content}</div>
		</div>
	);
};

export default PostCommentItem;
