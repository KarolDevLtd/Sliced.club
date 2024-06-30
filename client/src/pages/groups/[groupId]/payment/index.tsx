/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useRouter } from 'next/router';
import { FaCreditCard } from 'react-icons/fa';
import PaymentList from '~/app/_components/payments/PaymentList';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';
import { PaymentBarChartData, productPayments } from '~/static-data';
import { TbCalendarDollar } from 'react-icons/tb';
import { useCallback, useEffect, useState } from 'react';
import { MdBarChart } from 'react-icons/md';
import BasicBarChart from '~/app/_components/ui/BasicBarChart';
import BasicButton from '~/app/_components/ui/BasicButton';
import { useMinaProvider } from '@/providers/minaprovider';
import { api } from '@/trpc/react';
import { useWallet } from '@/providers/WalletProvider';
import { type IPFSGroupModel } from '@/models/ipfs/ipfs-group-model';
import { toast } from 'react-toastify';
import { console_log } from 'o1js/dist/node/bindings/compiled/node_bindings/plonk_wasm.cjs';

export default function GroupPayment() {
	// const groupId = router.query.groupId;
	const router = useRouter();
	const { query } = router;
	// console.log(router.query);
	const { walletAddress } = useWallet();
	const { data: groupData } = api.PinataGroup.getGroup.useQuery({ hash: query.groupId });
	const [number, setNumber] = useState(0);
	const { userPayment } = useMinaProvider();
	const [group, setGroup] = useState<IPFSGroupModel>();
	const [loading, setIsLoading] = useState<boolean>(false);

	// console.log(query);

	const handleBackClick = () => {
		router.back();
	};

	const handleNumberChange = (input: number) => {
		if (input > 0 || (input < 0 && number > 0)) setNumber(number + input);
	};

	const makePayment = async () => {
		console.log('cock');
		try {
			if (group && walletAddress) {
				// console.log('add user ipfs values :\n', groupData.group);
				console.log(walletAddress.toString());
				console.log(parseInt(group.participants));
				console.log(parseInt(group.price));
				console.log(parseInt(group.duration));
				console.log(group.chainPubKey);
				await userPayment(
					group.chainPubKey,
					// currentSelectedParticpant.metadata.keyvalues.userKey,
					walletAddress.toString(),
					parseInt(group.participants),
					parseInt(group.price),
					parseInt(group.duration),
					// parseInt(groupData.group.missable) // TODO that's wrong
					3, // missable
					2592000, // payment duration
					0
				);
				// await groupParticipantToIPFS.mutateAsync({
				// 	groupHash: groupId.toString(),
				// 	creatorKey: group.creatorKey,
				// 	userKey: walletAddress.toString(),
				// 	status: 'approved',
				// });
				// setIsParticipant(true);
			}
		} catch (err) {
			console.log(err);
		}
	};

	const fetchInfo = useCallback(async () => {
		setIsLoading(true);
		try {
			if (groupData) {
				const currGroup = groupData.group as IPFSGroupModel;
				setGroup(currGroup);
				console.log('group data');
				// const z = api.PinataGroup.getGroupParticipants.useQuery({ groupHash: groupId });
				// console.log(z);
			}
		} catch (err) {
			console.log(err);
			toast.error('Error fetching group item info');
		} finally {
			setIsLoading(false);
		}
	}, [groupData]);

	useEffect(() => {
		void fetchInfo();
	}, [fetchInfo, group]);

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
									<div className="items-center px-4 text-xl">Over payment</div>
									<div className="items-center px-4 text-xs">12.04.2024</div>
								</div>
							</div>
							<div className="h-full flex items-center justify-center justify-between">
								{/* <div className="flex">
									<div className="flex px-2 cursor-pointer" onClick={() => handleNumberChange(-1)}>
										-
									</div>
									<div className="flex px-2">{number}</div>
									<div className="flex px-2 cursor-pointer" onClick={() => handleNumberChange(1)}>
										+
									</div>
								</div> */}
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
								<div className="flex flex-col justify-center">
									<div className="flex px-4 text-xl justify-center">Total amount</div>
								</div>
							</div>
							<div className="flex mx-1 my-2 h-4/5">
								<BasicBarChart chartData={PaymentBarChartData} />
							</div>
						</div>
					</div>
					<div className="col-span-1 border border-accent rounded-xl bg-auctionsfade flex flex-col grid grid-rows-3 m-1">
						{/* <div className=""> */}
						<div className="flex flex-col align-center row-span-2 justify-end mb-8">
							<div className="flex justify-center text-3xl my-2">Payment</div>
							<div className="flex justify-center ">Time left</div>
							<strong className="flex justify-center ">2d 13h 43min</strong>
						</div>

						<div className="flex items-center justify-cente place-content-evenly">
							{/* <div className="flex align-center">
								<BasicButton type={'primary'}>Pay</BasicButton>
							</div> */}
							<div className="flex flex-col">
								<div className="flex justify-center my-2 flex-col">
									<div className="flex">
										<div
											className="flex px-2 cursor-pointer"
											onClick={() => handleNumberChange(-1)}
										>
											-
										</div>
										<div className="flex px-2">{number}</div>
										<div className="flex px-2 cursor-pointer" onClick={() => handleNumberChange(1)}>
											+
										</div>
									</div>
									<div className="flex justify-center my-2">
										<BasicButton type={'primary'} onClick={makePayment}>
											{number > 0 ? 'Bid' : 'Pay'}
										</BasicButton>
									</div>
								</div>
								{/* <div className="border-left:1px solid #000;height:500px"></div> */}

								{/* </div> */}
							</div>
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
