import PageHeader from '~/app/_components/ui/page-header';
import PlatformLayout from '~/layouts/platform';

export default function Payments() {
	return (
		<div>
			<PageHeader text="My Payments" />
		</div>
	);
}

Payments.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
