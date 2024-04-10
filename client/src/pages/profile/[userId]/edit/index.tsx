import { useRouter } from 'next/router';
import PlatformLayout from '~/layouts/platform';

export default function EditProfile() {
	const router = useRouter();

	const userId = router.query.userId;

	return (
		<div>
			<h1>User ID: {userId}</h1>
		</div>
	);
}

EditProfile.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
