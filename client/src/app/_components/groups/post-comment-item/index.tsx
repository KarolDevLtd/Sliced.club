import { type FirebaseCommentModel } from '~/models/firebase-comment-model';

const PostCommentItem = (currentComment: FirebaseCommentModel) => {
	return (
		<div>
			<div>{currentComment.posterKey}</div>
			<div>{currentComment.hash}</div>
		</div>
	);
};

export default PostCommentItem;
