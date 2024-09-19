import { useRouter } from 'next/router';
import { type ReactElement } from 'react';
import PlatformLayout from '~/layouts/platform';

export default function ManageGroup() {
	const router = useRouter();

	const groupId = router.query.groupId;

	return (
		<>
			<h1>Manage Group</h1>
			<p>Group ID: {groupId}</p>
		</>
	);
}

ManageGroup.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
