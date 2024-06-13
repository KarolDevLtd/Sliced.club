import React from 'react';
import router from 'next/router';
import { formatCurrency } from '~/helpers/currency-helper';
import { formatDate } from '~/helpers/date-helper';
import { type Payment } from '~/types/payment-types';
import PaymentStatus from '../ui/PaymentStatus';
import { CiMenuKebab } from 'react-icons/ci';

type PaymentItemProps = {
	payment: Payment;
};

const PaymentItem = ({ payment }: PaymentItemProps) => {
	const handleClick = () => {
		void router.push(`/payments/${Math.round(payment.amountDue).toString()}`);
	};

	return (
		<div
			className="grid grid-cols-10 gap-4 bg-itemfade min-w-full min-h-[90px] rounded-md border border-accent hover:border-black hover:cursor-pointer overflow-hidden flex justify-around"
			onClick={(e) => handleClick(e)}
		>
			<div className="col-span-1 max-w-[120px] min-h-full rounded flex items-center justify-center">5</div>
			<div className="col-span-2 max-w-[120px] min-h-full rounded flex items-center justify-center">
				{formatDate(payment.nextPaymentDue)}
			</div>
			<div className="col-span-2 max-w-[120px] min-h-full rounded flex items-center justify-center">
				{formatCurrency(payment.amountDue)}
			</div>
			<div className="col-span-2 flex flex-col justify-center">
				<p className="font-bold">{payment.transactionId}</p>
				{/* <p className="text-sm text-dark-grey">{product?.groupOrganiser}</p> */}
			</div>
			<div className="col-span-2 flex items-center flex items-center justify-center">
				<PaymentStatus status={payment.status} />
				{/* <InlineLink href={`categories/${product?.category}`}>{product?.category}</InlineLink> */}
			</div>
			<div className="flex justify-center items-center h-full text-3xl">
				<CiMenuKebab />
			</div>
		</div>
	);
};

export default PaymentItem;
