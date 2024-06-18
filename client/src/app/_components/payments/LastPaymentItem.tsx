import { formatDate } from '~/helpers/date-helper';
import { LastPayment } from '~/types/payment-types';

type LastPaymentItemProps = {
	payment: LastPayment;
};

const LastPaymentItem = ({ payment }: LastPaymentItemProps) => {
	return (
		<div
			className="grid grid-cols-7 gap-4 bg-itemfade border-solid border border-neutral min-w-full min-h-[90px] rounded-md hover:border-black hover:cursor-pointer overflow-hidden flex justify-around"
			// onClick={(e) => handleClick(e)}
		>
			<div className="col-span-3 max-w-[120px] min-h-full rounded flex items-center justify-center">
				{payment.userId}
			</div>
			<div className="col-span-1 max-w-[120px] min-h-full rounded flex items-center justify-center">
				{formatDate(payment.paymentDue)}
			</div>
			<div className="col-span-1 max-w-[120px] min-h-full rounded flex items-center justify-center">
				{payment.type}
			</div>
			<div className="col-span-2 flex flex-col justify-center">
				<p className="font-bold">{payment.status}</p>
				{/* <p className="text-sm text-dark-grey">{product?.groupOrganiser}</p> */}
			</div>
		</div>
	);
};
export default LastPaymentItem;
