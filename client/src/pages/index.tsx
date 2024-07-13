/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import PlatformLayout from '~/layouts/platform';
import DashboardHeader from '~/app/_components/dashboard/DashboardHeader';
import ProductList from '~/app/_components/products/ProductList';
import PaymentList from '~/app/_components/payments/PaymentList';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import GroupList from '~/app/_components/groups/GroupList';
import { myPayments } from '~/static-data';
import BasicButton from '@/app/_components/ui/BasicButton';
import CommunityItem from '@/app/_components/community/CommunityItem';
import { type IPFSSearchModel } from '@/models/ipfs/ipfs-search-model';
import gopro from '../../public/promotedimages/gopro.jpg';
import mustang from '../../public/promotedimages/mustang.jpg';
import tesla from '../../public/promotedimages/tesla.jpg';
import Carousel from '@/app/_components/ui/Carousel';
import ZoomableImage from '@/app/_components/ui/ZoomableImage';

export default function Dashboard() {
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);

	const router = useRouter();

	useEffect(() => {
		if (router.query.login === 'success') toast.success('Logged in successfully');
		if (router.query.register === 'success') toast.success('Registered successfully');
		if (router.query.login === 'wallet') toast.success('Logged in with wallet successfully');
	}, [router.query.login, router.query.register]);

	const [carouselProducts, setCarouselProducts] = useState<IPFSSearchModel[]>();

	const imageData = [gopro, mustang, tesla];

	return (
		<>
			<DashboardHeader />
			<div className="grid grid-rows-7 gap-4 h-full flex-1">
				<div className="row-span-2 grid grid-cols-9">
					<div className="p-2 col-span-6 mx-4">
						<div className="border border-accent bg-backgroundfade rounded-xl p-3 flex flex-col justify-center">
							<div className="text-xl">Notification Title</div>
							<div className="text-sm">12.01.24</div>
							<div className="text-sm">
								Lorem ipsum dolor sit amet. Et mollitia aliquid ut accusantium atque ut consectetur
								praesentium et nulla expedita non unde repudiandae sit veritatis deserunt qui quaerat
								officia.
							</div>
							<div className="w-1/5 p-2">
								<BasicButton size={'sm'} type={'secondary'}>
									View details
								</BasicButton>
							</div>
						</div>
					</div>
					<div className="h-full w-full flex col-span-3">
						<figure className="h-52 bg-accent w-80 col-span-1 flex justify-center">
							<Carousel
								slides={imageData.map((image) => ({
									content: (
										<div>
											<ZoomableImage source={image.src} width={320} height={320} alt={'image'} />
										</div>
									),
								}))}
								options={{
									visibleSlides: 1,
								}}
							/>
						</figure>
					</div>
				</div>
				<div className="grid grid-rows-3 row-span-5">
					<div className="row-span-1">
						<div className="grid grid-cols-9">
							<div className="col-span-6 mx-4">
								{walletConnected ? (
									<ProductList
										heading="My Products"
										isHomeScreen={true}
										setCarouselProducts={setCarouselProducts}
									/>
								) : (
									'Log in to see all your products'
								)}
							</div>
							<div className="col-span-3 mx-4">
								<PaymentList heading="Next Payments" payments={myPayments} isHomeScreen={true} />
							</div>
						</div>
					</div>
					<div className="row-span-2">
						<div className="grid grid-cols-9">
							<div className="col-span-6 mx-4">
								{walletConnected ? (
									<GroupList
										heading="My Groups"
										isHomeScreen={true}
										searchValue={null}
										searchCategory={null}
										searchMaxPrice={null}
										searchMinPrice={null}
									/>
								) : (
									'Log in to see all your groups'
								)}
							</div>
							<div className="h-full col-span-3 mx-4">
								<div className="flex flex-col gap-2 py-4">
									{<h2 className="text-2xl">{'Community'}</h2>}
									<CommunityItem
										id={''}
										hash={'QmUAsmEKt2LN6m2UH3qtRoayKoDuin2uE7hAikCWd88r24'}
										group={''}
										posterKey={'B62qpw7xEDfEwt89VxtQJFEUGJ62LmoXum6xRmcnPAAyHst1nLgG8Aw'}
										imageHash={null}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

Dashboard.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
