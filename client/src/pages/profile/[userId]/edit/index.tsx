import { type ReactElement } from 'react';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

export default function EditProfile() {
	return (
		<>
			<PageHeader text="Edit Profile" />
		</>
	);
}

EditProfile.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
