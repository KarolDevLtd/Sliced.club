import { preventActionNotLoggedIn } from '@/helpers/user-helper';
import { useWallet } from '@/providers/WalletProvider/walletProvider';
import { useMinaProvider } from '@/providers/MinaProvider/minaProvider';
import { useRouter } from 'next/router';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import GroupNavigation from '~/app/_components/groups/GroupNavigation';
import GroupPosts from '~/app/_components/groups/group-post/GroupPosts';
import Breadcrumbs from '~/app/_components/ui/Breadcrumbs';
import PageHeader from '~/app/_components/ui/PageHeader';
import { fetchImageData } from '~/helpers/image-helper';
import PlatformLayout from '~/layouts/platform';
import { type PinataGroupDataType, defaultGroup, type IPFSGroupModel } from '~/models/ipfs/ipfs-group-model';
import { type PinataProductDataType, defaultProduct, type IPFSProductModel } from '~/models/ipfs/ipfs-product-model';
import { api } from '~/trpc/react';
import AdmitUserModal from '~/app/_components/groups/AdmitUserModal';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import { showModal } from '@/helpers/modal-helper';
import {
	type PinataGroupParticipantsModel,
	defaultParticipant,
	type IPFSGroupParticipantModel,
} from '@/models/ipfs/ipfs-participant-model';
import Spinner from '@/app/_components/ui/Spinner';
import Carousel from '@/app/_components/ui/Carousel';
import ZoomableImage from '@/app/_components/ui/ZoomableImage';
import { type IPFSSearchModel } from '@/models/ipfs/ipfs-search-model';

export default function Group() {
	const router = useRouter();
	const { pathname, query, asPath } = router;

	const [refreshPosts, setRefreshPosts] = useState(false);
	const { walletAddress } = useWallet();
	const { addUserToGroup } = useMinaProvider();
	const [isLoading, setIsLoading] = useState(false);
	const [group, setGroup] = useState<IPFSGroupModel>();
	const [product, setProduct] = useState<IPFSProductModel>();
	const [participants, setParticipants] = useState<IPFSSearchModel[]>();
	const [hasImage, setHasImage] = useState<boolean>(false);
	const [imageData, setImageData] = useState<string[]>([]);
	const [imageError, setImageError] = useState(false);
	const [isParticipant, setIsParticipant] = useState<boolean>(false);
	const [pendingParticipants, setPendingParticipants] = useState<IPFSGroupParticipantModel[]>();

	let groupId: string | null | undefined = null;
	if (query.groupId) {
		if (Array.isArray(query.groupId)) {
			groupId = query.groupId[0];
		} else {
			groupId = query.groupId;
		}
	}

	const { data: groupData } = api.PinataGroup.getGroup.useQuery<PinataGroupDataType>({ hash: groupId });
	const { data: productData } = api.PinataProduct.getProduct.useQuery<PinataProductDataType>({
		hash: groupData == undefined ? '' : groupData?.group?.productHash,
	});
	const { data: participantData } = api.PinataGroup.getGroupParticipants.useQuery<PinataGroupParticipantsModel>({
		groupHash: groupId ?? '',
	});
	const groupParticipantToIPFS = api.PinataGroup.createGroupParticipantObject.useMutation();

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);

	const handlePostSubmission = () => {
		// After the post is submitted successfully, set refreshPosts to true to trigger a refresh of posts
		setRefreshPosts(true);
	};

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
				const currGroup = groupData.group;
				setGroup(currGroup);
			}
			if (productData) {
				const currProd = productData.product;
				setProduct(productData.product);
				await fetchImageData(currProd, setHasImage, setImageData, setImageError);
			}
			if (participantData) {
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
			console.log(participants);
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

	useEffect(() => {
		console.log('hasImage', hasImage);
		console.log('imageData', imageData);
	}, [hasImage, imageData]);

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
							subtext={group?.creatorKey ?? 'Group Organiser'}
							buttonText="Admit user"
							onClick={() => showAdmitModal()}
						/>
					</div>
				) : isParticipant ? (
					<PageHeader
						text={groupData?.group?.name ?? 'Group Name'}
						subtext={group?.creatorKey ?? 'Group Organiser'}
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
						subtext={group?.creatorKey ?? 'Group Organiser'}
						customElement={isLoading ? <Spinner /> : null}
						buttonText="Join group"
						onClick={async () => {
							try {
								setIsLoading(true);
								console.log('Joining group');
								if (groupId && walletAddress && group && !isParticipant) {
									await addUserToGroup(
										group.chainPubKey,
										walletAddress.toString(),
										parseInt(group.participants),
										parseInt(group.price),
										parseInt(group.duration),
										3, // missable
										parseInt(group.period)
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
			</div>

			<div className="flex-1">
				<div className="grid grid-cols-4 grid-rows-2 gap-2 h-auto">
					<div className="card card-side bg-base-100 col-span-4 items-center p-2 grid grid-cols-4">
						<figure className="h-48 bg-accent col-span-1 w-88">
							<Carousel
								slides={
									hasImage
										? imageData.map((hash) => ({
												content: (
													<div>
														{hasImage ? (
															<ZoomableImage
																source={hash ?? null}
																width={400}
																height={400}
																alt={'image'}
															/>
														) : (
															[]
														)}
													</div>
												),
											}))
										: []
								}
								options={{
									visibleSlides: 1,
								}}
							/>
						</figure>
						<div className="card-body col-span-3 h-60 flex">
							<h2 className="card-title">{product?.name ?? 'Product Name'}</h2>
							<div className="flex items-center gap-4">
								<span>Price: ${product?.price ?? '420.00'}</span>
								<span>Installment: ${group?.instalments}</span>
							</div>
							<p className="overflow-y-auto">
								{groupData?.group?.description ??
									'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sodales neque lacus, quis volutpat lorem faucibus a. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam sit amet augue rutrum, eleifend dui et, sodales orci. Duis eu sodales risus. Vivamus gravida fringilla nibh in venenatis. Proin sit amet leo dapibus, efficitur diam a, viverra leo. Donec metus ante, ornare in blandit eu, elementum id enim. Fusce augue leo, sollicitudin eu dolor vitae.'}
							</p>
						</div>
					</div>

					<GroupNavigation
						groupHash={groupId?.toString() ?? ''}
						group={group ?? defaultGroup}
						product={product ?? defaultProduct}
					/>
				</div>

				<div className="flex-1 grid grid-cols-8 gap-4">
					<div className="col-span-5">
						<GroupPosts groupId={groupId ?? ''} refetchPosts={handlePostSubmission} />
					</div>
					<div className="col-span-3"></div>
				</div>
			</div>
			<AdmitUserModal
				groupHash={groupId?.toString() ?? ''}
				participants={pendingParticipants ?? [defaultParticipant]}
				group={group ?? defaultGroup}
			/>
		</>
	);
}

Group.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
