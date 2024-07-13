import React from 'react';
import PaymentItem from './PaymentItem';
import { type Payment } from '~/types/payment-types';

type PaymentListProps = {
	heading?: string;
	payments: Payment[];
	isHomeScreen: boolean;
};

const PaymentList = ({ heading, payments, isHomeScreen }: PaymentListProps) => {
	return (
		<div className="flex flex-col gap-2 py-4">
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
			{payments && payments.length > 0 ? (
				<div
					className={
						isHomeScreen
							? 'overflow-y-scroll flex flex-col h-32'
							: 'overflow-y-scroll flex flex-col m-4 h-fit'
					}
				>
					{payments.map((payment: Payment, index) => {
						return <PaymentItem key={index} payment={payment} />;
					})}
				</div>
			) : (
				<p>No payments scheduled.</p>
			)}
		</div>
	);
};
export default PaymentList;
