/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { useForm } from 'react-hook-form';
import BasicButton from '../ui/BasicButton';
import BasicModal from '../ui/BasicModal';
import CheckBox from '../ui/CheckBox';
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
import { api } from '~/trpc/react';
import { useWallet } from '~/providers/WalletProvider';
import { DateTime } from 'luxon';
import InstalmentSlider from '~/app/_components/ui/InstalmentSlider';
import { type DropDownContentModel } from '~/models/dropdown-content-model';
import { closeModal } from '~/helpers/modal-helper';
import { FaUserGroup } from 'react-icons/fa6';
import TextArea from '../ui/TextArea';
import { type IPFSSearchModel } from '~/models/ipfs/ipfs-search-model';
import { useMinaProvider } from '@/providers/minaprovider';
import Game from '../game/game';
import { PeriodOptions } from '@/models/period-options';

type AddGroupModalProps = {
	onGroupSubmitted: () => void;
};

const AddGroupModal = ({ onGroupSubmitted }: AddGroupModalProps) => {
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);
	const { isConnected, walletAddress } = useWallet();
	const [displayProductCount, setDisplayProductCount] = useState(20);

	const { deployGroup, logFetchAccount, isMinaLoading, groupPublicKey } = useMinaProvider();

	const { data: pinataProductData } = api.PinataProduct.getProducts.useQuery({
		creatorKey: walletAddress?.toString(),
		productCount: displayProductCount,
	});
	const groupToIPFS = api.PinataGroup.postGroup.useMutation();
	const [isLoading, setIsLoading] = useState(false);
	const [dropdownProducts, setDropdownProducts] = useState<DropDownContentModel[]>([]);
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
	const [participants, setParticipants] = useState(0);
	const [duration, setDuration] = useState(0);
	const [period, setPeriod] = useState('');
	const [instalments, setInstalments] = useState<number | null>();
	const updateParticipantDuration = (sliderVal: number) => {
		setDuration(sliderVal);
		setParticipants(2 * sliderVal);
	};
	const [currentSelectedProduct, setCurrentSelectedProduct] = useState<IPFSSearchModel>();
	const handleProductSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		//TODO: This filter on name should be replaced with filter on id?
		const selectedProduct = pinataProductData?.products.rows.find((p) => p.metadata.name === event.target.value)!;
		if (selectedProduct) setCurrentSelectedProduct(selectedProduct as IPFSSearchModel);
	};
	const handlePeriodSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		//TODO: This filter on name should be replaced with filter on id?
		// const selectedDuration = pinataProductData?.products.rows.find((p) => p.metadata.name === event.target.value)!;
		// if (selectedProduct) setCurrentSelectedProduct(selectedProduct as IPFSSearchModel);
		setPeriod(event.target.value);
	};

	const saveGroup = async (
		name: string,
		description: string,
		price: string,
		duration: string,
		participants: string,
		chainPubKey: string
	) => {
		try {
			setIsLoading(true);
			if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to save group')) return;
			console.log('Saving group');
			console.log(currentSelectedProduct);
			if (!currentSelectedProduct) return;
			// const userObjectHash = groupUsersToIPFS.mutateAsync({ creatorKey: walletAddress!.toString() });
			// console.log(userObjectHash);
			await groupToIPFS.mutateAsync({
				name: name,
				description: description,
				price: price,
				duration: duration,
				instalments: instalments ?? 0,
				participants: participants,
				productHash: currentSelectedProduct?.ipfs_pin_hash,
				productName: currentSelectedProduct?.metadata.name,
				productPrice: currentSelectedProduct?.metadata.keyvalues.price,
				creatorKey: walletAddress!.toString(),
				dateTime: DateTime.now().toString(),
				userObjectHash: null,
				chainPubKey: chainPubKey,
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
			await deployGroup(
				participants,
				parseInt(currentSelectedProduct?.metadata.keyvalues.price!),
				duration,
				3,
				parseInt(period)
			);
			if (groupPublicKey) {
				await saveGroup(
					data['group-name'] as string,
					data['group-description'] as string,
					currentSelectedProduct?.metadata.keyvalues.price!,
					duration.toString(),
					participants.toString(),
					groupPublicKey
				);
				reset();
				closeModal('add-group');
				toast.success('Posted successfully');
			} else console.log('group pub key', groupPublicKey);
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
			onGroupSubmitted();
		}
	};

	const serializeList = (list: IPFSSearchModel[]): DropDownContentModel[] => {
		return list.map((item) => ({
			name: item.metadata.name,
			value: item.metadata.name,
		}));
	};

	useEffect(() => {
		if (pinataProductData?.products)
			setDropdownProducts(serializeList((pinataProductData?.products.rows as IPFSSearchModel[]) ?? []));
	}, [pinataProductData?.products]);

	useEffect(() => {
		//TO DO : fix this cast
		setInstalments(
			Math.round(
				(((currentSelectedProduct?.metadata.keyvalues.price as unknown as number) * 2) / participants) * 100
			) / 100
		);
	}, [participants, duration, currentSelectedProduct]);

	const clearForm = () => {
		reset();
		unregister(['group-name', 'product', 'group-description', 'country', 'tandc', 'agree-contact']);
	};

	const handleOnClose = () => {
		clearForm();
		closeModal('add-group');
	};

	return (
		<BasicModal
			id="add-group"
			header="Add Group"
			onClose={handleOnClose}
			content={
				<form className="flex flex-col justify-center gap-3" onSubmit={handleSubmit(onSubmit)}>
					<TextInput
						id="group-name"
						icon={<FaUserGroup />}
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
					{dropdownProducts.length > 0 ? (
						<div>
							<SelectOption
								id="product"
								name="product"
								placeholder="-- Please select a product --"
								defaultValue=""
								value={currentSelectedProduct?.metadata.name}
								onChange={(e) => handleProductSelectChange(e)}
								options={dropdownProducts}
							/>
							<div className="flex flex-col">
								<div className="flex flex-col">
									<div className="my-2 mx-1 w-1/2">Participants: {participants}</div>
									<div className="flex">
										<div className="my-2 mx-1 w-1/2">
											<TextInput
												label="Duration"
												id={'duration'}
												name={'duration'}
												type={'number'}
												placeholder="Duration"
												required={true}
												errors={errors}
												register={register}
												validationSchema={{
													required: 'Duration is required',
													max: {
														value: 48,
														message: 'Max value is 48',
													},
												}}
												onChange={(e) => {
													setDuration(e.target.value);
													setParticipants(e.target.value * 2);
												}}
											/>
										</div>
										<div className="my-2 mx-1 w-1/3">
											<SelectOption
												id="period"
												name="period"
												placeholder="-- Please select a duration --"
												defaultValue=""
												value={period}
												onChange={(e) => handlePeriodSelectChange(e)}
												options={PeriodOptions}
											/>
										</div>
									</div>
								</div>
								<div>{`Product price ${currentSelectedProduct?.metadata.keyvalues.price}`}</div>
								<div>{`Installment price per user ${instalments}`}</div>
							</div>
						</div>
					) : (
						//Dropdown for weekly, bi-weekly and months
						//Textbox for duration of these
						//Product Price
						//Instalments
						`No products`
					)}
					<TextArea
						id="group-description"
						name="group-description"
						label="Group Description"
						required={true}
						showCharacterCount={true}
						errors={errors}
						register={register}
						validationSchema={{
							required: 'Group Description is required',
							minLength: {
								value: 20,
								message: 'Group Description must be at least 20 characters',
							},
							maxLength: {
								value: 1500,
								message: 'Group Description must be at less than 1500 characters',
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
						displayKey="name"
						required={true}
						errors={errors}
						register={register}
						validationSchema={{
							required: 'Country is required',
						}}
					/>
					{/* TODO replace youtube link */}
					<CheckBox type="secondary" id="tandc" name="tandc" errors={errors} register={register}>
						I confirm my legal abilities to sell the goods and agree to
						<InlineLink href={'https://youtube.com'}>T&Cs</InlineLink>
					</CheckBox>
					<CheckBox
						type="secondary"
						id="agree-contact"
						name="agree-contact"
						errors={errors}
						register={register}
					>
						I agree to be contacted regarding my registration/eligibility and await to be contacted 
					</CheckBox>
					<div className="flex flex-col">
						<div className="w-100 flex justify-end items-center gap-2">
							{isMinaLoading ? (
								<div className="flex w-full flex-col">
									<div>
										Preparing <Spinner />
									</div>
									<Game />
								</div>
							) : (
								<div>
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
											closeModal('add-group');
										}}
									>
										Cancel
									</BasicButton>
								</div>
							)}
						</div>
					</div>
				</form>
			}
		/>
	);
};

export default AddGroupModal;
