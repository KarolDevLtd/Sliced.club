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
import { ProductCategoryOptions } from '~/models/product-category-options';
import { CountryOptions } from '~/models/country-options';
import { Spinner } from '../ui/spinner';

type AddGroupModalTypes = {
	groupOpen: boolean;
	hideGroup: () => void;
};

const AddGroupModal = ({ groupOpen, hideGroup }: AddGroupModalTypes) => {
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
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to post')) return;
			// await savePost(data['post-title'], data['post-text']);
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
					{/* TODO Number validation checks w. currency */}
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