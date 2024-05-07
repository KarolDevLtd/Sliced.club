/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import { type Product } from '~/types/product-types';
import { api } from '~/trpc/react';
import { useWallet } from '../../../providers/WalletProvider/index';
import { type FirebaseProductModel } from '~/models/firebase-product-model';

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
	} = api.FirebaseProduct.getProducts.useQuery({
		creatorKey: walletAddress?.toString(),
	});

	const [products, setProducts] = useState<FirebaseProductModel[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);

		if (productData) {
			setProducts(productData.products);
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
			{products ? (
				products.map((product, index) => {
					return <ProductItem key={index} currentProduct={product.productHash} />;
				})
			) : (
				<p>No products found.</p>
			)}
		</div>
	);
};
export default ProductList;
