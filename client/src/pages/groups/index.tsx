import { useState } from 'react';
import { BasicButton } from '~/app/_components/ui/basic-button';
import { InlineLink } from '~/app/_components/ui/inline-link';
import { preventActionNotLoggedIn, preventActionWalletNotConnected } from '~/helpers/user-helper';
import PlatformLayout from '~/layouts/platform';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import { useForm } from 'react-hook-form';
import { BasicModal } from '~/app/_components/ui/basic-modal';
import { TextInput } from '~/app/_components/ui/text-input';
import { toast } from 'react-toastify';
import { SelectOption } from '~/app/_components/ui/select-option';
import { ProductCategoryOptions } from '~/models/product-category-options';
import { Checkbox } from '~/app/_components/ui/checkbox';
import { Spinner } from '~/app/_components/ui/spinner';
import { CountryOptions } from '~/models/country-options';

export default function Groups() {
	const groupId = '69';
	const [groupOpen, setGroupOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);

	const showGroupInput = () => {
		if (preventActionNotLoggedIn(isLoggedIn, 'Log in to create a group')) return;
		setGroupOpen(true);
	};

	const hideGroupInput = () => {
		setGroupOpen(false);

		// Clears form validation errors when closing modal
		// unregister(['post-title', 'post-text']);
	};

	const onSubmit = async (data: any) => {
		try {
			setIsLoading(true);
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to post')) return;
			// await savePost(data['post-title'], data['post-text']);
			console.log(JSON.stringify(data));
			reset();
			hideGroupInput();
			// refetchPosts();
			toast.success('Posted successfully');
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
		}
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

	return (
		<ul>
			<li>
				<InlineLink href={`groups/${groupId}`}>Group 69</InlineLink>
			</li>
			<BasicButton type="primary" onClick={showGroupInput}>
				Add Group
			</BasicButton>
			<BasicModal
				isOpen={groupOpen}
				onClose={hideGroupInput}
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
									value: 1,
									message: `Product Name must be at least 1 character`,
								},
							}}
						/>
						<TextInput
							id="product-producer"
							name="product-producer"
							type="text"
							label="Product Producer"
							required={true}
							errors={errors}
							register={register}
							validationSchema={{
								required: 'Product Producer is required',
								minLength: {
									value: 1,
									message: 'Product Producer must be at least 1 character',
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
						{/* TODO Number validation checks */}
						<TextInput
							id="instalments"
							name="instalments"
							type="number"
							label="Payment Instalments"
							required={true}
							errors={errors}
							register={register}
							validationSchema={{
								required: 'Payment Instalments is required',
								minLength: {
									value: 1,
									message: 'Number Instalments must be greater than 0',
								},
							}}
						/>
						{/* TODO Number validation checks w. currency */}
						<TextInput
							id="amount"
							name="amount"
							type="number"
							label="Amount Per Instalment"
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
						{/* TODO Number validation checks */}
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
						{/* TODO replace with flag package */}
						<SelectOption
							id="country"
							name="country"
							placeholder="-- Please select a country --"
							defaultValue=""
							options={CountryOptions}
							required={true}
							errors={errors}
							register={register}
							validationSchema={{
								required: 'Country is required',
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
							<BasicButton type="secondary" disabled={isLoading} onClick={hideGroupInput}>
								Cancel
							</BasicButton>
						</div>
					</form>
				}
			/>
		</ul>
	);
}

Groups.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
