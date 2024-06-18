import React from 'react';
import PaymentItem from './PaymentItem';
import { type Payment } from '~/types/payment-types';

type PaymentListProps = {
	heading?: string;
	payments: Payment[];
};

const PaymentList = ({ heading, payments }: PaymentListProps) => {
	return (
		<div className="flex flex-col gap-2 mb-4 overflow-y-scroll w-full">
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
			{payments ? (
				payments.map((payment: Payment, index) => {
					return <PaymentItem key={index} payment={payment} />;
				})
			) : (
				<p>No payments scheduled.</p>
			)}
		</div>
	);
};
export default PaymentList;
