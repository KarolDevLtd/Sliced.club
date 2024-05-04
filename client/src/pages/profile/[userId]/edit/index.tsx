import PageHeader from '~/app/_components/ui/page-header';
import PlatformLayout from '~/layouts/platform';

export default function EditProfile() {
	return (
		<div>
			<PageHeader text="Edit Profile" />
		</div>
	);
}

EditProfile.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
