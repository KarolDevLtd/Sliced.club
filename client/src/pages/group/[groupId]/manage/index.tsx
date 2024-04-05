import { useRouter } from 'next/router';
import PlatformLayout from '~/layouts/platform';

export default function ManageGroup() {
	const router = useRouter();

	const groupId = router.query.groupId;

	return (
		<div>
			<h1>Manage Group</h1>
			<p>Group ID: {groupId}</p>
		</div>
	);
}

ManageGroup.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
