import router from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { type IPFSGroupModel } from '~/models/ipfs/ipfs-group-model';
import { api } from '~/trpc/react';
import BasicModal from '../ui/BasicModal';
import { toast } from 'react-toastify';
import ZoomableImage from '../ui/ZoomableImage';
import { type IPFSProductModel } from '~/models/ipfs/ipfs-product-model';
import { fetchImageData } from '~/helpers/image-helper';
import { IoPeople } from 'react-icons/io5';
import InlineLink from '../ui/InlineLink';
import BasicButton from '../ui/BasicButton';

type GroupItemProps = {
	groupHash: string;
	productHash: string;
};

const GroupItem = ({ groupHash, productHash }: GroupItemProps) => {
	const { data: groupData } = api.PinataGroup.getGroup.useQuery({ hash: groupHash });
	const { data: productData } = api.PinataProduct.getProduct.useQuery({ hash: productHash });
	const [isLoading, setIsLoading] = useState(false);
	const [group, setGroup] = useState<IPFSGroupModel>();
	const [product, setProduct] = useState<IPFSProductModel>();
	const [hasImage, setHasImage] = useState<boolean>(false);
	const [imageData, setImageData] = useState<string[]>([]);
	const [imageError, setImageError] = useState(false);

	const handleClick = (e: MouseEvent) => {
		//At this point we have all group information from firebase and IPFS
		//Pass to reduce need to query?
		void router.push({
			pathname: `/groups/${groupHash}`,
			// query: {
			// 	groupHash: firebaseGroup.groupHash,
			// },
		});
		e?.stopPropagation();
	};

	// Get data from Firebase
	const fetchInfo = useCallback(async () => {
		setIsLoading(true);
		try {
			if (groupData) {
				const currGroup = groupData.group;
				setGroup(currGroup);
			}
			if (productData) {
				const currProd = productData.product!;
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
			<div className="grid bg-itemfade border border-accent grid-cols-10 gap-2 p-2 my-2 min-w-full min-h-[100px] rounded-md hover:border-neutral hover:cursor-pointer overflow-hidden">
				<div className="col-span-1 flex flex-col justify-center">
					{hasImage ? (
						<ZoomableImage source={imageData[0] ?? null} width={80} height={80} alt={'image'} />
					) : null}
				</div>
				<div className="flex flex-col col-span-3 items-center justify-center">
					<strong>{group?.name}</strong>
					<strong>{product?.name}</strong>
					<strong>{product?.price}</strong>
				</div>
				<div className="flex flex-col col-span-2 items-center justify-center">
					<InlineLink href={`categories/${product?.category}`}>{product?.category}</InlineLink>
				</div>

				<div className="flex flex-row col-span-2 items-center justify-center">
					<IoPeople />
					<p>{group?.participants}</p>
				</div>

				<div className="flex flex-col col-span-2 items-center justify-center">
					<BasicButton type={'secondary'} onClick={handleClick}>
						View Details
					</BasicButton>
				</div>
				<BasicModal
					id="group-item"
					header="Group Details"
					content={
						<div>
							<div className="flex items-center gap-1">
								<strong>Group name:</strong> <p>{group?.name}</p>
							</div>
							<div className="flex items-center gap-1">
								<strong>Organiser:</strong> <p>{group?.creatorKey}</p>
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
						</div>
					}
				/>
			</div>
		</>
	);
};

export default GroupItem;
