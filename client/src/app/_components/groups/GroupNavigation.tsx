import router from 'next/router';
import { IPFSGroupModel } from '~/models/ipfs/ipfs-group-model';
import { IPFSProductModel } from '~/models/ipfs/ipfs-product-model';

type GroupNavigationProps = {
	groupHash: string;
	group: IPFSGroupModel;
	product: IPFSProductModel;
};

const GroupNavigation = ({ groupHash, group, product }: GroupNavigationProps) => {
	const handleCardClick = (e: Event | undefined, type: string) => {
		//At this point we have all group information from firebase and IPFS
		//Pass to reduce need to query?
		let query;

		switch (type) {
			case 'product':
				// console.log(group.productHash);
				query = { hash: group.productHash };
				break;
			case 'organiser':
				// console.log(group.productHash);
				query = { creatorHash: group.creatorKey };
				break;
		}

		void router.push({
			pathname: `/groups/${groupHash}/${type}`,
			query: query,
		});
		e?.stopPropagation();
	};

	// console.log(group);
	// console.log(product);
	return (
		<div className="col-span-4 grid gap-4 grid-cols-4">
			<div className="card h-44 bg-accent" onClick={(e) => handleCardClick(e, 'payment')}>
				<figure></figure>
				<div className="card-body justify-end">
					<h2 className="card-title">Payment</h2>
				</div>
			</div>
			<div className="card h-44 bg-accent" onClick={(e) => handleCardClick(e, 'offer')}>
				<figure></figure>
				<div className="card-body justify-end">
					<h2 className="card-title">Offer Details</h2>
				</div>
			</div>
			<div className="card h-44 bg-accent" onClick={(e) => handleCardClick(e, 'product')}>
				<figure></figure>
				<div className="card-body justify-end">
					<h2 className="card-title">Product Details</h2>
				</div>
			</div>
			<div className="card h-44 bg-accent" onClick={(e) => handleCardClick(e, 'organiser')}>
				<figure></figure>
				<div className="card-body justify-end">
					<h2 className="card-title">About GO</h2>
				</div>
			</div>
		</div>
	);
};

export default GroupNavigation;
