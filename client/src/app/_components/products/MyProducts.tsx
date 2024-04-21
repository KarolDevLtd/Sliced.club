import React from 'react';

import { FaUserGroup } from 'react-icons/fa6';
import { BasicButton } from '../ui/basic-button';

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
	];

	const completedPercentage = (decimal: number | undefined) => {
		return `${decimal ? decimal * 100 : 0}%`;
	};

	return (
		<div className="flex flex-col gap-2 min-h-full">
			<h2 className="text-2xl">My Products</h2>
			<div className="grid grid-cols-10 gap-4 p-2 bg-light-grey min-w-full min-h-[90px] rounded-md">
				<div className="col-span-2 w-12 min-h-full min-w-full bg-medium-grey rounded"></div>
				<div className="col-span-2 flex flex-col justify-center">
					<p className="font-bold">{products[0]?.title}</p>
					<p>{products[0]?.groupOrganiser}</p>
				</div>
				<div className="col-span-2 flex items-center">
					<p>{products[0]?.category}</p>
				</div>
				<div className="col-span-1 flex items-center gap-1">
					<FaUserGroup />
					<p>{products[0]?.groupMembers}</p>
				</div>
				<div className="col-span-1 flex items-center">
					<p>{completedPercentage(products[0]?.completed)}</p>
					{/* Progress bar */}
				</div>
				<div className="col-span-2 flex items-center">
					<BasicButton type="secondary">View details</BasicButton>
				</div>
			</div>

			<div className="grid grid-cols-10 gap-4 p-2 bg-light-grey min-w-full min-h-[90px] rounded-md">
				<div className="col-span-2 w-12 min-h-full min-w-full bg-medium-grey rounded"></div>
				<div className="col-span-2 flex flex-col justify-center">
					<p className="font-bold">{products[1]?.title}</p>
					<p>{products[1]?.groupOrganiser}</p>
				</div>
				<div className="col-span-2 flex items-center">
					<p>{products[1]?.category}</p>
				</div>
				<div className="col-span-1 flex items-center gap-1">
					<FaUserGroup />
					<p>{products[1]?.groupMembers}</p>
				</div>
				<div className="col-span-1 flex items-center">
					<p>{completedPercentage(products[1]?.completed)}</p>
					{/* Progress bar */}
				</div>
				<div className="col-span-2 flex items-center">
					<BasicButton type="secondary">View details</BasicButton>
				</div>
			</div>
		</div>
	);
};
export default MyProducts;
