import { useRouter } from 'next/router';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

export default function Payment() {
	const router = useRouter();

	const paymentId = router.query.paymentId;

	return (
		<>
			<PageHeader text={paymentId ? paymentId?.toString() : 'Category'} />
		</>
	);
}

Payment.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
