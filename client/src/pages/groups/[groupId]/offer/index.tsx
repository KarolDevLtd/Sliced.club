/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import router from 'next/router';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

export default function GroupOffer() {
	const handleBackClick = () => {
		router.back();
	};
	return (
		<>
			<div className="flex flex-col justify-between items-start">
				<PageHeader text={'Offer Details'} buttonText="Back" onClick={handleBackClick} />
			</div>
			<div className="grid grid-cols-5 grid-rows-2 gap-4 h-full">
				<div className="bg-accent col-span-3 row-span-1">Total Amount</div>
				<div className="col-span-2 row-span-1 grid grid-rows-5 gap-4">
					<div className="bg-accent row-span-3">Issued Cars</div>
					<div className="bg-accent row-span-2">Money</div>
				</div>
				<div className="bg-accent col-span-3 row-span-1">Last Payment</div>
				<div className="bg-accent col-span-2 row-span-1">Last Bid</div>
			</div>
		</>
	);
}

GroupOffer.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
