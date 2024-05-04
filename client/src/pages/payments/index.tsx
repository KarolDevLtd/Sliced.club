import PageHeader from '~/app/_components/ui/page-header';
import PlatformLayout from '~/layouts/platform';

export default function Payments() {
	return (
		<>
			<PageHeader text="My Payments" />
		</>
	);
}

Payments.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
