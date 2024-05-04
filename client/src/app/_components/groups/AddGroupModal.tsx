/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useForm } from 'react-hook-form';
import { BasicButton } from '../ui/basic-button';
import { BasicModal } from '../ui/basic-modal';
import { Checkbox } from '../ui/checkbox';
import { InlineLink } from '../ui/inline-link';
import { SelectOption } from '../ui/select-option';
import { TextInput } from '../ui/text-input';
import { useState } from 'react';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import { preventActionWalletNotConnected } from '~/helpers/user-helper';
import { toast } from 'react-toastify';
import { CountryOptions } from '~/models/country-options';
import { Spinner } from '../ui/spinner';
import { CurrencyOptions } from '~/models/currency-options';
import { api } from '~/trpc/react';
import { useWallet } from '~/providers/walletprovider';
import { type FirebaseProductModel } from '~/models/firebase-product-model';
import { DateTime } from 'luxon';

type AddGroupModalTypes = {
	groupOpen: boolean;
	hideGroup: () => void;
};

const AddGroupModal = ({ groupOpen, hideGroup }: AddGroupModalTypes) => {
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);
	const { isConnected, walletAddress } = useWallet();
	const { data: fbProductData } = api.FirebaseProduct.getProducts.useQuery({
		creatorKey: walletAddress?.toString(),
	});
	const groupToIPFS = api.PinataGroup.postGroup.useMutation();
	const groupToFirebase = api.FirebaseGroup.groupToCollection.useMutation();
	const [isLoading, setIsLoading] = useState(false);
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

	const saveGroup = async (
		name: string,
		currency: string,
		price: string,
		duration: string,
		participants: string,
		country: string,
		product: FirebaseProductModel
	) => {
		try {
			setIsLoading(true);
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to save product')) return;
			const groupProductToIPFS = await groupToIPFS.mutateAsync({
				name: name,
				currency: currency,
				price: price,
				duration: duration,
				participants: participants,
				country: country,
				product: product.productHash,
			});
			await groupToFirebase.mutateAsync({
				name: name,
				creatorKey: walletAddress!.toString(),
				groupHash: groupProductToIPFS.data.IpfsHash,
				dateTime: DateTime.now().toString(),
			});
		} catch (err) {
			console.log(err);
			toast.error('Error saving product');
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = async (data: any) => {
		try {
			setIsLoading(true);
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to post')) return;
			await saveGroup(
				data['group-name'] as string,
				data.currency as string,
				`${data['instalments-larger-unit']}.${data['instalments-smaller-unit']}`,
				data.duration as string,
				data.participants as string,
				data.country as string,
				fbProductData?.products.find((p) => p.name === data.product)!
			);
			console.log(JSON.stringify(data));
			reset();
			hideGroup();
			// refetchPosts();
			toast.success('Posted successfully');
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<BasicModal
			isOpen={groupOpen}
			onClose={hideGroup}
			header={<h2 className="text-xl font-semibold">Add Group</h2>}
			content={
				<form className="flex flex-col justify-center gap-3" onSubmit={handleSubmit(onSubmit)}>
					<TextInput
						id="group-name"
						name="group-name"
						type="text"
						label="Group Name"
						required={true}
						errors={errors}
						register={register}
						validationSchema={{
							required: 'Group Name is required',
							minLength: {
								value: 10,
								message: 'Group Name must be at least 10 characters',
							},
						}}
					/>

					<div className="flex items-end">
						<div className="w-40">
							<SelectOption
								id="currency"
								name="currency"
								label="Payment Instalments"
								defaultValue="£"
								displayKey="symbol"
								options={CurrencyOptions}
								required={true}
								errors={errors}
								register={register}
								validationSchema={{
									required: 'Currency is required',
								}}
							/>
						</div>
						<div className="px-2">
							<TextInput
								id="instalments-larger-unit"
								name="instalments-larger-unit"
								type="number"
								required={true}
								errors={errors}
								register={register}
								validationSchema={{
									required: 'Payment Instalments is required',
									minLength: {
										value: 1,
										message: 'Number Instalments must be greater than 0',
									},
									min: {
										value: 0,
										message: 'Cannot have negative numbers',
									},
								}}
							/>
						</div>
						.
						<div className="px-2">
							<TextInput
								id="instalments-smaller-unit"
								name="instalments-smaller-unit"
								type="number"
								label=" "
								// required={true}
								errors={errors}
								register={register}
								validationSchema={{
									min: {
										value: 0,
										message: 'Cannot have negative numbers',
									},
								}}
							/>
						</div>
					</div>
					{/* TODO Number validation checks w. currency */}
					<div className="flex">
						<div className="w-48 px-2">
							<TextInput
								id="duration"
								name="duration"
								type="number"
								label="Duration (in weeks)"
								required={true}
								errors={errors}
								register={register}
								validationSchema={{
									required: 'Duration is required',
									minLength: {
										value: 1,
										message: 'Duration must be greater than 0',
									},
									min: {
										value: 0,
										message: 'Cannot have negative numbers',
									},
								}}
							/>
						</div>
						{/* TODO Number validation checks */}
						<div className="w-48">
							<TextInput
								id="participants"
								name="participants"
								type="number"
								label="Number of Participants"
								required={true}
								errors={errors}
								register={register}
								validationSchema={{
									required: 'Price Per Instalment is required',
									minLength: {
										value: 1,
										message: 'Price Per Instalment must be greater than 0',
									},
								}}
							/>
						</div>
					</div>
					{/* TODO replace with flag package */}
					<SelectOption
						id="country"
						name="country"
						placeholder="-- Please select a country --"
						defaultValue=""
						options={CountryOptions}
						displayKey="name"
						required={true}
						errors={errors}
						register={register}
						validationSchema={{
							required: 'Country is required',
						}}
					/>
					<SelectOption
						id="product"
						name="product"
						placeholder="-- Please select a product --"
						defaultValue=""
						options={fbProductData?.products}
						displayKey="name"
						required={true}
						errors={errors}
						register={register}
						validationSchema={{
							required: 'Product is required',
						}}
					/>

					{/* TODO replace youtube link */}
					<Checkbox id={'tandc'} name={'tand'}>
						I confirm my legal abilities to sell the goods and agree to
						<InlineLink href={'https://youtube.com'}>T&Cs</InlineLink>
					</Checkbox>
					<Checkbox id={''} name={''}>
						I agree to be contacted regarding my registration/eligibility and await to be contacted 
					</Checkbox>
					<div className="w-100 flex justify-end items-center gap-2">
						<BasicButton
							type="primary"
							icon={isLoading ? <Spinner size="sm" /> : null}
							disabled={isLoading}
							submitForm={true}
						>
							Save
						</BasicButton>
						<BasicButton type="secondary" disabled={isLoading} onClick={hideGroup}>
							Cancel
						</BasicButton>
					</div>
				</form>
			}
		/>
	);
};

export default AddGroupModal;
