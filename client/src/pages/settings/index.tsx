import { type ReactElement } from 'react';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

export default function Settings() {
	return (
		<>
			<PageHeader text="Settings" />
		</>
	);
}

Settings.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
