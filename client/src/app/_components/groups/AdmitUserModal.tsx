import TextInput from '../ui/TextInput';
import BasicModal from '../ui/BasicModal';
import { useForm } from 'react-hook-form';
import BasicButton from '../ui/BasicButton';
import { closeModal } from '@/helpers/modal-helper';
import { useWallet } from '@/providers/WalletProvider';
import { api } from '@/trpc/react';
import { use, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type AdmitUserModalrops = {
	groupHash: string;
	participants: any[];
};

const AdmitUserModal = ({ groupHash, participants }: AdmitUserModalrops) => {
	const { isConnected, walletAddress } = useWallet();

	// const { data: participantData } = api.PinataGroup.getGroupParticipants.useQuery({ groupHash: groupHash });
	const groupParticipantToIPFS = api.PinataGroup.createGroupParticipantObject.useMutation();
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

	const [isLoading, setIsLoading] = useState(false);
	// const [participants, setParticipants] = useState();

	const onSubmit = async (data: any) => {
		try {
			// console.log(data['user-key']);
			//If group user hash is null then need to create
			//if not null, then need to update
			const hash = groupParticipantToIPFS.mutateAsync({
				groupHash: groupHash,
				creatorKey: walletAddress!.toString(),
				userKey: data['user-key'],
				status: 'pending',
			});
			console.log(hash);
			clearForm();
			handleOnClose();
		} catch (err) {
			console.log(err);
		} finally {
			// setIsLoading(false);
			// onGroupSubmitted();
		}
	};

	const handleOnClose = () => {
		clearForm();
		closeModal('admit-user');
	};

	const clearForm = () => {
		reset();
		unregister(['user-key']);
	};

	// const fetchInfo = useCallback(async () => {
	// 	setIsLoading(true);
	// 	try {
	// 		if (participantData) {
	// 			// const currGroup = participantData.users;
	// 			setParticipants(participantData.users);
	// 			console.log('group data');
	// 			// const z = api.PinataGroup.getGroupParticipants.useQuery({ groupHash: groupId });
	// 			// console.log(z);
	// 		}
	// 		// if (productData) {
	// 		// 	const currProd = productData.product as IPFSProductModel;
	// 		// 	setProduct(productData.product);
	// 		// 	await fetchImageData(currProd, setHasImage, setImageData, setImageError);
	// 		// }
	// 	} catch (err) {
	// 		console.log(err);
	// 		toast.error('Error fetching user item info');
	// 	} finally {
	// 		setIsLoading(false);
	// 	}
	// }, [participantData]);

	// useEffect(() => {
	// 	void fetchInfo();
	// }, [fetchInfo, participantData]);

	return (
		<BasicModal
			id="admit-user"
			header="Admit User"
			onClose={handleOnClose}
			content={
				<form onSubmit={handleSubmit(onSubmit)}>
					<TextInput
						id="user-key"
						// icon={<FaUserGroup />}
						name="user-key"
						type="text"
						label="User Key"
						required={true}
						errors={errors}
						register={register}
						validationSchema={{
							required: 'User key must be provided',
							minLength: {
								value: 10,
								message: 'User key must be at least 10 characters',
							},
						}}
					/>
					<BasicButton
						type="primary"
						// icon={isLoading ? <Spinner size="sm" /> : null}
						// disabled={isLoading}
						submitForm={true}
					>
						Admit
					</BasicButton>
					{participants ? (
						participants.map((participant: any, index) => {
							return <div key={index}>{participant.tostring()}</div>;
						})
					) : (
						<p>No participants</p>
					)}
				</form>
			}
		></BasicModal>
	);
};

export default AdmitUserModal;
