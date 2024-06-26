import TextInput from '../ui/TextInput';
import BasicModal from '../ui/BasicModal';
import { useForm } from 'react-hook-form';
import BasicButton from '../ui/BasicButton';
import { closeModal } from '@/helpers/modal-helper';
import { useWallet } from '@/providers/WalletProvider';
import { api } from '@/trpc/react';
import { ChangeEvent, use, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { DropDownContentModel } from '@/models/dropdown-content-model';
import { IPFSSearchModel } from '@/models/ipfs/ipfs-search-model';
import { IPFSGroupParticipantModel } from '@/models/ipfs/ipfs-user-model';
import SelectOption from '../ui/SelectOption';
import { useMinaProvider } from '@/providers/minaprovider';
import { IPFSGroupModel } from '@/models/ipfs/ipfs-group-model';
type AdmitUserModalProps = {
	groupHash: string;
	participants: IPFSGroupParticipantModel[];
	group: IPFSGroupModel;
};

const AdmitUserModal = ({ groupHash, participants, group }: AdmitUserModalProps) => {
	const { isConnected, walletAddress } = useWallet();
	const { addUserToGroup, groupPublicKey } = useMinaProvider();
	const [dropdownParticipants, setDropdownParticipants] = useState<DropDownContentModel[]>([]);
	const [currentSelectedParticpant, setCurrentSelectedParticpant] = useState<IPFSGroupParticipantModel>();

	const groupParticipantToIPFS = api.PinataGroup.createGroupParticipantObject.useMutation();
	const { data: participantData } = api.PinataGroup.getGroupParticipant.useQuery({
		groupHash: groupHash,
		userKey: currentSelectedParticpant ? currentSelectedParticpant.metadata.keyvalues.userKey : '',
	});
	const deleteData = api.PinataGroup.deleteGroupParticipantObject.useMutation();
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
			//if not null, then need to update
			if (walletAddress && currentSelectedParticpant && group) {
				//addUserToGroup
				// console.log('pubkeyt', group.chainPubKey.toString());
				// await addUserToGroup(
				// 	group.chainPubKey.toString(),
				// 	currentSelectedParticpant.metadata.keyvalues.userKey,
				// 	parseInt(group.participants),
				// 	parseInt(group.price),
				// 	parseInt(group.duration),
				// 	3
				// );

				//Fetch all instances with that user key and pending status and get ipfs hash
				const pendingEntries = participantData?.participant.rows;
				//Delete all objects
				for (let i = 0; i < pendingEntries.length; i++) {
					// console.log(pendingEntries[i].ipfs_pin_hash);
					await deleteData.mutateAsync({ groupHash: pendingEntries[i].ipfs_pin_hash });
				}
				//Create new instances with approved status
				const hash = groupParticipantToIPFS.mutateAsync({
					groupHash: groupHash,
					creatorKey: walletAddress!.toString(),
					userKey: currentSelectedParticpant.metadata.keyvalues.userKey.toString(),
					status: 'approved',
				});
				//console.log(hash);
				clearForm();
				handleOnClose();
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
		// console.log('list');
		// console.log(list);
		return list.map((item) => ({
			name: item.metadata.keyvalues.userKey,
			value: item.metadata.keyvalues.userKey,
		}));
	};

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		//TODO: This filter on name should be replaced with filter on id?
		const selectedParticipant = participants?.find((p) => p.metadata.keyvalues.userKey === event.target.value)!;
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
					<BasicButton
						type="primary"
						// icon={isLoading ? <Spinner size="sm" /> : null}
						// disabled={isLoading}
						submitForm={true}
					>
						Admit
					</BasicButton>
					{/* {participants ? (
						participants.users.rows.map((participant: any, index) => {
							return (
								<div>
									<div key={index}>{participant.ipfs_pin_hash}</div>
								</div>
							);
						})
					) : (
						<p>No participants</p>
					)} */}
				</form>
			}
		></BasicModal>
	);
};

export default AdmitUserModal;
