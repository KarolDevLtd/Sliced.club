import { LastPayment } from '~/types/payment-types';
import LastPaymentItem from './LastPaymentItem';

type LastPaymentListProps = {
	heading?: string;
	payments: LastPayment[];
};
const LastPaymentList = ({ heading, payments }: LastPaymentListProps) => {
	return (
		<div className="flex flex-col gap-2 mb-4 overflow-y-scroll w-full">
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
			{payments ? (
				payments.map((payment: LastPayment, index) => {
					return <LastPaymentItem key={index} payment={payment} />;
				})
			) : (
				<p>No payments scheduled.</p>
			)}
		</div>
	);
};

export default LastPaymentList;
