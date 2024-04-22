import React from 'react';
import { formatCurrency } from '~/helpers/currency-helper';
import { type Payment } from '~/types/payment-types';

type PaymentItemProps = {
	payment: Payment;
};

const PaymentItem = ({ payment }: PaymentItemProps) => {
	return (
		<div className="flex gap-4 items-center p-2 bg-light-grey min-w-full min-h-[90px] rounded-md">
			<div className="h-12 w-12 bg-purple-light rounded-md"></div>
			<div>
				<p>
					<span>{formatCurrency(payment.amountDue)}</span>{' '}
					<span>{payment.nextPaymentDue.toDateString()}</span>
				</p>
				<p>
					<span>{payment.product.groupOrganiser}</span> - <span>{payment.product.title}</span>
				</p>
			</div>
		</div>
	);
};

export default PaymentItem;
