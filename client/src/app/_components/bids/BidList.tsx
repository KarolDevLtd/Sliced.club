import { Bid } from '~/types/payment-types';
import BidItem from './BidItem';

type BidListProps = {
	heading?: string;
	bids: Bid[];
};

const BidList = ({ heading, bids }: BidListProps) => {
	return (
		<div className="flex flex-col gap-2 mb-4 overflow-y-scroll w-full">
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
			{bids ? (
				bids.map((bid: Bid, index) => {
					return <BidItem key={index} bid={bid} />;
				})
			) : (
				<p>No bids scheduled.</p>
			)}
		</div>
	);
};

export default BidList;
