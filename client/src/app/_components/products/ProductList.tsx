/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import { type Product } from '~/types/product-types';
import { api } from '~/trpc/react';
import { useWallet } from '~/providers/walletprovider';
import { preventActionWalletNotConnected } from '~/helpers/user-helper';

import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import { FirebaseProductModel } from '~/models/firebase-product-model';

type ProductListProps = {
	heading?: string;
	// products: Product[];
};

const ProductList = ({ heading }: ProductListProps) => {
	const { isConnected, walletAddress } = useWallet();

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);

	// if (preventActionWalletNotConnected(walletConnected, 'Connect a wallet to post')) return;

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
					return <div key={index}>{product.productHash}</div>;
					// <ProductItem key={index} product={product} />;
				})
			) : (
				<p>No products found.</p>
			)}
		</div>
	);
};
export default ProductList;
