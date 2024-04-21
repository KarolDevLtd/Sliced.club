import React from 'react';

import { FaUserGroup } from 'react-icons/fa6';
import { BasicButton } from '../ui/basic-button';

export type Product = {
	title: string;
	groupOrganiser: string;
	category: string;
	groupMembers: number;
	completed: number;
};

type ProductItemProps = {
	product: Product;
};

const ProductItem = ({ product }: ProductItemProps) => {
	const completedPercentage = (decimal: number | undefined) => {
		return `${decimal ? decimal * 100 : 0}%`;
	};

	return (
		<div className="grid grid-cols-10 gap-4 p-2 bg-light-grey min-w-full min-h-[90px] rounded-md">
			<div className="col-span-2 w-12 min-h-full min-w-full bg-medium-grey rounded"></div>
			<div className="col-span-2 flex flex-col justify-center">
				<p className="font-bold">{product?.title}</p>
				<p>{product?.groupOrganiser}</p>
			</div>
			<div className="col-span-2 flex items-center">
				<p>{product?.category}</p>
			</div>
			<div className="col-span-1 flex items-center gap-1">
				<FaUserGroup />
				<p>{product?.groupMembers}</p>
			</div>
			<div className="col-span-1 flex items-center">
				<p>{completedPercentage(product?.completed)}</p>
				{/* Progress bar */}
			</div>
			<div className="col-span-2 flex items-center">
				<BasicButton type="secondary">View details</BasicButton>
			</div>
		</div>
	);
};

export default ProductItem;
