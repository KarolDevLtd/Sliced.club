import React from 'react';
import router from 'next/router';
import { formatCurrency } from '~/helpers/currency-helper';
import { formatDate } from '~/helpers/date-helper';
import { type Payment } from '~/types/payment-types';
import PaymentStatus from '../ui/PaymentStatus';
import { CiMenuKebab } from 'react-icons/ci';
import { sliceWalletAddress } from '@/helpers/user-helper';

type PaymentItemProps = {
	payment: Payment;
};

const PaymentItem = ({ payment }: PaymentItemProps) => {
	const handleClick = () => {
		void router.push(`/payments/${Math.round(payment.amountDue).toString()}`);
	};

	return (
		<div
			className="grid grid-cols-10 gap-4 p-2 my-2 bg-itemfade min-w-full min-h-[90px] rounded-md border border-accent hover:border-neutral hover:cursor-pointer overflow-hidden flex justify-around"
			onClick={(e) => handleClick(e)}
		>
			<div className="col-span-1 min-h-full rounded flex items-center justify-center">5</div>
			<div className="col-span-2 min-h-full rounded flex items-center justify-center">
				{payment.nextPaymentDue}
			</div>
			<div className="col-span-2 min-h-full rounded flex items-center justify-center">
				{formatCurrency(payment.amountDue)}
			</div>
			<div className="col-span-2 flex flex-col justify-center items-center">
				<p className="font-bold">{sliceWalletAddress(payment.transactionId)}</p>
			</div>
			<div className="col-span-2 flex items-center flex items-center justify-center">
				<PaymentStatus status={payment.status} />
			</div>
			<div className="flex justify-center items-center h-full text-3xl">
				<CiMenuKebab />
			</div>
		</div>
	);
};

export default PaymentItem;
