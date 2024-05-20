/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import { api } from '~/trpc/react';
import { useWallet } from '~/providers/WalletProvider';
import { type IPFSSearchModel } from '~/models/ipfs/ipfs-search-model';
import Pagination from '../ui/Pagination';
import { defaultPageLimit } from '~/helpers/search-helper';

type ProductListProps = {
	heading?: string;
	// products: Product[];
};

const ProductList = ({ heading }: ProductListProps) => {
	const { isConnected, walletAddress } = useWallet();
	const [products, setProducts] = useState<IPFSSearchModel[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [productCount, setProductCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(0);
	const itemsPerPage = defaultPageLimit || 10;

	const {
		data: productData,
		error,
		refetch,
	} = api.PinataProduct.getProducts.useQuery({ creatorKey: walletAddress?.toString(), pageNumber: currentPage });

	useEffect(() => {
		setIsLoading(true);

		if (productData) {
			setProducts(productData.products == null ? [] : productData.products.rows);
			setProductCount(productData.products.count);
			setIsLoading(false);
		}
	}, [productData]);

	useEffect(() => {
		if (error) {
			console.error('Error fetching products:', error);
			setIsLoading(false);
		}
	}, [error]);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	return (
		<div className="flex flex-col gap-2 mb-4">
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
			{products && products.length > 0 ? (
				products.map((product, index) => <ProductItem key={index} productHash={product.ipfs_pin_hash} />)
			) : (
				<p>No products found.</p>
			)}
			<Pagination
				currentPage={currentPage}
				totalItems={productCount}
				itemsPerPage={itemsPerPage}
				onPageChange={handlePageChange}
			/>
		</div>
	);
};

export default ProductList;
