/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { toast } from 'react-toastify';

import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';

import { TextInput } from '../../ui/text-input';
import { TextArea } from '../../ui/text-area';
import { BasicButton } from '../../ui/basic-button';
import { BasicModal } from '../../ui/basic-modal';
import { useWallet } from '~/providers/walletprovider';
import { api } from '~/trpc/react';
import { DateTime } from 'luxon';
import { preventActionNotLoggedIn, preventActionWalletNotConnected } from '~/helpers/user-helper';
import { Spinner } from '../../ui/spinner';
import DragDrop from '../../ui/drag-drop';
import { saveImages } from '~/helpers/image-helper';

type GroupPostProps = {
	groupId: string;
	refetchPosts: () => void;
};

const GroupPost = ({ groupId, refetchPosts }: GroupPostProps) => {
	const [postOpen, setPostOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [images, setImages] = useState<File[]>([]);

	const { isConnected, walletAddress } = useWallet();

	const postToIPFS = api.PinataPost.postMessage.useMutation();
	const postToFirebase = api.FirebasePost.postToCollection.useMutation();
	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);

	const hidePostInput = () => {
		setPostOpen(false);
		// Clears form validation errors when closing modal
		unregister(['post-title', 'post-text']);
	};

	const showPostInput = () => {
		if (preventActionNotLoggedIn(isLoggedIn, 'Log in to make a post')) return;
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
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to post')) return;
			await savePost(data['post-title'], data['post-text']);
			console.log(JSON.stringify(data));
			reset();
			hidePostInput();
			refetchPosts();
			toast.success('Posted successfully');
		} catch (err) {
			console.log(err);
			toast.error('Post was not submitted - please try again');
		} finally {
			setIsLoading(false);
		}
	};

	const savePost = async (title: string, content: string) => {
		try {
			setIsLoading(true);
			let postImgsIPFS;
			let imageHashes;
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to post')) return;
			if (images) {
				postImgsIPFS = await saveImages(images);
				//map ipfsHashes of all uploaded images to array
				imageHashes = postImgsIPFS.map(function (item) {
					return item.data.IpfsHash;
				});
			}
			//DO WE WANT CONTENT CHECK HERE?
			// Save to IPFS
			const postMsgIPFS = await postToIPFS.mutateAsync({
				title: title,
				content: content,
			});
			await postToFirebase.mutateAsync({
				posterKey: walletAddress!.toString(),
				groupId: groupId,
				messageHash: postMsgIPFS.data.IpfsHash,
				imageHash: imageHashes,
				dateTime: DateTime.now().toString(),
			});
		} catch (err) {
			console.log(err);
			toast.error('Error saving post');
			throw err;
		} finally {
			setIsLoading(false);
			setImages([]);
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
								required: 'Post Content is required',
								minLength: {
									value: 20,
									message: 'Post Content must be at least 20 characters',
								},
							}}
						/>
						<div className="w-100 flex justify-end items-center gap-2">
							<div>
								<DragDrop images={images} setImages={setImages} includeButton={true} />
							</div>
							<BasicButton
								type="primary"
								icon={isLoading ? <Spinner size="sm" /> : null}
								disabled={isLoading}
								submitForm={true}
							>
								Save
							</BasicButton>
							<BasicButton type="secondary" disabled={isLoading} onClick={hidePostInput}>
								Cancel
							</BasicButton>
						</div>
					</form>
				}
			/>
		</div>
	);
};

export default GroupPost;
