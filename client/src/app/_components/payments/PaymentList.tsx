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
		<div className="flex flex-col gap-2 py-4 w-full">
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
			{payments && payments.length > 0 ? (
				<div
					className={
						isHomeScreen
							? 'overflow-y-scroll flex flex-col h-32'
							: 'overflow-y-scroll flex flex-col m-4 h-fit'
					}
				>
					<div className="flex min-w-full justify-around p-2 grid grid-cols-10  gap-4 text">
						<div className="col-span-1  min-h-full rounded flex items-center justify-center text-neutral">
							No.
						</div>
						<div className="col-span-2  min-h-full rounded flex items-center justify-center text-neutral">
							Global Slot
						</div>
						<div className="col-span-2  min-h-full rounded flex items-center justify-center text-neutral">
							Amount
						</div>
						<div className="col-span-2  min-h-full rounded flex items-center justify-center text-neutral">
							Transaction Id
						</div>
						<div className="col-span-2  min-h-full rounded flex items-center justify-center text-neutral">
							Payment Status
						</div>
						<div className="col-span-1  min-h-full rounded flex items-center justify-center text-neutral">
							Details
						</div>
					</div>
					{payments.map((payment: Payment, index) => {
						return <PaymentItem key={index} payment={payment} />;
					})}
				</div>
			) : (
				<p>No payments made.</p>
			)}
		</div>
	);
};
export default PaymentList;
