import { type ReactElement } from 'react';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

export default function Payments() {
	return (
		<>
			<PageHeader text="My Payments" />
		</>
	);
}

Payments.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
