/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import { preventActionWalletNotConnected } from '~/helpers/user-helper';
import { toast } from 'react-toastify';
import { BasicModal } from '../ui/basic-modal';

type AddProductModalTypes = {
	productOpen: boolean;
	hideProduct: () => void;
};

const AddProductModal = ({ productOpen, hideProduct }: AddProductModalTypes) => {
	const [isLoading, setIsLoading] = useState(false);
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

	const onSubmit = async (data: any) => {
		try {
			setIsLoading(true);
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to create product')) return;
			// await savePost(data['post-title'], data['post-text']);
			console.log(JSON.stringify(data));
			reset();
			hideProduct();
			// refetchPosts();
			toast.success('Product created successfully');
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<BasicModal
			isOpen={productOpen}
			onClose={hideProduct}
			header={<h2 className="text-xl font-semibold">Add Product</h2>}
			content={<div>Hi</div>}
		/>
	);
};

export default AddProductModal;
