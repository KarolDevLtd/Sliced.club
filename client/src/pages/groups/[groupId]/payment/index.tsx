/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import router from 'next/router';
import PaymentList from '~/app/_components/payments/PaymentList';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';
import { productPayments } from '~/static-data';

export default function GroupPayment() {
	const handleBackClick = () => {
		router.back();
	};
	return (
		<>
			<div className="flex flex-col justify-between items-start">
				<PageHeader
					text={'Payment'}
					// text={groupData?.group?.name ?? 'Group Name'}
					// subtext={groupData?.group?.groupOrganiser ?? 'Group Organiser'}
					buttonText="Back"
					onClick={handleBackClick}
				/>
			</div>
			<div className="grid grid-rows-5 grid-flow-col gap-4 h-full">
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
				<div className="col-span-3 row-span-2 flex">
					<PaymentList payments={productPayments} />
				</div>
			</div>
		</>
	);
}

GroupPayment.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
