/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { TextInput } from '../../ui/text-input';
import { TextArea } from '../../ui/text-area';
import { BasicButton } from '../../ui/basic-button';
import { BasicModal } from '../../ui/basic-modal';
import { useWallet } from '~/providers/walletprovider';
import { api } from '~/trpc/react';
import { DateTime } from 'luxon';

type GroupPostProps = {
	groupId: string;
	refetchPosts: () => void;
};

const GroupPost = ({ groupId, refetchPosts }: GroupPostProps) => {
	const [postOpen, setPostOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { isConnected, walletAddress } = useWallet();

	const postToIPFS = api.PostToIPFS.postMessage.useMutation();
	const postToFirebase = api.PostToFirebase.postToCollection.useMutation();

	const hidePostInput = () => {
		setPostOpen(false);

		// Clears form validation errors when closing modal
		unregister(['post-title', 'post-text']);
	};

	const showPostInput = () => {
		setPostOpen(true);
	};

	const {
		register,
		unregister,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		// Resolver for using Zod validation library schema
		// https://react-hook-form.com/docs/useform#resolver
		// resolver: {}
	});
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSubmit = async (data: any) => {
		try {
			setIsLoading(true);
			await savePost(data['post-title'], data['post-text']);
			// alert(JSON.stringify(data));
			reset();
			hidePostInput();
			refetchPosts();
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
		}
	};

	const savePost = async (title: string, content: string) => {
		try {
			setIsLoading(true);
			if (!isConnected || !walletAddress) {
				//TODO add error message
				console.log('Wallet not connected');
				return;
			}
			//DO WE WANT CONTENT CHECK HERE?
			// Save to IPFS
			await postToIPFS
				.mutateAsync({
					title: title,
					content: content,
				})
				.then(async (response) => {
					await postToFirebase.mutateAsync({
						posterKey: walletAddress.toString(),
						groupId: groupId,
						messageHash: response.data.IpfsHash,
						dateTime: DateTime.now().toString(),
					});
				});
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
		}
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
					<form className="flex flex-col justify-center gap-3" onSubmit={handleSubmit(onSubmit)}>
						<TextInput
							id="post-title"
							name="post-title"
							type="text"
							label="Post Title"
							required={true}
							errors={errors}
							register={register}
							validationSchema={{
								required: 'Post Title is required',
								minLength: {
									value: 10,
									message: 'Post Title must be at least 10 characters',
								},
							}}
						/>
						<TextArea
							id="post-text"
							name="post-text"
							label="Post Text"
							required={true}
							showCharacterCount={true}
							errors={errors}
							register={register}
							validationSchema={{
								required: 'Post Title is required',
								minLength: {
									value: 20,
									message: 'Post Title must be at least 20 characters',
								},
							}}
						/>
						{isLoading ? (
							<div>Loading...</div>
						) : (
							<div className="w-100 flex justify-end items-center gap-2">
								<BasicButton type="primary" disabled={isLoading} submitForm={true}>
									Save
								</BasicButton>
								<BasicButton type="secondary" disabled={isLoading} onClick={hidePostInput}>
									Cancel
								</BasicButton>
							</div>
						)}
					</form>
				}
			/>
		</div>
	);
};

export default GroupPost;
