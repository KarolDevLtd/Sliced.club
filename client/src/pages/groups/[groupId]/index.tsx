import { useRouter } from 'next/router';
import { useState } from 'react';
import GroupPost from '~/app/_components/groups/group-post';
import GroupPostItem from '~/app/_components/groups/group-post-item';
// import GroupPostInput from '~/app/_components/groups/group-post-input';
import GenericList from '~/app/_components/ui/generic-list';
import { InlineLink } from '~/app/_components/ui/inline-link';
import PlatformLayout from '~/layouts/platform';
import { FirebasePostModel } from '~/models/firebase-post-model';
import { api } from '~/trpc/react';

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
			<GenericList<FirebasePostModel>
				query={api.FirebasePost.getPosts.useQuery}
				renderItem={(post) => (
					<GroupPostItem key={post.hash} posterKey={post.posterKey} hash={post.hash} group={post.group} />
				)}
				refreshData={refreshPosts}
				onRefresh={() => {
					setRefreshPosts(false);
				}}
				queryParameters={{ groupId }}
			/>
		</div>
	);
}

Group.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
