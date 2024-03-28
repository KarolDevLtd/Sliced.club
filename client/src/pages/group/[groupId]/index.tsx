import { useRouter } from 'next/router';
import GroupPost from '~/app/_components/ui/groups/group-post';
import { InlineLink } from '~/app/_components/ui/inline-link';

export default function Group() {
	const router = useRouter();

	const groupId = router.query.groupId;

	return (
		<div>
			<h1>Group</h1>
			<p>Group ID: {groupId}</p>
			<ul>
				<li>
					<InlineLink href={`${groupId?.toString()}/manage`}>Manage</InlineLink>
				</li>
				<li>
					<InlineLink href={`${groupId?.toString()}/claim`}>Claim</InlineLink>
				</li>
			</ul>
			<GroupPost />
		</div>
	);
}
