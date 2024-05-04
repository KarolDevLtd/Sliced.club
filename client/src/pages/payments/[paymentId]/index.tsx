import { useRouter } from 'next/router';
import PageHeader from '~/app/_components/ui/page-header';
import PlatformLayout from '~/layouts/platform';

export default function Payment() {
	const router = useRouter();

	const paymentId = router.query.paymentId;

	return (
		<div className="flex flex-col gap-4 min-h-full max-h-full">
			<div className="flex justify-between items-center">
				<PageHeader text={paymentId ? paymentId?.toString() : 'Category'} />
			</div>
		</div>
	);
}

Payment.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
