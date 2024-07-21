import React, { useCallback, useEffect, useState } from 'react';
import BasicModal from '../ui/BasicModal';
import InlineLink from '../ui/InlineLink';
import { api } from '~/trpc/react';
import { type IPFSProductModel } from '~/models/ipfs/ipfs-product-model';
import { toast } from 'react-toastify';
import ZoomableImage from '../ui/ZoomableImage';
import { fetchImageData } from '~/helpers/image-helper';

type ProductItemProps = {
	productHash: string;
};

const ProductItem = ({ productHash }: ProductItemProps) => {
	const { data: productData } = api.PinataProduct.getProduct.useQuery({ hash: productHash });
	const [isLoading, setIsLoading] = useState(false);
	const [product, setProduct] = useState<IPFSProductModel>();
	const [hasImage, setHasImage] = useState<boolean>(false);
	const [imageData, setImageData] = useState<string[]>([]);
	const [imageError, setImageError] = useState(false);

	const handleClick = (e: MouseEvent) => {
		//TODO: Is here a product page not associated with group?
		// void router.push(`/groups/${firebaseProduct.id}`);
		e?.stopPropagation();
	};

	//Get data from Firebase
	const fetchAndDisplayImages = useCallback(async () => {
		setIsLoading(true);
		try {
			if (productData) {
				const currProd = productData.product as IPFSProductModel;
				setProduct(currProd);
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
			{/* //TODO - BUG here, should be able to zoom image without triggering parent onClick */}
			<div
				className="grid grid-cols-10 gap-4 p-2 my-2 min-w-full min-h-[90px] rounded-md bg-itemfade border border-accent hover:border-neutral hover:cursor-pointer overflow-hidden"
				onClick={(e) => handleClick}
			>
				<div className="col-span-2 max-w-[120px] min-h-full bg-medium-grey rounded">
					{hasImage ? (
						<ZoomableImage source={imageData[0] ?? null} width={100} height={100} alt={'image'} />
					) : null}
				</div>
				<div className="col-span-2 flex flex-col justify-center">
					<p className="font-bold">{product?.name}</p>
				</div>
				<div className="col-span-2 flex items-center">
					<InlineLink href={`categories/${product?.category}`}>{product?.category}</InlineLink>
				</div>
				<BasicModal
					id="product-item"
					header="Item Details"
					content={
						<div>
							<div className="flex items-center gap-1">
								<strong>Product name:</strong> <p>{product?.name}</p>
							</div>
							<div className="flex items-center gap-1">
								<strong>Price:</strong> <p>{product?.price}</p>
							</div>
						</div>
					}
				/>
			</div>
		</>
	);
};

export default ProductItem;
