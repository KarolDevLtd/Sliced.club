import { useRouter } from 'next/router';
import PlatformLayout from '~/layouts/platform';

const GroupClaim = () => {
	const router = useRouter();

	const groupId = router.query.groupId;

	return (
		<div>
			<h1>Claim</h1>
			<p>Group ID: {groupId}</p>
		</div>
	);
};

GroupClaim.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default GroupClaim;
