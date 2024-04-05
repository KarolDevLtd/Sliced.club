import { useRouter } from 'next/router';
import PlatformLayout from '~/layouts/platform';

export default function EditProfile() {
	const router = useRouter();

	const userId = router.query.userId;

	return (
		<div>
			<h1>Edit My Profile</h1>
			<p>User ID: {userId}</p>
		</div>
	);
}

EditProfile.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
