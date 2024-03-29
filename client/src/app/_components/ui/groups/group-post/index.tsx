/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable react/no-children-prop */
import React, { useState } from 'react';
import { TextInput } from '../../text-input';
import { TextArea } from '../../text-area';
import { BasicButton } from '../../basic-button';
import { BasicModal } from '../../basic-modal';
import { useWallet } from '~/providers/walletprovider';
import { api } from '~/trpc/react';
import { title } from 'process';

const GroupPost = () => {
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

	const savePost = async () => {
		try {
			if (!isConnected || !walletAddress) {
				//TODO add error message
				console.log('Wallet not connected');
				return;
			}
			// Save to IPFS
			await postToIPFS
				.mutateAsync({
					title: 'This is first title',
					content: 'This is first content',
				})
				.then(async (response) => {
					// console.log(response.IpfsHash);
					const dataFirebase = await postToFirebase.mutateAsync({
						posterKey: walletAddress.toString(),
						//TO DO/TODO: Replace this with dynamic group id
						groupId: 69,
						messageHash: response.IpfsHash,
					});
					console.log(dataFirebase);
				});
			// Save to Firebase with IPFS hash
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
					<div>
						<TextInput label={''} placeholder={'TITLE OF POST'} onChange={setTitle} />
						<TextArea label={''} placeholder={'TYPE HERE M8'} rows={5} onChange={setContent} />
					</div>
				}
				footer={
					<div>
						<button
							className="bg-blue-500 text-red px-4 py-2 rounded-md hover:bg-blue-600 mr-4"
							onClick={savePost}
						>
							Save
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

export default GroupPost;
