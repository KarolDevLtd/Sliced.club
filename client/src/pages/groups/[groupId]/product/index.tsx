/* eslint-disable @typescript-eslint/no-unsafe-member-access */

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
	// const { data: groupData } = api.PinataGroup.getGroup.useQuery({ hash: groupHash });
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

	console.log('Router Pathname:', pathname);
	console.log('Router Query:', query);
	console.log('Router AsPath:', asPath);

	useEffect(() => {
		console.log(productData);
	}, [productData]);

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
			<div className="grid grid-cols-2 gap-4 w-full h-full">
				<div className="grid grid-rows-2 gap-4 h-full">
					<div className="bg-accent">
						<div className="col-span-1 flex flex-col justify-center">
							{hasImage ? (
								<ZoomableImage source={imageData[0] ?? null} width={275} height={275} alt={'image'} />
							) : null}
						</div>
					</div>
					<div className="bg-accent">
						{productData?.product.productAttributes.map((key, i) =>
							key.propertyName != null && key.propertyName != '' ? (
								<div key={i.propertyName} className="flex justify-between">
									<div>{key.propertyName}</div>
									<div>{key.propertyValue}</div>
								</div>
							) : null
						)}
					</div>
				</div>
				<div className="bg-accent">{productData?.product.name}</div>
			</div>
			{/* <GroupNavigation/> */}
		</>
	);
}

GroupProductDetails.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
