import router from 'next/router';

type GroupNavigationProps = {
	groupHash: string;
};

const GroupNavigation = ({ groupHash }: GroupNavigationProps) => {
	const handleCardClick = (e: Event | undefined, type: string) => {
		//At this point we have all group information from firebase and IPFS
		//Pass to reduce need to query?
		void router.push({
			pathname: `/groups/${groupHash}/${type}`,
		});
		e?.stopPropagation();
	};
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
