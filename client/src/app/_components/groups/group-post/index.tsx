import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { TextInput } from '../../ui/text-input';
import { TextArea } from '../../ui/text-area';
import { BasicButton } from '../../ui/basic-button';
import { BasicModal } from '../../ui/basic-modal';

const GroupPost = () => {
	const [postOpen, setPostOpen] = useState(false);

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
	const onSubmit = (data: any) => {
		alert(JSON.stringify(data));
		reset();
		hidePostInput();
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

						<div className="w-100 flex justify-end items-center gap-2">
							<BasicButton type="primary" submitForm={true}>
								Save
							</BasicButton>
							<BasicButton type="secondary" onClick={hidePostInput}>
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
