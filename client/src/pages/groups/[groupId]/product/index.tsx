import ImageCarousel from '@/app/_components/ui/ImageCarousel';
import { type AttributeModel } from '@/models/attribute-model';
import { type IPFSGroupModel, defaultGroup } from '@/models/ipfs/ipfs-group-model';
import { useRouter } from 'next/router';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import GroupNavigation from '~/app/_components/groups/GroupNavigation';
import PageHeader from '~/app/_components/ui/PageHeader';
import { fetchImageData } from '~/helpers/image-helper';
import PlatformLayout from '~/layouts/platform';
import { defaultProduct, type IPFSProductModel } from '~/models/ipfs/ipfs-product-model';
import { api } from '~/trpc/react';

interface PinataGroupDataType {
	group: IPFSGroupModel;
}

interface PinataProductDataType {
	product: IPFSProductModel;
}

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

	let groupId: string | null | undefined = null;
	if (query.groupId) {
		if (Array.isArray(query.groupId)) {
			groupId = query.groupId[0];
		} else {
			groupId = query.groupId;
		}
	}

	let hash: string | null | undefined = null;
	if (query.hash) {
		if (Array.isArray(query.hash)) {
			hash = query.hash[0];
		} else {
			hash = query.hash;
		}
	}

	const { data: groupData } = api.PinataGroup.getGroup.useQuery<PinataGroupDataType>({ hash: groupId });
	const { data: productData } = api.PinataProduct.getProduct.useQuery<PinataProductDataType>({ hash: hash });
	//Get data from Firebase
	const fetchAndDisplayImages = useCallback(async () => {
		setIsLoading(true);
		try {
			if (productData) {
				const currProd = productData.product;
				setProduct(productData.product);
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
				<PageHeader text={'Product Details'} buttonText="Back" onClick={handleBackClick} />
			</div>
			<div className="grid grid-cols-9 gap-8 w-full h-full rounded-xl border border-accent p-5">
				<div className="grid gap-8 col-span-3">
					<div className="row-span-1">
						<ImageCarousel images={imageData} />
					</div>
					<div className="row-span-4 px-8">
						{productData?.product.productAttributes?.map((key: AttributeModel, i: number) =>
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
			<GroupNavigation
				groupHash={query.groupId?.toString() ?? ''}
				group={groupData?.group ?? defaultGroup}
				product={productData?.product ?? defaultProduct}
			/>
		</>
	);
}

GroupProductDetails.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
