/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useCallback, useEffect, useState } from 'react';
import router from 'next/router';
import { BasicModal } from '../ui/basic-modal';
import { InlineLink } from '../ui/inline-link';
import { api } from '~/trpc/react';
import { type IPFSProductModel } from '~/models/ipfs-product-model';
import { toast } from 'react-toastify';
import ZoomableImage from '../ui/zoomable-image';

type ProductItemProps = {
	currentProduct: string;
};

const ProductItem = ({ currentProduct }: ProductItemProps) => {
	const { data: productData } = api.PinataProduct.getProduct.useQuery({ hash: currentProduct });
	const [displayModal, setDisplayModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [product, setProduct] = useState<IPFSProductModel>();
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
		void router.push(`/groups/${product?.name}`);
		e?.stopPropagation();
	};

	//Get data from Firebase
	const fetchImageData = useCallback(async () => {
		setIsLoading(true);
		try {
			if (productData) {
				const currProd = productData.product as unknown as IPFSProductModel;
				setProduct(productData.product);
				// Fetch post image if exists
				if (currProd && currProd.imageHash!.length > 0) {
					setHasImage(true);
					if (Array.isArray(currProd.imageHash)) {
						await Promise.all(
							currProd.imageHash.map(async (element: string) => {
								await fetchImages(element, currProd.imageHash);
							})
						);
					}
				}
			}
		} catch (err) {
			console.log(err);
			toast.error('Error fetching one or more images');
		} finally {
			setIsLoading(false);
		}
	}, [productData]);

	//Get image from IPFS
	const fetchImages = async (imageHash: string, imageHashes) => {
		try {
			const response = await fetch(`/api/upload?imageHash=${imageHash}`);
			if (response.ok) {
				const blob = await response.blob();
				const imageUrl = URL.createObjectURL(blob);
				//Below used to render images in the order they were uploaded to db...
				// Find the index of the current imageHash in the imageHashes array
				const index = imageHashes.indexOf(imageHash);
				if (index !== -1) {
					// Update the state at the corresponding index
					setImageData((prevImageData) => {
						const newData = [...prevImageData];
						newData[index] = imageUrl;
						return newData;
					});
				} else {
					console.log('Image hash not found in imageHashes array');
				}
			} else {
				console.log('Error fetching image');
				setImageError(true);
			}
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		//Use void here as do not need result, use state set inside result
		void fetchImageData();
	}, [fetchImageData, productData]);

	return (
		// <div>{currentProduct}</div>
		<>
			{isLoading ? (
				'Loading...'
			) : (
				<div
					className="grid grid-cols-10 gap-4 p-4 bg-light-grey min-w-full min-h-[90px] rounded-md border border-[transparent] hover:border-black hover:cursor-pointer"
					// @ts-ignore
					onClick={(e) => handleClick(e)}
				>
					<div className="col-span-2 max-w-[120px] min-h-full bg-medium-grey rounded">
						{hasImage ? (
							<ZoomableImage source={imageData[0] ?? null} width={100} height={100} alt={'image'} />
						) : null}
					</div>
					<div className="col-span-2 flex flex-col justify-center">
						<p className="font-bold">{product?.name}</p>
						{/* <p className="text-sm text-dark-grey">{product?.groupOrganiser}</p> */}
					</div>
					<div className="col-span-2 flex items-center">
						<InlineLink href={`categories/${product?.category}`}>{product?.category}</InlineLink>
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
						header={<h2 className="text-xl font-semibold">Item Details</h2>}
						content={
							<div>
								<div className="flex items-center gap-1">
									<strong>Product name:</strong> <p>{product?.name}</p>
								</div>
								{/* <div className="flex items-center gap-1">
									<strong>Group Organiser:</strong> <p>{product.groupOrganiser}</p>
								</div> */}
								<div className="flex items-center gap-1">
									{/* <strong>Price:</strong> <p>{formatCurrency(product?.price)}</p> */}
									<strong>Price:</strong> <p>{product?.price}</p>
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

export default ProductItem;
