import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { toast } from 'react-toastify';

import PlatformLayout from '~/layouts/platform';
import { DashboardHeader } from '~/app/_components/dashboard/DashboardHeader';
import Carousel from '~/app/_components/ui/Carousel';
import MyProducts from '~/app/_components/products/MyProducts';

export default function Dashboard() {
	const router = useRouter();

	useEffect(() => {
		if (router.query.login === 'success') toast.success('Logged in successfully');
		if (router.query.register === 'success') toast.success('Registered successfully');
		if (router.query.login === 'wallet') toast.success('Logged in with wallet successfully');
	}, [router.query.login, router.query.register]);

	return (
		<div className="flex flex-col gap-4 min-h-full max-h-full">
			<DashboardHeader />
			<div className="grid grid-rows-3 gap-2 min-h-full flex-1">
				<div className="row-span-1 grid grid-cols-3 gap-2">
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
				<div className="row-span-2 grid grid-cols-3 gap-2">
					<div className="col-span-2">
						<MyProducts />
					</div>
					<div className="col-span-1 bg-light-grey rounded-md"></div>
				</div>
			</div>
		</div>
	);
}

Dashboard.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
