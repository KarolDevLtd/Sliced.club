/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable react/no-children-prop */
import React, { type SetStateAction, useState } from 'react';
import { TextInput } from '../../ui/text-input';
import { TextArea } from '../../ui/text-area';
import { BasicButton } from '../../ui/basic-button';
import { BasicModal } from '../../ui/basic-modal';
import { useWallet } from '~/providers/walletprovider';
import { api } from '~/trpc/react';

type GroupPostInputProps = {
	groupId: string;
};

const GroupPostInput = ({ groupId }: GroupPostInputProps) => {
	const [postOpen, setPostOpen] = useState(false);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const { isConnected, walletAddress } = useWallet();

	const postToIPFS = api.PostToIPFS.postMessage.useMutation();
	const postToFirebase = api.PostToFirebase.postToCollection.useMutation();

	const hidePostInput = () => {
		setPostOpen(false);
	};

	const showPostInput = () => {
		setPostOpen(true);
	};

	const handleTitle = (e: { target: { value: SetStateAction<string> } }) => {
		setTitle(e.target.value);
	};

	const handleContent = (e: { target: { value: SetStateAction<string> } }) => {
		setContent(e.target.value);
	};

	const closeAndClear = () => {
		hidePostInput();
		setTitle('');
		setContent('');
	};

	const savePost = async () => {
		try {
			if (!isConnected || !walletAddress) {
				//TODO add error message
				console.log('Wallet not connected');
				return;
			}
			if (title == '' || title == null || content == null || content == '') {
				//TODO add error message
				console.log('No content in input');
				return;
			}
			// Save to IPFS
			await postToIPFS
				.mutateAsync({
					title: title,
					content: content,
				})
				.then(async (response) => {
					const dataFirebase = await postToFirebase.mutateAsync({
						posterKey: walletAddress.toString(),
						//TO DO/TODO: Replace this with dynamic group id
						groupId: groupId,
						messageHash: response.IpfsHash,
					});
				})
				.then(closeAndClear);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className="flex flex-col bg-red-500 w-1/3">
			<BasicButton children={'Add Post'} type={'primary'} onClick={showPostInput}></BasicButton>
			<BasicModal
				isOpen={postOpen}
				onClose={hidePostInput}
				header={<h2 className="text-xl font-semibold">Add Post</h2>}
				content={
					//TODO: Make sure prevent submission when either empty
					<div>
						<TextInput
							id="post-title"
							name="post-title"
							type="text"
							required={true}
							onChange={handleTitle}
							placeholder="Post Title"
						/>
						<TextArea
							id="post-content"
							name="post-content"
							required={true}
							onChange={handleContent}
							placeholder="Post Content"
						/>
					</div>
				}
				footer={
					<div>
						<button
							className="bg-blue-500 text-red px-4 py-2 rounded-md hover:bg-blue-600 mr-4"
							onClick={savePost}
						>
							Post
						</button>
						<button
							className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
							onClick={hidePostInput}
						>
							Cancel
						</button>
					</div>
				}
			/>
		</div>
	);
};

export default GroupPostInput;
