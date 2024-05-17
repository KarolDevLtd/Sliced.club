/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import { api } from '~/trpc/react';
import { useWallet } from '~/providers/WalletProvider';

type ProductListProps = {
	heading?: string;
	// products: Product[];
};

const ProductList = ({ heading }: ProductListProps) => {
	const { isConnected, walletAddress } = useWallet();
	const {
		data: productData,
		error,
		refetch,
	} = api.PinataProduct.getProducts.useQuery({ creatorKey: walletAddress?.toString() });

	const [products, setProducts] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);

		if (productData) {
			setProducts(productData.products?.rows);
			setIsLoading(false);
		}
	}, [productData]);

	useEffect(() => {
		if (error) {
			console.error('Error fetching products:', error);
			setIsLoading(false);
		}
	}, [error]);

	return (
		<div className="flex flex-col gap-2 mb-4">
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
			{products && products.length > 0 ? (
				products.map((product, index) => {
					return <ProductItem key={index} productHash={product.ipfs_pin_hash} />;
				})
			) : (
				<p>No products found.</p>
			)}
		</div>
	);
};
export default ProductList;
