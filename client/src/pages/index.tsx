import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { toast } from 'react-toastify';

import PlatformLayout from '~/layouts/platform';

export default function Dashboard() {
	const router = useRouter();

	useEffect(() => {
		if (router.query.login === 'success') toast.success('Logged in successfully');
		if (router.query.register === 'success') toast.success('Registered successfully');
		if (router.query.login === 'wallet') toast.success('Logged in with wallet successfully');
	}, [router.query.login, router.query.register]);

	return (
		<div>
			<h1>Hello (USER)!</h1>
		</div>
	);
}

Dashboard.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
