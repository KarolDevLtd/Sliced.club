import React from 'react';
import router from 'next/router';

import { formatCurrency } from '~/helpers/currency-helper';
import { formatDate } from '~/helpers/date-helper';
import { type Payment } from '~/types/payment-types';

type PaymentItemProps = {
	payment: Payment;
};

const PaymentItem = ({ payment }: PaymentItemProps) => {
	const handleClick = () => {
		void router.push(`/payments/${Math.round(payment.amountDue).toString()}`);
	};

	return (
		<div
			className="grid grid-cols-10 gap-4 p-2 m-2 bg-light-grey min-w-full min-h-[90px] rounded-md border border-[transparent] hover:border-black hover:cursor-pointer overflow-hidden flex justify-around"
			onClick={(e) => handleClick(e)}
		>
			<div className="col-span-2 max-w-[120px] min-h-full bg-medium-grey rounded">
				{formatDate(payment.nextPaymentDue)}
			</div>
			<div className="col-span-2 max-w-[120px] min-h-full bg-medium-grey rounded">
				{formatCurrency(payment.amountDue)}
			</div>
			<div className="col-span-2 flex flex-col justify-center">
				<p className="font-bold">{payment.transactionId}</p>
				{/* <p className="text-sm text-dark-grey">{product?.groupOrganiser}</p> */}
			</div>
			<div className="col-span-2 flex items-center">
				<p className="font-bold">{payment.status}</p>
				{/* <InlineLink href={`categories/${product?.category}`}>{product?.category}</InlineLink> */}
			</div>
		</div>
	);
};

export default PaymentItem;
