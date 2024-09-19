import { type ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

export default function Categories() {
	const router = useRouter();

	useEffect(() => {
		if (router.query.login === 'success') toast.success('Logged in successfully');
		if (router.query.register === 'success') toast.success('Registered successfully');
		if (router.query.login === 'wallet') toast.success('Logged in with wallet successfully');
	}, [router.query.login, router.query.register]);

	return (
		<>
			<PageHeader text="Categories" />
		</>
	);
}

Categories.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
