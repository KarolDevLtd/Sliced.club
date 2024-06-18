import { formatDate } from '~/helpers/date-helper';
import { Bid, LastPayment } from '~/types/payment-types';

type BidItemProps = {
	bid: Bid;
};

const BidItem = ({ bid }: BidItemProps) => {
	return (
		<div
			className="bg-itemfade grid grid-cols-2 gap-4 border-solid border border-neutral min-w-full min-h-[90px] rounded-md hover:border-black hover:cursor-pointer overflow-hidden flex justify-around"
			// onClick={(e) => handleClick(e)}
		>
			<div className="col-span-1 max-w-[120px] min-h-full rounded flex items-center justify-center">
				{formatDate(bid.date)}
			</div>
			<div className="col-span-1 max-w-[120px] min-h-full rounded flex items-center justify-center">
				{bid.amount}
			</div>
		</div>
	);
};
export default BidItem;
