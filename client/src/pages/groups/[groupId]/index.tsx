/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import TextInput from '@/app/_components/ui/TextInput';
import { preventActionNotLoggedIn } from '@/helpers/user-helper';
import { useWallet } from '@/providers/WalletProvider';
import { useMinaProvider } from '@/providers/minaprovider';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import GroupNavigation from '~/app/_components/groups/GroupNavigation';
import GroupPosts from '~/app/_components/groups/group-post/GroupPosts';
import Breadcrumbs from '~/app/_components/ui/Breadcrumbs';
import PageHeader from '~/app/_components/ui/PageHeader';
import { fetchImageData } from '~/helpers/image-helper';
import PlatformLayout from '~/layouts/platform';
import { type IPFSGroupModel } from '~/models/ipfs/ipfs-group-model';
import { type IPFSProductModel } from '~/models/ipfs/ipfs-product-model';
import { api } from '~/trpc/react';
import AdmitUserModal from '~/app/_components/groups/AdmitUserModal';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import { showModal } from '@/helpers/modal-helper';
import { type IPFSGroupParticipantModel } from '@/models/ipfs/ipfs-user-model';
import Spinner from '@/app/_components/ui/Spinner';
import BasicButton from '@/app/_components/ui/BasicButton';

export default function Group() {
	const router = useRouter();
	const [refreshPosts, setRefreshPosts] = useState(false);
	const { walletAddress } = useWallet();
	const { addUserToGroup, getUserStorage } = useMinaProvider();

	const groupId = router.query.groupId;
	const { data: groupData } = api.PinataGroup.getGroup.useQuery({ hash: groupId });
	const { data: productData } = api.PinataProduct.getProduct.useQuery({
		hash: groupData == undefined ? '' : groupData?.group?.productHash,
	});
	const { data: participantData } = api.PinataGroup.getGroupParticipants.useQuery({
		groupHash: groupData == undefined ? '' : groupId,
	});
	const groupParticipantToIPFS = api.PinataGroup.createGroupParticipantObject.useMutation();

	const [isLoading, setIsLoading] = useState(false);
	const [group, setGroup] = useState<IPFSGroupModel>();
	const [product, setProduct] = useState<IPFSProductModel>();
	const [participants, setParticipants] = useState<IPFSGroupParticipantModel[]>();
	const [hasImage, setHasImage] = useState<boolean>(false);
	const [imageData, setImageData] = useState<string[]>([]);
	const [imageError, setImageError] = useState(false);
	const [isParticipant, setIsParticipant] = useState<boolean>(false);
	const [pendingParticipants, setPendingParticipants] = useState<IPFSGroupParticipantModel[]>();

	const [admitUserKey, setAdmitUserKey] = useState('');

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);

	const handlePostSubmission = () => {
		// After the post is submitted successfully, set refreshPosts to true to trigger a refresh of posts
		setRefreshPosts(true);
	};

	const {} = useMinaProvider();

	const showAdmitModal = async () => {
		try {
			if (preventActionNotLoggedIn(isLoggedIn, 'Log in to create a group')) return;
			showModal('admit-user');
		} catch (err) {
			console.log('showGroupModal', err);
		}
	};

	const fetchInfo = useCallback(async () => {
		setIsLoading(true);
		try {
			if (groupData) {
				const currGroup = groupData.group as IPFSGroupModel;
				setGroup(currGroup);
				console.log('group data');
				// const z = api.PinataGroup.getGroupParticipants.useQuery({ groupHash: groupId });
				// console.log(z);
			}
			if (productData) {
				const currProd = productData.product as IPFSProductModel;
				setProduct(productData.product);
				await fetchImageData(currProd, setHasImage, setImageData, setImageError);
			}
			if (participantData) {
				// const currProd = productData.product as IPFSProductModel;
				// setProduct(productData.product);
				// await fetchImageData(currProd, setHasImage, setImageData, setImageError);
				console.log(participantData.participants);
				setParticipants(participantData.participants.rows);
			}
		} catch (err) {
			console.log(err);
			toast.error('Error fetching group item info');
		} finally {
			setIsLoading(false);
		}
	}, [groupData, productData, participantData]);

	useEffect(() => {
		if (participants) {
			// console.log('user');
			// console.log(participants[0].metadata.keyvalues.userKey);
			// console.log('wallet');
			// console.log(walletAddress);
			if (
				participants.some((participant) => participant.metadata.keyvalues.userKey === walletAddress?.toString())
			) {
				setIsParticipant(true);
			} else {
				setIsParticipant(false);
			}
			setPendingParticipants(
				participants.filter((participant) => participant.metadata.keyvalues.status === 'pending')
			);
		}
	}, [participants, walletAddress]);

	useEffect(() => {
		void fetchInfo();
	}, [fetchInfo, group]);

	return (
		<>
			<div className="flex flex-col justify-between items-start">
				<div>
					<Breadcrumbs
						breadCrumbs={[
							{
								text: 'Home',
								link: '/',
							},
							{
								text: 'Groups',
								link: '/groups',
							},
							{
								text: groupData?.group?.name ?? 'Group Name',
								link: '/',
							},
						]}
					/>
				</div>
				{group?.creatorKey == walletAddress ? (
					<div className="w-full">
						<PageHeader
							text={groupData?.group?.name ?? 'Group Name'}
							subtext={groupData?.group?.groupOrganiser ?? 'Group Organiser'}
							buttonText="Admit user"
							onClick={() => showAdmitModal()}
						/>
					</div>
				) : isParticipant ? (
					<PageHeader
						text={groupData?.group?.name ?? 'Group Name'}
						subtext={groupData?.group?.groupOrganiser ?? 'Group Organiser'}
						customElement={
							<div className="px-4">
								<strong className=" flex border border-bellow rounded-3xl px-5 text-bellow">
									Joined Group
								</strong>
							</div>
						}
					/>
				) : (
					<PageHeader
						text={groupData?.group?.name ?? 'Group Name'}
						subtext={groupData?.group?.groupOrganiser ?? 'Group Organiser'}
						customElement={isLoading ? <Spinner /> : null}
						buttonText="Join group"
						onClick={async () => {
							try {
								setIsLoading(true);
								console.log('Joining group');
								if (groupId && walletAddress && group && !isParticipant) {
									console.log('add user ipfs values :\n', groupData.group);

									await addUserToGroup(
										groupData.group.chainPubKey,
										// currentSelectedParticpant.metadata.keyvalues.userKey,
										walletAddress.toString(),
										parseInt(groupData.group.participants),
										parseInt(groupData.group.price),
										parseInt(groupData.group.duration),
										// parseInt(groupData.group.missable) // TODO that's wrong
										3, // missable
										// payment duration
										parseInt(groupData.group.period)
									);
									await groupParticipantToIPFS.mutateAsync({
										groupHash: groupId.toString(),
										creatorKey: group.creatorKey,
										userKey: walletAddress.toString(),
										status: 'approved',
									});
									setIsParticipant(true);
								}
							} catch (error) {
								console.log(error);
							} finally {
								setIsLoading(false);
							}
						}}
					/>
				)}
				{/* <PageHeader
					text={'Pay'}
					subtext={groupData?.group?.groupOrganiser ?? 'Group Organiser'}
					buttonText="Payment"
					onClick={async () => {
						try {
							console.log('paying group');
							if (groupId && walletAddress && group) {
								// console.log('add user ipfs values :\n', groupData.group);
								console.log(walletAddress.toString());
								console.log(parseInt(groupData.group.participants));
								console.log(parseInt(groupData.group.price));
								console.log(parseInt(groupData.group.duration));
								await userPayment(
									groupData.group.chainPubKey,
									// currentSelectedParticpant.metadata.keyvalues.userKey,
									walletAddress.toString(),
									parseInt(groupData.group.participants),
									parseInt(groupData.group.price),
									parseInt(groupData.group.duration),
									// parseInt(groupData.group.missable) // TODO that's wrong
									3, // missable
									2592000, // payment duration
									0
								);
								// await groupParticipantToIPFS.mutateAsync({
								// 	groupHash: groupId.toString(),
								// 	creatorKey: group.creatorKey,
								// 	userKey: walletAddress.toString(),
								// 	status: 'approved',
								// });
								// setIsParticipant(true);
							}
						} catch (error) {
							console.log(error);
						}
					}}
				/> */}
			</div>

			<div className="flex-1">
				<BasicButton
					type={'primary'}
					onClick={async () => {
						console.log('group', group?.chainPubKey);
						console.log('groupData', groupData.group.chainPubKey);
						await getUserStorage(walletAddress?.toString(), group?.chainPubKey);
					}}
				>
					Invoke user details
				</BasicButton>
				<div className="grid grid-cols-4 grid-rows-2 gap-2">
					<div className="card card-side bg-base-100 col-span-4 items-center">
						<figure className="min-w-[200px] h-32 bg-accent"></figure>
						<div className="card-body p-6">
							<h2 className="card-title">{product?.name ?? 'Product Name'}</h2>
							<div className="flex items-center gap-4">
								<span>Price: ${product?.price ?? '420.00'}</span>
								<span>Installment: ${group?.instalments}</span>
							</div>
							<p>
								{groupData?.group?.description ??
									'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sodales neque lacus, quis volutpat lorem faucibus a. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam sit amet augue rutrum, eleifend dui et, sodales orci. Duis eu sodales risus. Vivamus gravida fringilla nibh in venenatis. Proin sit amet leo dapibus, efficitur diam a, viverra leo. Donec metus ante, ornare in blandit eu, elementum id enim. Fusce augue leo, sollicitudin eu dolor vitae.'}
							</p>
						</div>
					</div>

					<GroupNavigation groupHash={groupId?.toString() ?? ''} group={group} product={product} />
				</div>

				<div className="flex-1 mt-6 grid grid-cols-8 gap-4">
					<div className="col-span-5">
						<GroupPosts groupId={groupId} refetchPosts={handlePostSubmission} />
					</div>
					<div className="col-span-3"></div>
				</div>
			</div>
			<AdmitUserModal groupHash={groupId?.toString()} participants={pendingParticipants} group={group} />
		</>
	);
}

Group.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
