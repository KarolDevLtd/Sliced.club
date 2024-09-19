import BasicModal from '../ui/BasicModal';
import { type SubmitHandler, useForm } from 'react-hook-form';
import BasicButton from '../ui/BasicButton';
import { closeModal } from '@/helpers/modal-helper';
import { useWallet } from '@/providers/WalletProvider/walletProvider';
import { api } from '@/trpc/react';
import { type ChangeEvent, useEffect, useState } from 'react';
import { type DropDownContentModel } from '@/models/dropdown-content-model';
import { type IPFSGroupParticipantModel } from '@/models/ipfs/ipfs-user-model';
import SelectOption from '../ui/SelectOption';
import { type IPFSGroupModel } from '@/models/ipfs/ipfs-group-model';

type AdmitUserModalProps = {
	groupHash: string;
	participants: IPFSGroupParticipantModel[];
	group: IPFSGroupModel;
};

interface PinataParticipantDataType {
	participant: {
		rows: IPFSGroupParticipantModel[];
	};
}

type FormValuesType = {
	'user-key': string;
};

//NOTE THIS COMPONENT IS CURRENTLY UNUSED

const AdmitUserModal = ({ groupHash, participants, group }: AdmitUserModalProps) => {
	const { walletAddress } = useWallet();
	const [dropdownParticipants, setDropdownParticipants] = useState<DropDownContentModel[]>([]);
	const [currentSelectedParticpant, setCurrentSelectedParticpant] = useState<IPFSGroupParticipantModel>();

	const groupParticipantToIPFS = api.PinataGroup.createGroupParticipantObject.useMutation();
	const { data: participantData } = api.PinataGroup.getGroupParticipant.useQuery<PinataParticipantDataType>({
		groupHash: groupHash,
		userKey: currentSelectedParticpant ? currentSelectedParticpant.metadata.keyvalues.userKey : '',
	});
	const deleteData = api.PinataGroup.deleteGroupParticipantObject.useMutation();
	const { unregister, handleSubmit, reset } = useForm<FormValuesType>({
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		// Resolver for using Zod validation library schema
		// https://react-hook-form.com/docs/useform#resolver
		// resolver: {}
	});

	const [isLoading, setIsLoading] = useState(false);
	// const [participants, setParticipants] = useState();

	const onSubmit: SubmitHandler<FormValuesType> = async (data) => {
		try {
			if (walletAddress && currentSelectedParticpant && group) {
				//Fetch all instances with that user key and pending status and get ipfs hash
				const pendingEntries = participantData?.participant.rows;
				//Delete all objects
				if (pendingEntries != null) {
					for (const entry of pendingEntries) {
						// console.log(entry.ipfs_pin_hash);
						await deleteData.mutateAsync({ groupHash: entry.metadata.keyvalues.groupHash });
					}

					//Create new instances with approved status
					const hash = groupParticipantToIPFS.mutateAsync({
						groupHash: groupHash,
						creatorKey: walletAddress.toString(),
						userKey: currentSelectedParticpant.metadata.keyvalues.userKey.toString(),
						status: 'approved',
					});
					//console.log(hash);
					clearForm();
					handleOnClose();
				}
			}
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

	const serializeList = (list: IPFSGroupParticipantModel[]): DropDownContentModel[] => {
		return list.map((item) => ({
			name: item.metadata.keyvalues.userKey,
			value: item.metadata.keyvalues.userKey,
		}));
	};

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		//TODO: This filter on name should be replaced with filter on id?
		const selectedParticipant = participants?.find(
			(p: IPFSGroupParticipantModel) => p.metadata.keyvalues.userKey === event.target.value
		);
		if (selectedParticipant) setCurrentSelectedParticpant(selectedParticipant);
	};

	useEffect(() => {
		if (participants) setDropdownParticipants(serializeList(participants ?? []));
	}, [participants]);

	return (
		<BasicModal
			id="admit-user"
			header="Admit User"
			onClose={handleOnClose}
			content={
				<form onSubmit={handleSubmit(onSubmit)}>
					{dropdownParticipants.length > 0 ? (
						<div>
							<SelectOption
								id="product"
								name="product"
								placeholder="-- Please select user to approve --"
								defaultValue=""
								value={currentSelectedParticpant?.metadata.keyvalues.userKey}
								onChange={(e) => handleSelectChange(e)}
								options={dropdownParticipants}
							/>
						</div>
					) : null}
					<BasicButton type="primary" submitForm={true}>
						Admit
					</BasicButton>
				</form>
			}
		></BasicModal>
	);
};

export default AdmitUserModal;
