import React, { useState } from 'react';

import { FaUserGroup } from 'react-icons/fa6';
import { BasicButton } from '../ui/basic-button';
import { type Product } from '~/types/product-types';
import { BasicModal } from '../ui/basic-modal';

type ProductItemProps = {
	product: Product;
};

const ProductItem = ({ product }: ProductItemProps) => {
	const [displayModal, setDisplayModal] = useState(false);

	const toggleModal = () => {
		setDisplayModal(!displayModal);
	};

	const completedPercentage = () => {
		return product.itemsReceived ? `${Math.round((product.itemsReceived / product.groupMembers) * 100)}%` : 0;
	};

	return (
		<>
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
					{product?.itemsReceived ? <p>{completedPercentage()}</p> : /* Progress bar */ null}
				</div>
				<div className="col-span-2 flex items-center">
					<BasicButton type="secondary" onClick={toggleModal}>
						View details
					</BasicButton>
				</div>
			</div>
			<BasicModal
				isOpen={displayModal}
				onClose={toggleModal}
				header={<h2 className="text-xl font-semibold">Item Details</h2>}
				content={
					<div>
						<div className="flex items-center gap-1">
							<strong>Product name:</strong> <p>{product.title}</p>
						</div>
						<div className="flex items-center gap-1">
							<strong>Group Organiser:</strong> <p>{product.groupOrganiser}</p>
						</div>
						<div className="flex items-center gap-1">
							<strong>Price:</strong> <p>{product.price}</p>
						</div>
						<div className="flex items-center gap-1">
							<strong>Group members:</strong> <p>{product.groupMembers}</p>
						</div>
						<div className="flex items-center gap-1">
							<strong>Items received:</strong> <p>{product.itemsReceived}</p>
						</div>
					</div>
				}
			/>
		</>
	);
};

export default ProductItem;
