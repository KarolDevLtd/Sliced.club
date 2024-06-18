import React from 'react';
import router from 'next/router';

import { formatCurrency } from '~/helpers/currency-helper';
import { formatDate } from '~/helpers/date-helper';
import { type Payment } from '~/types/payment-types';

type PaymentItemProps = {
	payment: Payment;
};

const MyPaymentItem = ({ payment }: PaymentItemProps) => {
	const handleClick = () => {
		void router.push(`/payments/${Math.round(payment.amountDue).toString()}`);
	};

	return (
		<div
			className="flex gap-4 items-center p-4 bg-light-grey min-w-full min-h-[90px] rounded-md border border-[transparent] hover:border-black hover:cursor-pointer"
			onClick={handleClick}
		>
			<div className="h-12 w-12 bg-medium-grey rounded-md"></div>
			<div>
				<p>
					<span className="font-bold">{formatCurrency(payment.amountDue)}</span>{' '}
					<span className="text-sm text-dark-grey">Due {formatDate(payment.nextPaymentDue)}</span>
				</p>
				<p>
					<span className="font-bold">{payment.product.title}</span>{' '}
					<span className="text-sm text-dark-grey">{payment.product.groupOrganiser}</span>
				</p>
			</div>
		</div>
	);
};

export default MyPaymentItem;
