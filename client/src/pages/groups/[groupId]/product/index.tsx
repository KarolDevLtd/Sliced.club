/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import CCarousel from '@/app/_components/ui/CCarousel';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import GroupNavigation from '~/app/_components/groups/GroupNavigation';
import PageHeader from '~/app/_components/ui/PageHeader';
import ZoomableImage from '~/app/_components/ui/ZoomableImage';
import { fetchImageData } from '~/helpers/image-helper';
import PlatformLayout from '~/layouts/platform';
import { IPFSProductModel } from '~/models/ipfs/ipfs-product-model';
import { api } from '~/trpc/react';

/* eslint-disable @typescript-eslint/no-unsafe-call */
export default function GroupProductDetails() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [product, setProduct] = useState<IPFSProductModel>();
	const [hasImage, setHasImage] = useState<boolean>(false);
	const [imageData, setImageData] = useState<string[]>([]);
	const [imageError, setImageError] = useState(false);

	const { pathname, query, asPath } = router;
	const handleBackClick = () => {
		router.back();
	};
	const { data: groupData } = api.PinataGroup.getGroup.useQuery({ hash: query.groupId });
	const { data: productData } = api.PinataProduct.getProduct.useQuery({ hash: query.hash });
	//Get data from Firebase
	const fetchAndDisplayImages = useCallback(async () => {
		setIsLoading(true);
		try {
			if (productData) {
				const currProd = productData.product as IPFSProductModel;
				setProduct(productData.product as IPFSProductModel);
				await fetchImageData(currProd, setHasImage, setImageData, setImageError);
			}
		} catch (err) {
			console.log(err);
			toast.error('Error fetching one or more images');
		} finally {
			setIsLoading(false);
		}
	}, [productData]);

	useEffect(() => {
		//Use void here as do not need result, use state set inside result
		void fetchAndDisplayImages();
	}, [fetchAndDisplayImages, productData]);

	return (
		<>
			<div className="flex flex-col justify-between items-start">
				<PageHeader
					text={'Product Details'}
					// text={groupData?.group?.name ?? 'Group Name'}
					// subtext={groupData?.group?.groupOrganiser ?? 'Group Organiser'}
					buttonText="Back"
					onClick={handleBackClick}
				/>
			</div>
			<div className="grid grid-cols-9 gap-8 w-full h-full rounded-xl border border-accent p-5">
				<div className="grid gap-8 col-span-3">
					<div className="row-span-1">
						<CCarousel images={imageData} />
					</div>
					<div className="row-span-4 px-8">
						{productData?.product.productAttributes.map((key, i) =>
							key.propertyName != null && key.propertyName != '' ? (
								<div key={i} className="flex justify-between">
									<div>{key.propertyName}</div>
									<strong>{key.propertyValue}</strong>
								</div>
							) : null
						)}
					</div>
				</div>
				<div className="col-5 col-span-6 gap-8">
					<div className="text-3xl">{productData?.product.name}</div>
					<br />
					<div>{groupData?.group.description}</div>
				</div>
			</div>
			<GroupNavigation groupHash={query.groupId} group={groupData.group} product={productData.product} />

			{/* <GroupNavigation/> */}
		</>
	);
}

GroupProductDetails.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
