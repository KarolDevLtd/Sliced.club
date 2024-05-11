/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import router from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { type IPFSGroupModel } from '~/models/ipfs/ipfs-group-model';
import { api } from '~/trpc/react';
import BasicModal from '../ui/BasicModal';
import { toast } from 'react-toastify';
import { type FirebaseGroupModel } from '~/models/firebase/firebase-group-model';
import ZoomableImage from '../ui/ZoomableImage';
import { type IPFSProductModel } from '~/models/ipfs/ipfs-product-model';
import { fetchImageData } from '~/helpers/image-helper';
import { IoPeople } from 'react-icons/io5';
import InlineLink from '../ui/InlineLink';
import BasicButton from '../ui/BasicButton';

type GroupItemProps = {
	firebaseGroup: FirebaseGroupModel;
};

const GroupItem = ({ firebaseGroup }: GroupItemProps) => {
	const { data: groupData } = api.PinataGroup.getGroup.useQuery({ hash: firebaseGroup.groupHash });
	const { data: productData } = api.PinataProduct.getProduct.useQuery({ hash: groupData?.group.productHash });
	const [displayModal, setDisplayModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [group, setGroup] = useState<IPFSGroupModel>();
	const [product, setProduct] = useState<IPFSProductModel>();
	const [hasImage, setHasImage] = useState<boolean>(false);
	const [imageData, setImageData] = useState<string[]>([]);
	const [imageError, setImageError] = useState(false);

	const toggleModal = () => {
		setDisplayModal(!displayModal);
	};

	const handleClick = (e: Event | undefined) => {
		//At this point we have all group information from firebase and IPFS
		//Pass to reduce need to query?
		void router.push({
			pathname: `/groups/${firebaseGroup.id}`,
			query: {
				groupName: firebaseGroup.name,
				groupHash: firebaseGroup.groupHash,
				productHash: group?.productHash,
			},
		});
		e?.stopPropagation();
	};

	// Get data from Firebase
	const fetchInfo = useCallback(async () => {
		setIsLoading(true);
		try {
			if (groupData) {
				const currGroup = groupData.group as IPFSGroupModel;
				setGroup(currGroup);
			}
			if (productData) {
				const currProd = productData.product as IPFSProductModel;
				setProduct(productData.product);
				await fetchImageData(currProd, setHasImage, setImageData, setImageError);
			}
		} catch (err) {
			console.log(err);
			toast.error('Error fetching group item info');
		} finally {
			setIsLoading(false);
		}
	}, [groupData, productData]);

	useEffect(() => {
		void fetchInfo();
	}, [fetchInfo, group]);

	return (
		<>
			{isLoading ? (
				'Loading...'
			) : (
				//TODO - BUG here, should be able to zoom image without triggering parent onClick
				<div
					className="grid grid-cols-10 gap-4 p-4 bg-light-grey min-w-full min-h-[90px] rounded-md border border-[transparent] hover:border-black hover:cursor-pointer"
					// @ts-ignore
					// onClick={(e) => handleClick(e)}
				>
					<div className="col-span-1 flex flex-col justify-center">
						{hasImage ? (
							<ZoomableImage source={imageData[0] ?? null} width={100} height={100} alt={'image'} />
						) : null}
					</div>
					<div className="flex flex-col col-span-3 items-center justify-center">
						<strong>{group?.name}</strong>
						<strong>{product?.name}</strong>
					</div>

					<div className="flex flex-col col-span-2 items-center justify-center">
						<InlineLink href={`categories/${product?.category}`}>{product?.category}</InlineLink>
					</div>

					<div className="flex flex-row col-span-2 items-center justify-center">
						<IoPeople />
						<p>{group?.participants}</p>
					</div>

					<div className="flex flex-col col-span-2 items-center justify-center">
						<BasicButton type={'secondary'} onClick={(e) => handleClick(e)}>
							View Details
						</BasicButton>
					</div>
				</div>
			)}
		</>
	);
};

export default GroupItem;
