/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useForm } from 'react-hook-form';
import BasicButton from '../ui/BasicButton';
import BasicModal from '../ui/BasicModal';
import Checkbox from '../ui/CheckBox';
import InlineLink from '../ui/InlineLink';
import SelectOption from '../ui/SelectOption';
import TextInput from '../ui/TextInput';
import { type ChangeEvent, useState, useEffect } from 'react';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import { preventActionWalletNotConnected } from '~/helpers/user-helper';
import { toast } from 'react-toastify';
import { CountryOptions } from '~/models/country-options';
import Spinner from '../ui/Spinner';
import { CurrencyOptions } from '~/models/currency-options';
import { api } from '~/trpc/react';
import { useWallet } from '~/providers/WalletProvider';
import { type FirebaseProductModel } from '~/models/firebase/firebase-product-model';
import { DateTime } from 'luxon';
import BasicSlider from '~/app/_components/ui/InstalmentSlider';
import { type DropDownContentModel } from '~/models/dropdown-content-model';

type AddGroupModalProps = {
	groupOpen: boolean;
	hideGroup: () => void;
	onGroupSubmitted: () => void;
};

const AddGroupModal = ({ groupOpen, hideGroup, onGroupSubmitted }: AddGroupModalProps) => {
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
	const [participants, setParticipants] = useState(12);
	const [duration, setDuration] = useState(6);
	const [instalments, setInstalments] = useState<number | null>();
	const updateParticipantDuration = (sliderVal: number) => {
		setDuration(sliderVal);
		setParticipants(2 * sliderVal);
	};
	const [currentSelectedProduct, setCurrentSelectedProduct] = useState<FirebaseProductModel | null>();
	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		//TODO: This filter on name should be replaced with filter on id?
		const selectedProduct = fbProductData?.products.find((p) => p.name === event.target.value)!;
		setCurrentSelectedProduct(selectedProduct);
	};

	const saveGroup = async (
		name: string,
		price: string,
		duration: string,
		participants: string,
		product: FirebaseProductModel
	) => {
		try {
			setIsLoading(true);
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to save group')) return;
			const groupProductToIPFS = await groupToIPFS.mutateAsync({
				name: name,
				price: price,
				duration: duration,
				participants: participants,
				productHash: product.productHash,
			});
			await groupToFirebase.mutateAsync({
				name: name,
				creatorKey: walletAddress!.toString(),
				groupHash: groupProductToIPFS.data.IpfsHash,
				dateTime: DateTime.now().toString(),
			});
		} catch (err) {
			console.log(err);
			toast.error('Error saving group');
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = async (data: any) => {
		try {
			setIsLoading(true);
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to create group')) return;
			await saveGroup(
				data['group-name'] as string,
				currentSelectedProduct?.price!,
				duration.toString(),
				participants.toString(),
				currentSelectedProduct!
			);
			reset();
			hideGroup();
			// refetchPosts();
			toast.success('Posted successfully');
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
			onGroupSubmitted();
		}
	};

	const serializeList = (list: FirebaseProductModel[]): DropDownContentModel[] => {
		return list.map((item) => ({
			name: item.name,
			value: item.name,
		}));
	};

	//Serialize products to a list of suitable drop down models
	const productList = serializeList(fbProductData?.products ?? []);

	useEffect(() => {
		//TO DO : fix this cast
		setInstalments(((currentSelectedProduct as unknown as number) / participants) * duration);
	}, [participants, duration, currentSelectedProduct]);

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
					{productList.length > 0 ? (
						<div>
							<SelectOption
								id="product"
								name="product"
								placeholder="-- Please select a product --"
								defaultValue=""
								value={currentSelectedProduct?.name}
								onChange={(e) => handleSelectChange(e)}
								options={productList}
							/>
							<div>
								<BasicSlider
									participants={participants}
									duration={duration}
									onSlide={updateParticipantDuration}
								/>
								<div>{`Product price ${currentSelectedProduct?.price}`}</div>
								<div>{`Installment price per user ${(currentSelectedProduct?.price as unknown as number) / (participants * duration)}`}</div>
							</div>
						</div>
					) : (
						`No products`
					)}
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
