import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { preventActionWalletNotConnected, sliceWalletAddress } from '~/helpers/user-helper';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import BasicButton from '../../ui/BasicButton';
import Spinner from '../../ui/Spinner';
import { closeModal } from '~/helpers/modal-helper';
import TextArea from '../../ui/TextArea';
import BasicModal from '../../ui/BasicModal';
import DragDrop from '../../ui/ImageUpload';
import { saveImages } from '~/helpers/image-helper';
import { useWallet } from '@/providers/WalletProvider/walletProvider';
import { api } from '~/trpc/react';
import { DateTime } from 'luxon';
import { FaImage } from 'react-icons/fa6';
import UserAvatar from '../../ui/UserAvatar';

type AddGroupPostModalProps = {
	groupId: string;
	refetchPosts: () => void;
};

type FormValuesType = {
	'post-text': string;
};

type IPFSResponseType = {
	data: {
		IpfsHash: string;
	};
};

const AddGroupPostModal = ({ groupId, refetchPosts }: AddGroupPostModalProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [images, setImages] = useState<File[]>([]);
	const [showAttachments, setShowAttachments] = useState(false);
	const { walletDisplayAddress, walletAddress } = useWallet();
	const postToIPFS = api.PinataPost.postMessage.useMutation();
	const postToFirebase = api.FirebasePost.postToCollection.useMutation();
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);

	const {
		register,
		unregister,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValuesType>({
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		// Resolver for using Zod validation library schema
		// https://react-hook-form.com/docs/useform#resolver
		// resolver: {}
	});

	const onSubmit: SubmitHandler<FormValuesType> = async (data) => {
		try {
			setIsLoading(true);
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to post')) return;
			await savePost('', data['post-text']);
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
			let imageHashes = [] as string[];
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to post')) return;
			if (images) {
				try {
					const postImgsIPFS: IPFSResponseType[] = await saveImages(images);
					imageHashes = postImgsIPFS.map((item: IPFSResponseType) => {
						return item.data.IpfsHash;
					});
				} catch (error) {
					console.error('Error saving images:', error);
				}
			}
			// Save to IPFS
			const postMsgIPFS: IPFSResponseType = await postToIPFS.mutateAsync({
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
		unregister(['post-text']);
		closeModal('add-post');
		refetchPosts();
	};

	const clearForm = () => {
		reset();
		unregister(['post-text']);
	};

	return (
		<BasicModal
			id="add-post"
			onClose={clearForm}
			header="New Post"
			content={
				<form className="flex flex-col justify-center gap-3" onSubmit={handleSubmit(onSubmit)}>
					<div className="flex items-center gap-2">
						<UserAvatar />
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
