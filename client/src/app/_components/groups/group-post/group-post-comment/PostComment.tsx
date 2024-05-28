/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';

import { toast } from 'react-toastify';

import TextArea from '../../../ui/TextArea';
import BasicButton from '../../../ui/BasicButton';
import { useWallet } from '~/providers/WalletProvider';
import { api } from '~/trpc/react';
import { DateTime } from 'luxon';
import { IoIosSend } from 'react-icons/io';
import { preventActionNotLoggedIn, preventActionWalletNotConnected } from '~/helpers/user-helper';
import Spinner from '../../../ui/Spinner';

type PostCommentProps = {
	postId: string;
	refetchComments: () => void;
};

const PostComment = ({ postId, refetchComments }: PostCommentProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const { isConnected, walletAddress } = useWallet();

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);

	const commentToIPFS = api.PinataPost.postComment.useMutation();
	const commentToFirebase = api.FirebasePost.commentToCollection.useMutation();

	const {
		register,
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
		if (preventActionNotLoggedIn(isLoggedIn, 'Log in to post a comment')) return;
		if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to post a comment')) return;
		try {
			setIsLoading(true);
			await saveComment(data['comment-content']);
			reset();
			refetchComments();
			toast.success('Comment posted successfully');
		} catch (err) {
			console.log(err);
			toast.error('Error submitting commment');
		} finally {
			setIsLoading(false);
		}
	};

	const saveComment = async (content: string) => {
		try {
			setIsLoading(true);
			if (!isConnected || !walletAddress) {
				//TODO add error message
				console.log('Wallet not connected');
				return;
			}
			//DO WE WANT CONTENT CHECK HERE?
			// Save to IPFS
			await commentToIPFS
				.mutateAsync({
					content: content,
				})
				.then(async (response) => {
					await commentToFirebase.mutateAsync({
						posterKey: walletAddress.toString(),
						parentMessageId: postId,
						commentContent: response.data.IpfsHash,
						dateTime: DateTime.now().toString(),
					});
				});
		} catch (err) {
			console.log(err);
			toast.error('Error making comment - please try again');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex">
			<form className="flex flex-row items-center min-w-full my-4" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex-1">
					<TextArea
						id="comment-content"
						name="comment-content"
						label=""
						placeholder="Leave your comment..."
						errors={errors}
						register={register}
						// autoResize={true}
						validationSchema={{
							required: 'Comment content is required',
							minLength: {
								value: 1,
								message: 'Comment must be at least 1 character',
							},
							maxLength: {
								value: 250,
								message: 'Comment must be at less than 250 characters',
							},
						}}
					/>
				</div>
				<div className="ms-2">
					<BasicButton type="ghost" submitForm={true}>
						{isLoading ? <Spinner size="sm" /> : <IoIosSend />}
					</BasicButton>
				</div>
			</form>
		</div>
	);
};

export default PostComment;
