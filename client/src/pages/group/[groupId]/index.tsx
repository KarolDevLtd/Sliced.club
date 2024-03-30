import { useRouter } from 'next/router';
import GroupPostInput from '~/app/_components/groups/group-post-input';
import GroupPostsList from '~/app/_components/groups/group-posts-list';
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
			<GroupPostInput groupId={groupId} />
			<GroupPostsList groupId={groupId} />
		</div>
	);
}
