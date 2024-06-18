import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { toast } from 'react-toastify';

import PlatformLayout from '~/layouts/platform';
import DashboardHeader from '~/app/_components/dashboard/DashboardHeader';
import Carousel from '~/app/_components/ui/Carousel';
import ProductList from '~/app/_components/products/ProductList';
import { type Product } from '~/types/product-types';
import PaymentList from '~/app/_components/payments/PaymentList';
import { type Payment } from '~/types/payment-types';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import GroupList from '~/app/_components/groups/GroupList';
import { myPayments } from '~/static-data';

export default function Dashboard() {
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);

	const router = useRouter();

	useEffect(() => {
		if (router.query.login === 'success') toast.success('Logged in successfully');
		if (router.query.register === 'success') toast.success('Registered successfully');
		if (router.query.login === 'wallet') toast.success('Logged in with wallet successfully');
	}, [router.query.login, router.query.register]);

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
							options={{
								visibleSlides: 1,
								height: 150,
							}}
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
							options={{
								visibleSlides: 1,
								height: 150,
							}}
						></Carousel>
					</div>
				</div>
				<div className="row-span-2 grid grid-cols-3 gap-4">
					<div className="col-span-2">
						{walletConnected ? (
							<ProductList heading="My Products" isHomeScreen={true} />
						) : (
							'Log in to see all your products'
						)}
						{walletConnected ? (
							<GroupList heading="My Groups" isHomeScreen={true} />
						) : (
							'Log in to see all your groups'
						)}
						{/* <ProductList heading="Available Groups" products={availableGroups} /> */}
					</div>
					<div className="col-span-1 mb-4 overflow-scroll">
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
