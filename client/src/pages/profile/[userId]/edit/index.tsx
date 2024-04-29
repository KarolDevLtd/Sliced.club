import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

const EditProfile = () => {
	return (
		<div>
			<PageHeader text="Edit Profile" />
		</div>
	);
};

EditProfile.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default EditProfile;
