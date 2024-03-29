import React, { type SetStateAction, useState } from 'react';
import { TextInput } from '../../text-input';
import { TextArea } from '../../text-area';
import { BasicButton } from '../../basic-button';
import { BasicModal } from '../../basic-modal';

const GroupPost = () => {
	const [postOpen, setPostOpen] = useState(false);
	const [postTitle, setPostTitle] = useState('');
	const [postText, setPostText] = useState('');

	const hidePostInput = () => {
		setPostOpen(false);
	};

	const showPostInput = () => {
		setPostOpen(true);
	};

	const handlePostTitle = (e: { target: { value: SetStateAction<string> } }) => {
		setPostTitle(e.target.value);
	};

	const handlePostText = (e: { target: { value: SetStateAction<string> } }) => {
		setPostText(e.target.value);
	};

	const handleSubmit = () => {
		alert(`Post Title: ${postTitle}\nPost Text: ${postText}`);
	};

	return (
		<div className="flex flex-col w-1/3">
			<BasicButton type="primary" onClick={showPostInput}>
				Add Post
			</BasicButton>
			<BasicModal
				isOpen={postOpen}
				onClose={hidePostInput}
				header={<h2 className="text-xl font-semibold">Add Post</h2>}
				content={
					<div className="flex flex-col justify-center gap-3">
						<TextInput
							id="post-title"
							name="post-title"
							type="text"
							label="Post Title"
							onChange={handlePostTitle}
						/>
						<TextArea id="post-text" name="post-text" label="Post Text" onChange={handlePostText} />
					</div>
				}
				footer={
					<div className="w-100 flex justify-end items-center gap-2">
						<BasicButton type="primary" onClick={handleSubmit}>
							Save
						</BasicButton>
						<BasicButton type="secondary" onClick={hidePostInput}>
							Cancel
						</BasicButton>
					</div>
				}
			/>
		</div>
	);
};

export default GroupPost;
