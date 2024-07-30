import React, { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import { api } from '~/trpc/react';
import { useWallet } from '@/providers/WalletProvider/walletProvider';
import { type IPFSSearchModel } from '~/models/ipfs/ipfs-search-model';
import { defaultPageLimit } from '~/helpers/search-helper';
import { useInView } from 'react-intersection-observer';
import Spinner from '../ui/Spinner';
import Skeleton from '../ui/Skeleton';
import { type PinataProductsDataType } from '@/models/ipfs/ipfs-product-model';

type ProductListProps = {
	heading?: string;
	isHomeScreen: boolean;
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
	} = api.PinataProduct.getProducts.useQuery<PinataProductsDataType>({
		creatorKey: walletAddress?.toString(),
		productCount: displayProductCount,
	});

	useEffect(() => {
		if (productData) {
			setProducts(productData == null ? [] : productData.rows);
			setProductCount(productData == null ? 0 : productData.count);
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
		<div className="flex flex-col gap-2 py-4">
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
			{isLoading && products.length == 0 ? (
				<Skeleton count={isHomeScreen ? 1 : 6} />
			) : (
				<div
					className={
						isHomeScreen
							? 'overflow-y-scroll flex flex-col h-32'
							: 'overflow-y-scroll flex flex-col m-4 h-96'
					}
				>
					{products && products.length > 0 ? (
						<>
							{products.map((product, index) => (
								<ProductItem key={index} productHash={product.ipfs_pin_hash} />
							))}
							{productCount > displayProductCount ? <div ref={ref} /> : 'No more products to display...'}
							{isLoading ? <Spinner /> : null}
						</>
					) : (
						<p>No products found.</p>
					)}
				</div>
			)}
		</div>
	);
};

export default ProductList;
