/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import { preventActionWalletNotConnected } from '~/helpers/user-helper';
import { toast } from 'react-toastify';
import BasicModal from '../ui/BasicModal';
import TextInput from '../ui/TextInput';
import SelectOption from '../ui/SelectOption';
import { ProductCategoryOptions } from '~/models/product-category-options';
import BasicButton from '../ui/BasicButton';
import Spinner from '../ui/Spinner';
import DragDrop from '../ui/DragDrop';
import { defaultImageHash, saveImages } from '~/helpers/image-helper';
import { api } from '~/trpc/react';
import { useWallet } from '~/providers/WalletProvider';
import { DateTime } from 'luxon';
import ProductFields from './ProductFields';
import { closeModal } from '~/helpers/modal-helper';
import { type AttributeModel } from '~/models/attribute-model';

type AddProductModalProps = {
	productOpen: boolean;
	onProductSubmitted: () => void;
};

const AddProductModal = ({ onProductSubmitted }: AddProductModalProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [images, setImages] = useState<File[]>([]);
	const productToIPFS = api.PinataProduct.postProduct.useMutation();
	const productToFirebase = api.FirebaseProduct.productToCollection.useMutation();
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);
	const [displayTailoredFields, setDisplayTailoredFields] = useState(false);
	const [attributes, setAttributes] = useState<AttributeModel[]>([]);

	const { isConnected, walletAddress } = useWallet();

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

	const assignAttributeValue = (value) => {
		setAttributes(value);
	};

	const saveProduct = async (name: string, price: number, category: string) => {
		try {
			setIsLoading(true);
			let productImgsIPFS;
			let imageHashes;
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to save product')) return;
			if (images.length > 0) {
				productImgsIPFS = await saveImages(images);
				//map ipfsHashes of all uploaded images to array
				imageHashes = productImgsIPFS.map(function (item) {
					return item.data.IpfsHash;
				});
			} else {
				imageHashes = [defaultImageHash];
			}
			// 	//DO WE WANT CONTENT CHECK HERE?
			// 	// Save to IPFS
			const postProductToIPFS = await productToIPFS.mutateAsync({
				name: name,
				price: price.toString(),
				category: category,
				imageHash: imageHashes,
				productAttributes: attributes,
				creatorKey: walletAddress!.toString(),
				dateTime: DateTime.now().toString(),
			});
		} catch (err) {
			console.log(err);
			toast.error('Error saving product');
			throw err;
		} finally {
			setIsLoading(false);
			setImages([]);
			setAttributes([]);
		}
	};

	const onSubmit = async (data: any) => {
		try {
			setIsLoading(true);
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to create product')) return;
			await saveProduct(data['product-name'], data['product-price'], data['product-category']);
			reset();
			closeModal('add-product');
			// refetchPosts();
			toast.success('Product created successfully');
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
			onProductSubmitted();
		}
	};

	const clearForm = () => {
		reset();
		unregister(['product-name', 'product-price', 'product-category']);
	};

	const handleOnClose = () => {
		clearForm();
		closeModal('add-product');
	};

	return (
		<BasicModal
			id="add-product"
			header="Add Product"
			onClose={handleOnClose}
			content={
				<form className="flex flex-col justify-center gap-3" onSubmit={handleSubmit(onSubmit)}>
					<TextInput
						id="product-name"
						name="product-name"
						type="text"
						label="Product Name"
						required={true}
						errors={errors}
						register={register}
						validationSchema={{
							required: 'Product Name is required',
							minLength: {
								value: 5,
								message: 'Product Name must be at least 5 characters',
							},
						}}
					/>
					<TextInput
						id="product-price"
						name="product-price"
						type="number"
						label="Price"
						required={true}
						errors={errors}
						register={register}
						validationSchema={{
							required: 'Product Price is required',
							minLength: {
								value: 1,
								message: 'Product Price must be at least 1 character',
							},
						}}
					/>
					<SelectOption
						id="product-category"
						name="product-category"
						placeholder="-- Please select a product category --"
						defaultValue=""
						options={ProductCategoryOptions}
						required={true}
						errors={errors}
						register={register}
						validationSchema={{
							required: 'Product Category is required',
						}}
					/>
					<div>
						<BasicButton type={'accent'} onClick={() => setDisplayTailoredFields(true)}>
							Add Product Fields
						</BasicButton>
					</div>
					{displayTailoredFields ? (
						<ProductFields
							onClose={() => setDisplayTailoredFields(false)}
							attributes={attributes}
							setAttributes={assignAttributeValue}
						/>
					) : null}
					<div>
						<DragDrop images={images} setImages={setImages} includeButton={true} />
					</div>
					<div className="w-100 flex justify-end items-center gap-2">
						<BasicButton
							type="primary"
							icon={isLoading ? <Spinner size="sm" /> : null}
							disabled={isLoading}
							submitForm={true}
						>
							Save
						</BasicButton>
						<BasicButton
							type="secondary"
							disabled={isLoading}
							onClick={() => {
								clearForm();
								closeModal('add-product');
							}}
						>
							Cancel
						</BasicButton>
					</div>
				</form>
			}
		/>
	);
};

export default AddProductModal;
