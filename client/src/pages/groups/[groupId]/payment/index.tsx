/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import router from 'next/router';
import { FaCreditCard } from 'react-icons/fa';
import PaymentList from '~/app/_components/payments/PaymentList';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';
import { productPayments } from '~/static-data';
import { TbCalendarDollar } from 'react-icons/tb';
import { useState } from 'react';
import { MdBarChart } from 'react-icons/md';
import BasicBarChart from '~/app/_components/ui/BasicBarChart';
import BasicButton from '~/app/_components/ui/BasicButton';

export default function GroupPayment() {
	const [number, setNumber] = useState(0);
	const handleBackClick = () => {
		router.back();
	};

	const handleNumberChange = (input: number) => {
		if (input > 0 || (input < 0 && number > 0)) setNumber(number + input);
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
			<div className="grid grid-rows-8 grid-flow-col gap-4 h-full">
				<div className="col-span-3 row-span-5 grid grid-cols-3 gap-2">
					<div className="col-span-1 grid grid-rows-9 gap-4">
						{/* //Payment Details */}
						<div className="row-span-5 m-2 p-6 border border-accent rounded-xl">
							<div className="flex ">
								<div className="p-4 border border-accent rounded-xl bg-electricblue">
									<FaCreditCard className="text-primary" />
								</div>
								<div className="flex items-center px-4 text-xl">Payment Details</div>
							</div>
							<div className="my-5">
								<div className="flex justify-between">
									<div className="text-sm">Installment amount</div>
									<strong className="text-sm">$230</strong>
								</div>
								<div className="flex justify-between">
									<div className="text-sm">Installments left</div>
									<strong className="text-sm">26</strong>
								</div>
								<div className="flex justify-between">
									<div className="text-sm">Payments made</div>
									<strong className="text-sm">$2300</strong>
								</div>
								<div className="flex justify-between">
									<div className="text-sm">Outstanding payments</div>
									<strong className="text-sm">None</strong>
								</div>
							</div>
						</div>
						{/* Next payment */}
						<div className="row-span-4 m-1 p-6 border border-accent rounded-xl">
							<div className="flex">
								<div className="p-4 border border-accent rounded-xl bg-bigred">
									<TbCalendarDollar className="text-primary" />
								</div>
								<div className="flex flex-col">
									<div className="items-center px-4 text-xl">Next payment</div>
									<div className="items-center px-4 text-xs">12.04.2024</div>
								</div>
							</div>
							<div className="h-full flex items-center justify-center justify-between">
								<div className="flex">
									<div className="flex px-2 cursor-pointer" onClick={() => handleNumberChange(-1)}>
										-
									</div>
									<div className="flex px-2">{number}</div>
									<div className="flex px-2 cursor-pointer" onClick={() => handleNumberChange(1)}>
										+
									</div>
								</div>
								<div className="text-3xl">$240</div>
							</div>
						</div>
					</div>
					<div className="col-span-1 grid grid-rows-4 gap-4 p-1">
						{/* Your chance */}
						<div className="row-span-1 border border-accent rounded-xl">
							<div className="p-5 flex justify-center items-center align-center h-full">
								<div className="text-sm">
									<div className="text-xl">Your chance</div>
									<div className="text-sm">Chances of winning next month</div>
								</div>
								<div className="flex items-end">
									<div className="text-3xl flex items-center justify-center px-1">22</div>%
								</div>
							</div>
						</div>
						{/* Total amount */}
						<div className="row-span-3 border p-1 border-accent rounded-xl p-3 h-full">
							<div className="flex">
								<div className="p-3 border border-accent rounded-xl bg-bellow">
									<MdBarChart className="text-2xl text-primary" />
								</div>
								<div className="flex flex-col">
									<div className="flex px-4 text-xl justify-center">Total amount</div>
								</div>
							</div>
							<div className="flex mx-1 my-2 h-4/5">
								<BasicBarChart />
							</div>
						</div>
					</div>
					<div className="col-span-1 border border-accent rounded-xl bg-auctionsfade flex flex-col grid grid-rows-3 m-1">
						{/* <div className=""> */}
						<div className="flex flex-col align-center row-span-2 justify-end mb-8">
							<div className="flex justify-center text-3xl my-2">Auction</div>
							<div className="flex justify-center ">Time left</div>
							<strong className="flex justify-center ">2d 13h 43min</strong>
						</div>

						<div className="flex flex-col">
							<div className="flex justify-center my-1">
								<BasicButton type={'accent'}>Your Bid</BasicButton>
							</div>
							<div className="flex justify-center my-1">
								<BasicButton type={'primary'}>Bid</BasicButton>
							</div>
							{/* </div> */}
						</div>
					</div>
				</div>
				<div className="col-span-3 row-span-3 flex">
					<PaymentList heading={'Latest Payments'} payments={productPayments} />
				</div>
			</div>
		</>
	);
}

GroupPayment.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
