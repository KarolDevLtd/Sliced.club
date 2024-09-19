import { useRouter } from 'next/router';
import { type ReactElement } from 'react';
import PlatformLayout from '~/layouts/platform';

export default function GroupClaim() {
	const router = useRouter();

	const groupId = router.query.groupId;

	return (
		<>
			<h1>Claim</h1>
			<p>Group ID: {groupId}</p>
		</>
	);
}

GroupClaim.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
