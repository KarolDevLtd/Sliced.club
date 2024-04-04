/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';

import { TextArea } from '../../ui/text-area';
import { BasicButton } from '../../ui/basic-button';
import { useWallet } from '~/providers/walletprovider';
import { api } from '~/trpc/react';
import { DateTime } from 'luxon';
import { IoIosSend } from 'react-icons/io';
import { preventActionNotLoggedIn } from '~/helpers/user-helper';

type PostCommentProps = {
	postId: string;
	refetchComments: () => void;
};

const PostComment = ({ postId, refetchComments }: PostCommentProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const { isConnected, walletAddress } = useWallet();
	const [, setValue] = useState('');
	const [rows, setRows] = useState(1);

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);

	const commentToIPFS = api.PinataPost.postComment.useMutation();
	const commentToFirebase = api.FirebasePost.commentToCollection.useMutation();

	//function allows for textarea to automatically wrap line
	const handleChange = (event: {
		target: { rows: number; scrollHeight: number; value: React.SetStateAction<string> };
	}) => {
		const textareaLineHeight = 24; // Adjust this value based on your textarea styling
		event.target.rows = 1; // Resetting rows to 1 to calculate the new height
		const currentRows = Math.ceil(event.target.scrollHeight / textareaLineHeight);
		event.target.rows = currentRows;
		setRows(currentRows);
		setValue(event.target.value);
	};

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
		if (preventActionNotLoggedIn(isLoggedIn)) return;
		try {
			setIsLoading(true);
			await saveComment(data['comment-content']);
			reset();
			refetchComments();
		} catch (err) {
			console.log(err);
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
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex">
			<form className="flex flex-row w-full" onSubmit={handleSubmit(onSubmit)}>
				<TextArea
					id="comment-content"
					name="comment-content"
					onChange={handleChange}
					rows={rows}
					label=""
					required={true}
					errors={errors}
					register={register}
					validationSchema={{
						required: 'Comment content is required',
						minLength: {
							value: 1,
							message: 'Post Title must be at least 10 characters',
						},
					}}
				/>
				{isLoading ? (
					'Loading...'
				) : (
					<div className="p-3">
						<BasicButton type={'primary'} submitForm={true}>
							<IoIosSend />
						</BasicButton>
					</div>
				)}
			</form>
		</div>
	);
};

export default PostComment;
