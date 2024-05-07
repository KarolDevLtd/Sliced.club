/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { toast } from 'react-toastify';

import PlatformLayout from '~/layouts/platform';
import { DashboardHeader } from '~/app/_components/dashboard/DashboardHeader';
import Carousel from '~/app/_components/ui/Carousel';
import ProductList from '~/app/_components/products/ProductList';
import { type Product } from '~/types/product-types';
import PaymentList from '~/app/_components/payments/PaymentList';
import { type Payment } from '~/types/payment-types';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import GroupList from '~/app/_components/groups/GroupList';

export default function Dashboard() {
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);

	const router = useRouter();

	useEffect(() => {
		if (router.query.login === 'success') toast.success('Logged in successfully');
		if (router.query.register === 'success') toast.success('Registered successfully');
		if (router.query.login === 'wallet') toast.success('Logged in with wallet successfully');
	}, [router.query.login, router.query.register]);

	const myProducts = [
		{
			title: 'Xbox Series X|S',
			groupOrganiser: 'Microsoft',
			price: 475,
			category: 'Gaming Consoles',
			groupMembers: 26,
			itemsReceived: 14,
		},
		{
			title: 'HERO 12 Black',
			groupOrganiser: 'GoPro',
			price: 429.99,
			category: 'Cameras',
			groupMembers: 41,
			itemsReceived: 36,
		},
	] as Product[];

	const availableGroups = [
		{
			title: 'iPhone 15',
			groupOrganiser: 'Apple',
			price: 1149.99,
			category: 'Mobile Phones',
			groupMembers: 119,
		},
		{
			title: 'LG TV OLED 2376',
			groupOrganiser: 'LG',
			price: 999.99,
			category: 'Televisions',
			groupMembers: 69,
		},
		{
			title: 'Birkin 25',
			groupOrganiser: 'Hermes',
			price: 11400,
			category: 'Handbags',
			groupMembers: 21,
		},
		{
			title: 'Cyrusher Kommoda Bike',
			groupOrganiser: 'Cyrusher',
			price: 1699,
			category: 'Electric Bikes',
			groupMembers: 12,
		},
	] as Product[];

	const myPayments = [
		{
			amountDue: 18.27,
			nextPaymentDue: new Date('2024-04-30'),
			product: {
				title: 'Xbox Series X|S',
				groupOrganiser: 'Microsoft',
				price: 475,
				category: 'Gaming Consoles',
				groupMembers: 26,
				itemsReceived: 14,
			},
		},
		{
			amountDue: 10.48,
			nextPaymentDue: new Date('2024-04-30'),
			product: {
				title: 'HERO 12 Black',
				groupOrganiser: 'GoPro',
				price: 429.99,
				category: 'Cameras',
				groupMembers: 41,
				itemsReceived: 36,
			},
		},
	] as Payment[];

	return (
		<>
			<DashboardHeader />
			<div className="grid grid-rows-3 gap-4 min-h-full flex-1">
				<div className="row-span-1 grid grid-cols-3 gap-4">
					<div className="col-span-2">
						<Carousel
							slides={[
								{
									content: <p>Hi</p>,
								},
								{
									content: <p>Bye</p>,
								},
							]}
							options={{}}
						></Carousel>
					</div>
					<div className="col-span-1">
						<Carousel
							slides={[
								{
									content: <p>Hi</p>,
								},
								{
									content: <p>Bye</p>,
								},
							]}
							options={{}}
						></Carousel>
					</div>
				</div>
				<div className="row-span-2 grid grid-cols-3 gap-4">
					<div className="col-span-2">
						{walletConnected ? <ProductList heading="My Products" /> : 'Log in to see all your products'}
						{walletConnected ? <GroupList heading="My Groups" /> : 'Log in to see all your groups'}
						{/* <ProductList heading="Available Groups" products={availableGroups} /> */}
					</div>
					<div className="col-span-1 mb-4">
						<PaymentList heading="Next Payments" payments={myPayments} />
					</div>
				</div>
			</div>
		</>
	);
}

Dashboard.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
