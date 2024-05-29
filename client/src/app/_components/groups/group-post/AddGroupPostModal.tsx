/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { toast } from 'react-toastify';
import { preventActionWalletNotConnected, sliceWalletAddress } from '~/helpers/user-helper';

import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';

import BasicButton from '../../ui/BasicButton';
import TextInput from '../../ui/TextInput';
import Spinner from '../../ui/Spinner';
import { closeModal } from '~/helpers/modal-helper';
import TextArea from '../../ui/TextArea';
import BasicModal from '../../ui/BasicModal';
import DragDrop from '../../ui/DragDrop';

import { saveImages } from '~/helpers/image-helper';
import { useWallet } from '~/providers/WalletProvider';
import { api } from '~/trpc/react';
import { DateTime } from 'luxon';
import { FaImage } from 'react-icons/fa6';

type AddGroupPostModalProps = {
	groupId: string;
};

const AddGroupPostModal = ({ groupId }: AddGroupPostModalProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [images, setImages] = useState<File[]>([]);
	const [refreshPosts, setRefreshPosts] = useState(false);
	const [showAttachments, setShowAttachments] = useState(false);

	const { walletDisplayAddress, walletAddress } = useWallet();

	const postToIPFS = api.PinataPost.postMessage.useMutation();
	const postToFirebase = api.FirebasePost.postToCollection.useMutation();

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);

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
			// refetchPosts();
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

	const hidePostInput = () => {
		// Clears form validation errors when closing modal
		unregister(['post-title', 'post-text']);
		closeModal('add-post');
	};

	const clearForm = () => {
		reset();
		unregister(['post-title', 'post-text']);
	};

	return (
		<BasicModal
			id="add-post"
			onClose={clearForm}
			header="New Post"
			content={
				<form className="flex flex-col justify-center gap-3" onSubmit={handleSubmit(onSubmit)}>
					{/* <TextInput
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
					/> */}

					<div className="flex items-center gap-2">
						<div className="avatar">
							<div className="rounded h-[2.25rem] w-[2.25rem]">
								{/* <Image
									src={'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg'}
									alt="Placeholder Avatar"
									width={25}
									height={25}
								/> */}
								<img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
							</div>
						</div>
						<span>{sliceWalletAddress(walletDisplayAddress)}</span>
					</div>

					<TextArea
						type="accent"
						id="post-text"
						name="post-text"
						placeholder="Add a new post..."
						required={true}
						hideAsterisk={true}
						hideResize={true}
						errors={errors}
						register={register}
						validationSchema={{
							required: 'Post Content is required',
							minLength: {
								value: 20,
								message: 'Post Content must be at least 20 characters',
							},
							maxLength: {
								value: 250,
								message: 'Post Content must be at less than 250 characters',
							},
						}}
					/>

					<div className="flex items-center justify-between">
						<span>Add to post</span>
						<div className="flex items-center justify-end gap-2">
							<BasicButton
								type="ghost"
								active={showAttachments}
								onClick={() => setShowAttachments(!showAttachments)}
							>
								<FaImage />
							</BasicButton>
						</div>
					</div>

					{showAttachments ? (
						<div className="flex justify-center">
							<DragDrop images={images} setImages={setImages} includeButton={true} />
						</div>
					) : null}
					<div className="w-full flex justify-end items-center gap-2">
						<BasicButton
							type="secondary"
							icon={isLoading ? <Spinner size="sm" /> : null}
							disabled={isLoading}
							submitForm={true}
						>
							Publish
						</BasicButton>
					</div>
				</form>
			}
		/>
	);
};

export default AddGroupPostModal;
