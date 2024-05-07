/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// import React, { useCallback, useEffect, useState } from 'react';
// import router from 'next/router';
// import { BasicModal } from '../ui/basic-modal';
// import { InlineLink } from '../ui/inline-link';
import router from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { type IPFSGroupModel } from '~/models/ipfs-group-model';
import { api } from '~/trpc/react';
import { BasicModal } from '../ui/BasicModal';
import { toast } from 'react-toastify';
// import { type IPFSProductModel } from '~/models/ipfs-product-model';
// import { toast } from 'react-toastify';
// import ZoomableImage from '../ui/zoomable-image';
// import { fetchImageData } from '~/helpers/image-helper';

type GroupItemProps = {
	currentGroup: string;
	creatorId: string;
};

const GroupItem = ({ currentGroup, creatorId }: GroupItemProps) => {
	const { data: groupData } = api.PinataGroup.getGroup.useQuery({ hash: currentGroup });
	const [displayModal, setDisplayModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [group, setGroup] = useState<IPFSGroupModel>();
	const [hasImage, setHasImage] = useState<boolean>(false);
	const [imageData, setImageData] = useState<string[]>([]);
	const [imageError, setImageError] = useState(false);

	const toggleModal = () => {
		setDisplayModal(!displayModal);
	};

	// const completedRatio = product?.itemsReceived ? (product.itemsReceived / product.groupMembers) * 100 : 0;

	// const completedPercentage = () => {
	// 	return product.itemsReceived ? `${Math.round(completedRatio)}%` : 0;
	// };

	const handleClick = (e: Event | undefined) => {
		void router.push(`/groups/${group?.name}`);
		e?.stopPropagation();
	};

	// Get data from Firebase
	const fetchInfo = useCallback(async () => {
		setIsLoading(true);
		try {
			if (groupData) {
				const currGroup = groupData.group as unknown as IPFSGroupModel;
				setGroup(currGroup);
				// await fetchImageData(currProd, setHasImage, setImageData, setImageError);
			}
		} catch (err) {
			console.log(err);
			toast.error('Error fetching one or more images');
		} finally {
			setIsLoading(false);
		}
	}, [groupData]);

	useEffect(() => {
		//Use void here as do not need result, use state set inside result
		void fetchInfo();
	}, [fetchInfo, group]);

	return (
		// <div>{currentProduct}</div>
		<>
			{isLoading ? (
				'Loading...'
			) : (
				//TODO - BUG here, should be able to zoom image without triggering parent onClick
				<div
					className="grid grid-cols-10 gap-4 p-4 bg-light-grey min-w-full min-h-[90px] rounded-md border border-[transparent] hover:border-black hover:cursor-pointer"
					// @ts-ignore
					onClick={(e) => handleClick(e)}
				>
					{/* <div className="col-span-2 max-w-[120px] min-h-full bg-medium-grey rounded">
						{hasImage ? (
							<ZoomableImage source={imageData[0] ?? null} width={100} height={100} alt={'image'} />
						) : null}
					</div> */}
					<div className="col-span-2 flex flex-col justify-center">
						<strong>Group name:</strong> <p>{group?.name}</p>
						<strong>Creator ID:</strong> <p>{creatorId}</p>
						<strong>Price:</strong>{' '}
						<p>
							{group?.currency}
							{group?.price}
						</p>
						<strong>Duration:</strong> <p>{group?.duration}</p>
						<strong>Participants:</strong> <p>{group?.participants}</p>
						<strong>Product Hash:</strong> <p>{group?.productHash}</p>
						{/* <p className="text-sm text-dark-grey">{creatorId}</p> */}
					</div>

					{/* <div className="col-span-1 flex items-center gap-1">
					<FaUserGroup />
					<p>{product?.groupMembers}</p>
				</div> */}
					{/* <div className="col-span-1 flex items-center">
					{product?.itemsReceived ? (
						<div>
							<p>{completedPercentage()}</p>
							<ProgressBar progress={completedRatio} />
						</div>
					) : null}
				</div> */}
					{/* <div className="col-span-2 flex items-center">
					<BasicButton type="secondary" onClick={(e) => handleClick(e)}>
						View details
					</BasicButton>
				</div> */}
					<BasicModal
						isOpen={displayModal}
						onClose={toggleModal}
						header={<h2 className="text-xl font-semibold">Group Details</h2>}
						content={
							<div>
								<div className="flex items-center gap-1">
									<strong>Group name:</strong> <p>{group?.name}</p>
								</div>
								<div className="flex items-center gap-1">
									<strong>Organiser:</strong> <p>{groupData?.group?.creatorId}</p>
									<strong>:</strong> <p>{group?.country}</p>
								</div>
								<div className="flex items-center gap-1">
									<strong>Price:</strong> <p>{group?.price}</p>
									<strong>:</strong> <p>{group?.country}</p>
								</div>
								<div className="flex items-center gap-1">
									<strong>Currency:</strong> <p>{group?.currency}</p>
								</div>
								<div className="flex items-center gap-1">
									<strong>Duration:</strong> <p>{group?.duration}</p>
									<strong>:</strong> <p>{group?.country}</p>
								</div>
								{/* <div className="flex items-center gap-1">
									<strong>Group members:</strong> <p>{product.groupMembers}</p>
								</div>
								{product.itemsReceived ? (
									<div className="flex items-center gap-1">
										<strong>Items received:</strong> <p>{product.itemsReceived}</p>
									</div>
								) : null} */}
							</div>
						}
					/>
				</div>
			)}
		</>
	);
};

export default GroupItem;
