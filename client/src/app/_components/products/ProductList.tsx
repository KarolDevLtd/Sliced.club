/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import { api } from '~/trpc/react';
import { useWallet } from '~/providers/WalletProvider';
import { type IPFSSearchModel } from '~/models/ipfs/ipfs-search-model';
import { defaultPageLimit } from '~/helpers/search-helper';
import { useInView } from 'react-intersection-observer';
import Spinner from '../ui/Spinner';

type ProductListProps = {
	heading?: string;
	isHomeScreen: boolean;
	// products: Product[];
};

const ProductList = ({ heading, isHomeScreen }: ProductListProps) => {
	const { isConnected, walletAddress } = useWallet();
	const [products, setProducts] = useState<IPFSSearchModel[]>([]);
	const [productCount, setProductCount] = useState<number>(0);
	const [displayProductCount, setDisplayProductCount] = useState(defaultPageLimit);

	const { ref, inView } = useInView();

	const {
		data: productData,
		error,
		refetch,
		isLoading,
	} = api.PinataProduct.getProducts.useQuery({
		creatorKey: walletAddress?.toString(),
		productCount: displayProductCount,
	});

	useEffect(() => {
		if (productData) {
			setProducts(productData.products == null ? [] : productData.products.rows);
			setProductCount(productData.products == null ? 0 : productData.products.count);
		}
	}, [productData]);

	useEffect(() => {
		if (error) {
			console.error('Error fetching products:', error);
		}
	}, [error]);

	useEffect(() => {
		if (inView) {
			setDisplayProductCount((prevCount) => prevCount + defaultPageLimit);
		}
	}, [inView]);

	return (
		<div className="flex flex-col gap-2 mb-4">
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
			{products && products.length > 0 ? (
				<div
					className={
						isHomeScreen
							? 'overflow-y-scroll flex flex-col m-4 h-60'
							: 'overflow-y-scroll flex flex-col m-4 h-96'
					}
				>
					{products.map((product, index) => (
						<ProductItem key={index} productHash={product.ipfs_pin_hash} />
					))}
					{productCount > displayProductCount ? <div ref={ref} /> : 'No more products to display...'}
					{isLoading ? <Spinner /> : null}
				</div>
			) : (
				<p>No products found.</p>
			)}
		</div>
	);
};

export default ProductList;
