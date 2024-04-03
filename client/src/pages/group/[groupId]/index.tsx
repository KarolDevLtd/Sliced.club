import { useRouter } from 'next/router';
import { useState } from 'react';
import GroupPost from '~/app/_components/groups/group-post';
// import GroupPostInput from '~/app/_components/groups/group-post-input';
import GroupPostsList from '~/app/_components/groups/group-posts-list';
import { InlineLink } from '~/app/_components/ui/inline-link';

export default function Group() {
	const router = useRouter();
	const [refreshPosts, setRefreshPosts] = useState(false);

	const groupId = router.query.groupId;

	const handlePostSubmission = () => {
		// After the post is submitted successfully, set refreshPosts to true to trigger a refresh of posts
		setRefreshPosts(true);
	};

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
			<GroupPost groupId={groupId} refetchPosts={handlePostSubmission} />
			<GroupPostsList
				groupId={groupId}
				refreshPosts={refreshPosts}
				onRefresh={() => {
					setRefreshPosts(false);
				}}
			/>
		</div>
	);
}
