import PageHeader from '~/app/_components/ui/page-header';
import PlatformLayout from '~/layouts/platform';

export default function EditProfile() {
	return (
		<>
			<PageHeader text="Edit Profile" />
		</>
	);
}

EditProfile.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
