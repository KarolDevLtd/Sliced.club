import React from 'react';
import ProductItem, { type Product } from './ProductItem';

type MyProductProps = object;

const MyProducts = ({}: MyProductProps) => {
	const products = [
		{
			title: 'Xbox Series X|S',
			groupOrganiser: 'Microsoft',
			category: 'Gaming Consoles',
			groupMembers: 26,
			completed: 0.65,
		},
		{
			title: 'HERO 12 Black',
			groupOrganiser: 'GoPro',
			category: 'Cameras',
			groupMembers: 41,
			completed: 0.87,
		},
	] as Product[];

	return (
		<div className="flex flex-col gap-2 min-h-full">
			<h2 className="text-2xl">My Products</h2>
			<ProductItem product={products[0]!} />
			<ProductItem product={products[1]!} />
		</div>
	);
};
export default MyProducts;
