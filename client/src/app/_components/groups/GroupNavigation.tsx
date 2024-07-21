import router from 'next/router';
import { type IPFSGroupModel } from '~/models/ipfs/ipfs-group-model';
import { type IPFSProductModel } from '~/models/ipfs/ipfs-product-model';

type GroupNavigationProps = {
	groupHash: string;
	group: IPFSGroupModel;
	product: IPFSProductModel;
};

const GroupNavigation = ({ groupHash, group }: GroupNavigationProps) => {
	const handleCardClick = (e: React.MouseEvent<HTMLDivElement> | undefined, type: string) => {
		// At this point we have all group information from firebase and IPFS
		// Pass to reduce need to query?
		let query;

		switch (type) {
			case 'product':
				query = { hash: group.productHash };
				break;
			case 'organiser':
				query = { creatorHash: group.creatorKey };
				break;
		}

		void router.push({
			pathname: `/groups/${groupHash}/${type}`,
			query: query,
		});

		e?.stopPropagation();
	};

	return (
		<div className="col-span-4 grid gap-4 grid-cols-4 h-auto">
			<div
				className="card h-44 bg-accent cursor-pointer bg-paymentbtnfade"
				onClick={(e) => handleCardClick(e, 'payment')}
			>
				<figure></figure>
				<div className="card-body justify-end">
					<h2 className="card-title">Payment</h2>
				</div>
			</div>
			<div
				className="card h-44 bg-accent cursor-pointer bg-offerbtnfade"
				onClick={(e) => handleCardClick(e, 'offer')}
			>
				<figure></figure>
				<div className="card-body justify-end">
					<h2 className="card-title">Offer Details</h2>
				</div>
			</div>
			<div
				className="card h-44 bg-accent cursor-pointer bg-productbtnfade"
				onClick={(e) => handleCardClick(e, 'product')}
			>
				<figure></figure>
				<div className="card-body justify-end">
					<h2 className="card-title">Product Details</h2>
				</div>
			</div>
			<div
				className="card h-44 bg-accent cursor-pointer bg-aboutgobtnfade"
				onClick={(e) => handleCardClick(e, 'organiser')}
			>
				<figure></figure>
				<div className="card-body justify-end">
					<h2 className="card-title">About GO</h2>
				</div>
			</div>
		</div>
	);
};

export default GroupNavigation;
