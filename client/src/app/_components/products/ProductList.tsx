import React from 'react';
import ProductItem from './ProductItem';
import { type Product } from '~/types/product-types';

type ProductListProps = {
	heading?: string;
	products: Product[];
};

const ProductList = ({ heading, products }: ProductListProps) => {
	return (
		<div className="flex flex-col gap-2 mb-4">
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
			{products ? (
				products.map((product: Product, index) => {
					return <ProductItem key={index} product={product} />;
				})
			) : (
				<p>No products found.</p>
			)}
		</div>
	);
};
export default ProductList;
