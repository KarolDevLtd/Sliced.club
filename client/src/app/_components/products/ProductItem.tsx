import React, { useCallback, useEffect, useState } from 'react';
import BasicModal from '../ui/BasicModal';
import InlineLink from '../ui/InlineLink';
import { api } from '~/trpc/react';
import { type IPFSProductModel } from '~/models/ipfs/ipfs-product-model';
import { toast } from 'react-toastify';
import ZoomableImage from '../ui/ZoomableImage';
import { fetchImageData } from '~/helpers/image-helper';
import BasicButton from '../ui/BasicButton';
import { IoPeople } from 'react-icons/io5';

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
	const dummyVal = Math.floor(Math.random() * 48);

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
				const currProd = productData.product!;
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
				onClick={() => handleClick}
			>
				<div className="col-span-1 min-h-full bg-medium-grey rounded">
					{hasImage ? (
						<ZoomableImage source={imageData[0] ?? null} width={100} height={100} alt={'image'} />
					) : null}
				</div>
				<div className="col-span-3 flex flex-col justify-center items-center">
					<p className="font-bold">{product?.name}</p>
				</div>
				<div className="col-span-2 flex items-center justify-center">
					<InlineLink href={`categories/${product?.category}`}>{product?.category}</InlineLink>
				</div>
				<div className="flex flex-row col-span-1 items-center justify-center">
					<div className="mx-2 flex flex-row">
						<IoPeople size={20} />
						<p>{dummyVal}</p>
					</div>
				</div>
				<div className="flex flex-row col-span-1 items-center justify-center">
					<div className="mx-2">
						<p className=" flex items-center justify-center">{dummyVal}%</p>
						<progress className="progress w-16" value={dummyVal} max={50} />
					</div>
				</div>
				<div className="flex flex-col col-span-2 items-center justify-center">
					<BasicButton type={'neutral'} onClick={handleClick}>
						View Details
					</BasicButton>
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
