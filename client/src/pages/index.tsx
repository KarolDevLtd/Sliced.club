import { type ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import PlatformLayout from '~/layouts/platform';
import DashboardHeader from '~/app/_components/dashboard/DashboardHeader';
import ProductList from '~/app/_components/products/ProductList';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import GroupList from '~/app/_components/groups/GroupList';
import BasicButton from '@/app/_components/ui/BasicButton';
import CommunityItem from '@/app/_components/community/CommunityItem';
import gopro from '../../public/promotedimages/gopro.jpg';
import mustang from '../../public/promotedimages/mustang.jpg';
import tesla from '../../public/promotedimages/tesla.jpg';
import Carousel from '@/app/_components/ui/Carousel';
import ZoomableImage from '@/app/_components/ui/ZoomableImage';
import { TiHome } from 'react-icons/ti';

export default function Dashboard() {
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);

	const router = useRouter();

	useEffect(() => {
		if (router.query.login === 'success') toast.success('Logged in successfully');
		if (router.query.register === 'success') toast.success('Registered successfully');
		if (router.query.login === 'wallet') toast.success('Logged in with wallet successfully');
	}, [router.query.login, router.query.register]);

	const imageData = [gopro, mustang, tesla];

	return (
		<>
			<DashboardHeader />
			<div className="grid grid-cols-6">
				<div className="col-span-4 grid grid-row-5">
					<div className="row-span-1">
						<div className="p-2 mx-2">
							<div className="border border-accent bg-backgroundfade rounded-xl p-3 flex flex-col justify-center">
								<div className="text-xl font-normal">Notification Title</div>
								<div className="text-sm">12.01.24</div>
								<div className="text-sm">
									Lorem ipsum dolor sit amet. Et mollitia aliquid ut accusantium atque ut consectetur
									praesentium et nulla expedita non unde repudiandae sit veritatis deserunt qui
									quaerat officia.
								</div>
								<div className="w-1/5 p-2">
									<BasicButton size={'sm'} type={'secondary'}>
										View details
									</BasicButton>
								</div>
							</div>
						</div>
					</div>
					<div className="row-span-2">
						<div className="col-span-6 mx-4">
							{walletConnected ? (
								<ProductList heading="My Products" isHomeScreen={true} />
							) : (
								'Log in to see all your products'
							)}
						</div>
					</div>
					<div className="row-span-2">
						<div className="col-span-6 mx-4">
							{walletConnected ? (
								<GroupList heading="Available groups" isHomeScreen={true} />
							) : (
								'Log in to see all your groups'
							)}
						</div>
					</div>
				</div>
				<div className="grid col-span-2 grid-row-5">
					<div className="row-span-1">
						<div className="w-full flex col-span-3 justify-center">
							<figure className="h-52 bg-accent w-80 col-span-1 flex">
								<Carousel
									slides={imageData.map((image) => ({
										content: (
											<div>
												<ZoomableImage
													source={image.src}
													width={320}
													height={320}
													alt={'image'}
												/>
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
					<div className="row-span-2">
						<div className="col-span-3 mx-4 h-full">
							<div className="flex flex-col gap-2 py-4 h-full">
								<h2 className="text-2xl">Next Payment</h2>
								<div className="h-full border border-accent rounded-xl flex grid grid-cols-5 w-full justify-around bg-itemfade py-2">
									<div className="col-span-1 w-full flex justify-center align-center items-center">
										<div className="p-2 border border-accent rounded-xl bg-electricblue">
											<TiHome size={30} />
										</div>
									</div>
									<div className="col-span-4 w-full flex align-center items-center">
										<div className="grid grid-rows-2">
											<strong>$ 225</strong>
											<div>Group Name - Model 3</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="row-span-2">
						<div className="col-span-3 mx-4">
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
		</>
	);
}

Dashboard.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
