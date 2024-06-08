/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useRouter } from 'next/router';
import GroupNavigation from '~/app/_components/groups/GroupNavigation';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

/* eslint-disable @typescript-eslint/no-unsafe-call */
export default function GroupProductDetails() {
	const router = useRouter();
	const { pathname, query, asPath } = router;
	const handleBackClick = () => {
		router.back();
	};

	// console.log('Router Pathname:', pathname);
	// console.log('Router Query:', query);
	// console.log('Router AsPath:', asPath);

	return (
		<>
			<div className="flex flex-col justify-between items-start">
				<PageHeader
					text={'Product Details'}
					// text={groupData?.group?.name ?? 'Group Name'}
					// subtext={groupData?.group?.groupOrganiser ?? 'Group Organiser'}
					buttonText="Back"
					onClick={handleBackClick}
				/>
			</div>
			{/* <div className="grid grid-rows-5 grid-flow-col gap-4 h-full">
				<div className="col-span-3 row-span-3 grid grid-cols-3 gap-4">
					<div className="col-span-1 grid grid-rows-3 gap-4">
						<div className="row-span-2 bg-accent">Payment Details</div>
						<div className="row-span-1 bg-accent">Next Payment</div>
					</div>
					<div className="col-span-1 grid grid-rows-3 gap-4">
						<div className="row-span-1 bg-accent">Your Chance</div>
						<div className="row-span-2 bg-accent">Total Amount</div>
					</div>
					<div className="col-span-1 bg-accent ">Auction</div>
				</div>
				<div className="bg-accent col-span-3 row-span-2">Last Payment</div>
			</div> */}
			<div className="grid grid-cols-2 gap-4 w-full h-full">
				<div className="grid grid-rows-2 gap-4 h-full">
					<div className="bg-accent">1</div>
					<div className="bg-accent">1</div>
				</div>
				<div className="bg-accent">2</div>
			</div>
			{/* <GroupNavigation/> */}
		</>
	);
}

GroupProductDetails.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
