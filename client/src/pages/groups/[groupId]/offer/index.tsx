/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import router from 'next/router';
import { MdBarChart } from 'react-icons/md';
import BasicBarChart from '~/app/_components/ui/BasicBarChart';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';
import { OfferDetailBarChartData, bids, lastPayments } from '~/static-data';
import { BsSliders } from 'react-icons/bs';
import { FaCar } from 'react-icons/fa6';
import { AiFillDollarCircle } from 'react-icons/ai';
import LastPaymentList from '~/app/_components/payments/LastPaymentList';
import BidList from '~/app/_components/bids/BidList';

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
				<div className="border-solid border border-neutral rounded-xl col-span-3 row-span-1">
					<div className="flex p-3 justify-between">
						<div className="flex">
							<div className="p-3 border border-accent rounded-xl bg-bellow">
								<MdBarChart className="text-2xl text-primary" />
							</div>
							<div className="flex flex-col justify-center">
								<div className="flex px-4 text-xl justify-center">Total amount</div>
							</div>
						</div>
						<div className="flex border-solid border border-neutral rounded-xl text-primary text-xl items-center px-4 bg-itemfade cursor-pointer">
							<BsSliders />
						</div>
					</div>
					<div>
						<BasicBarChart chartData={OfferDetailBarChartData} />
					</div>
				</div>
				<div className="col-span-2 row-span-1 grid grid-rows-5 gap-4">
					<div className="border-solid border border-neutral rounded-xl row-span-3">
						<div className="row-span-5 m-2 p-6">
							<div className="flex ">
								<div className="p-4 border border-accent rounded-xl bg-bigred">
									<FaCar className="text-primary" />
								</div>
								<div className="flex items-center px-4 text-xl">Issued Cars</div>
							</div>
							<div className="my-5">
								<div className="flex justify-between">
									<div className="text-sm">Won in lottery</div>
									<strong className="text-sm">22</strong>
								</div>
								<div className="flex justify-between">
									<div className="text-sm">Won in auction</div>
									<strong className="text-sm">16</strong>
								</div>
							</div>
						</div>
					</div>
					<div className="border-solid border border-neutral rounded-xl row-span-2">
						<div className="row-span-5 m-2 p-6">
							<div className="flex ">
								<div className="p-4 border border-accent rounded-xl bg-electricblue text-xl">
									<AiFillDollarCircle />
								</div>
								<div className="flex items-center px-4 text-xl">Money</div>
							</div>
							<div className="my-5">
								<div className="flex justify-between">
									<div className="text-sm">Money in the pot this month</div>
									<strong className="text-sm">$42000</strong>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="col-span-3 row-span-1">
					<LastPaymentList heading={'Last payments'} payments={lastPayments} />
				</div>
				<div className="col-span-2 row-span-1">
					<BidList heading={'Last bid'} bids={bids} />
				</div>
			</div>
		</>
	);
}

GroupOffer.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
