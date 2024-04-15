import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { toast } from 'react-toastify';

import PlatformLayout from '~/layouts/platform';
import { DashboardHeader } from '~/app/_components/dashboard/DashboardHeader';

export default function Dashboard() {
	const router = useRouter();

	useEffect(() => {
		if (router.query.login === 'success') toast.success('Logged in successfully');
		if (router.query.register === 'success') toast.success('Registered successfully');
		if (router.query.login === 'wallet') toast.success('Logged in with wallet successfully');
	}, [router.query.login, router.query.register]);

	return (
		<div className="flex flex-col gap-4 min-h-full max-h-full">
			<DashboardHeader userFirstName="Karol" />
			<div className="grid grid-rows-3 gap-2 min-h-full flex-1">
				<div className="row-span-1 bg-purple rounded-md"></div>
				<div className="row-span-2 bg-orange rounded-md"></div>
			</div>
		</div>
	);
}

Dashboard.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
