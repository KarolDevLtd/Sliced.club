import { useRouter } from 'next/router';
import { FaCreditCard } from 'react-icons/fa';
import PaymentList from '~/app/_components/payments/PaymentList';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';
import { PaymentBarChartData } from '~/static-data';
import { TbCalendarDollar } from 'react-icons/tb';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { MdBarChart } from 'react-icons/md';
import BasicBarChart from '~/app/_components/ui/BasicBarChart';
import BasicButton from '~/app/_components/ui/BasicButton';
import { useMinaProvider } from '@/providers/MinaProvider/minaProvider';
import { api } from '@/trpc/react';
import { useWallet } from '@/providers/WalletProvider/walletProvider';
import { type IPFSGroupModel } from '@/models/ipfs/ipfs-group-model';
import { toast } from 'react-toastify';
import Spinner from '@/app/_components/ui/Spinner';
import { type Payment } from '@/types/payment-types';

export default function GroupPayment() {
	const router = useRouter();
	const { query } = router;
	const { walletAddress } = useWallet();
	let groupId: string | null | undefined = null;

	if (query.groupId) {
		if (Array.isArray(query.groupId)) {
			groupId = query.groupId[0];
		} else {
			groupId = query.groupId;
		}
	}
	const { data: groupData } = api.PinataGroup.getGroup.useQuery({ hash: groupId });
	const [number, setNumber] = useState(1);
	const { userPayment, isMinaLoading, getPaymentEvents, getWinner } = useMinaProvider();
	const [group, setGroup] = useState<IPFSGroupModel>();
	const [loading, setIsLoading] = useState<boolean>(false);
	const [productPayments, setProductPayments] = useState<Payment[]>([]);
	const [installmentsLeft, setInstallmentsLeft] = useState<number>(0);
	const [paymentsMade, setPaymentsMade] = useState<number>(0);
	const [outstandingPayments, setOutstandingPayments] = useState<number>(0);

	useEffect(() => {
		// Function to fetch payments
		const fetchPayments = async () => {
			if (!group || !walletAddress) {
				console.log('not loaded');
				return;
			}
			try {
				const data = await getPaymentEvents(group.chainPubKey, walletAddress.toString());
				console.log('data:', data);
				const payments = data.map((payment) => {
					return {
						amountDue: parseInt(payment.amountDue),
						nextPaymentDue: payment.globalSlot,
						transactionId: payment.txHash,
						status: payment.txStatus,
					} as Payment;
				});
				setProductPayments(payments);
			} catch (error) {
				console.error('Error fetching payments:', error);
			}
		};

		// Call the fetch function
		void fetchPayments();
	}, [walletAddress, getPaymentEvents]);

	const handleBackClick = () => {
		router.back();
	};

	const handleNumberChange = (input: number) => {
		if (input > 0 || (input < 0 && number > 0)) setNumber(number + input);
	};

	const makePayment = async () => {
		try {
			if (group && walletAddress) {
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
					parseInt(group.period),
					0
				);
			}
		} catch (err) {
			console.log(err);
		}
	};

	const getWinnerFn = async () => {
		try {
			if (group && walletAddress) {
				await getWinner(
					group.chainPubKey,
					// currentSelectedParticpant.metadata.keyvalues.userKey,
					walletAddress.toString(),
					parseInt(group.participants),
					parseInt(group.price),
					parseInt(group.duration),
					// parseInt(groupData.group.missable) // TODO that's wrong
					3, // missable
					parseInt(group.period)
				);
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
			}
		} catch (err) {
			console.log(err);
			toast.error('Error fetching group item info');
		} finally {
			setIsLoading(false);
		}
	}, [groupData]);

	useEffect(() => {
		const calculatePaymentDetails = () => {
			setInstallmentsLeft(group ? parseInt(group.duration) - productPayments.length : 0);
			setPaymentsMade(group ? productPayments.length * parseInt(group.instalments) : 0);
			setOutstandingPayments(
				group ? parseInt(group.price) - productPayments.length * parseInt(group.instalments) : 0
			);
		};
		calculatePaymentDetails();
	}, [productPayments, group]);

	useEffect(() => {
		void fetchInfo();
	}, [fetchInfo, group]);

	return (
		<>
			<div className="flex flex-col justify-between items-start">
				<PageHeader text={'Payment'} buttonText="Back" onClick={handleBackClick} />
			</div>
			<div className="grid grid-rows-8 grid-flow-col gap-4 h-full">
				<div className="col-span-3 row-span-5 grid grid-cols-3 gap-2">
					<div className="col-span-1 grid grid-rows-9 gap-4">
						<div className="row-span-5 m-2 p-6 border border-accent rounded-xl">
							<div className="flex ">
								<div className="p-4 border border-accent rounded-xl bg-electricblue">
									<FaCreditCard className="text-primary" />
								</div>
								<div className="flex items-center px-4 text-xl">Payment Details</div>
							</div>
							<div className="my-4 flex flex-col h-2/3 justify-around">
								<div className="flex justify-between">
									<div className="text-sm">Installment amount</div>
									<strong className="text-sm">${group ? group?.instalments : null}</strong>
								</div>
								<div className="flex justify-between">
									<div className="text-sm">Installments left</div>
									<strong className="text-sm">{installmentsLeft}</strong>
								</div>
								<div className="flex justify-between">
									<div className="text-sm">Payments made</div>
									<strong className="text-sm">${paymentsMade}</strong>
								</div>
								<div className="flex justify-between">
									<div className="text-sm">Outstanding payments</div>
									<strong className="text-sm">${outstandingPayments}</strong>
								</div>
							</div>
						</div>
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
								<div className="flex">
									<div className="flex px-2 cursor-pointer" onClick={() => handleNumberChange(-1)}>
										-
									</div>
									<div className="flex px-2">{number}</div>
									<div className="flex px-2 cursor-pointer" onClick={() => handleNumberChange(1)}>
										+
									</div>
								</div>
								<div className="text-3xl">${group ? parseInt(group?.instalments) * number : null}</div>
							</div>
						</div>
					</div>
					<div className="col-span-1 grid grid-rows-4 gap-4 p-1">
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
						<div className="flex flex-col align-center row-span-2 justify-end mb-8 items-center">
							{group?.creatorKey == walletAddress?.toString() && (
								<BasicButton type={'secondary'} onClick={getWinnerFn}>
									Get Winner
								</BasicButton>
							)}
							<div className="flex justify-center text-3xl my-2">Payment</div>
							<div className="flex justify-center ">Time left</div>
							<strong className="flex justify-center ">2d 13h 43min</strong>
						</div>
						<div className="flex items-center justify-cente place-content-evenly">
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
										<BasicButton type={'primary'} onClick={makePayment} disabled={isMinaLoading}>
											{number > 0 ? 'Bid' : 'Pay'}
											{isMinaLoading ? (
												<div className="p-2">
													<Spinner size="sm" />
												</div>
											) : null}
										</BasicButton>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="col-span-3 row-span-3 flex">
					<PaymentList heading={'Latest Payments'} payments={productPayments} isHomeScreen={false} />
				</div>
			</div>
		</>
	);
}

GroupPayment.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
