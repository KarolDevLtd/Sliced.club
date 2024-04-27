/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useState } from 'react';
import router from 'next/router';

import { FaUserGroup } from 'react-icons/fa6';
import { BasicButton } from '../ui/BasicButton';
import { type Product } from '~/types/product-types';
import { BasicModal } from '../ui/BasicModal';
import { formatCurrency } from '~/helpers/currency-helper';
import { InlineLink } from '../ui/InlineLink';
import ProgressBar from '../ui/ProgressBar';

type ProductItemProps = {
	product: Product;
};

const ProductItem = ({ product }: ProductItemProps) => {
	const [displayModal, setDisplayModal] = useState(false);

	const toggleModal = () => {
		setDisplayModal(!displayModal);
	};

	const completedRatio = product?.itemsReceived ? (product.itemsReceived / product.groupMembers) * 100 : 0;

	const completedPercentage = () => {
		return product.itemsReceived ? `${Math.round(completedRatio)}%` : 0;
	};

	const handleClick = (e: Event | undefined) => {
		void router.push(`/groups/${product.title}`);
		e?.stopPropagation();
	};

	return (
		<>
			<div
				className="grid grid-cols-10 gap-4 p-4 bg-light-grey min-w-full min-h-[90px] rounded-md border border-[transparent] hover:border-black hover:cursor-pointer"
				// @ts-ignore
				onClick={(e) => handleClick(e)}
			>
				<div className="col-span-2 max-w-[120px] min-h-full bg-medium-grey rounded"></div>
				<div className="col-span-2 flex flex-col justify-center">
					<p className="font-bold">{product?.title}</p>
					<p className="text-sm text-dark-grey">{product?.groupOrganiser}</p>
				</div>
				<div className="col-span-2 flex items-center">
					<InlineLink href={`categories/${product.category}`}>{product?.category}</InlineLink>
				</div>
				<div className="col-span-1 flex items-center gap-1">
					<FaUserGroup />
					<p>{product?.groupMembers}</p>
				</div>
				<div className="col-span-1 flex items-center">
					{product?.itemsReceived ? (
						<div>
							<p>{completedPercentage()}</p>
							<ProgressBar progress={completedRatio} />
						</div>
					) : null}
				</div>
				<div className="col-span-2 flex items-center">
					<BasicButton type="secondary" onClick={(e) => handleClick(e)}>
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
							<strong>Price:</strong> <p>{formatCurrency(product.price)}</p>
						</div>
						<div className="flex items-center gap-1">
							<strong>Group members:</strong> <p>{product.groupMembers}</p>
						</div>
						{product.itemsReceived ? (
							<div className="flex items-center gap-1">
								<strong>Items received:</strong> <p>{product.itemsReceived}</p>
							</div>
						) : null}
					</div>
				}
			/>
		</>
	);
};

export default ProductItem;
