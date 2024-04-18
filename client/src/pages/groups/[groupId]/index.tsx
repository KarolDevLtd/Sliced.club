import { useRouter } from 'next/router';
import { useState } from 'react';
import GroupPost from '~/app/_components/groups/group-post';
import GroupPostItem from '~/app/_components/groups/group-post-item';
// import GroupPostInput from '~/app/_components/groups/group-post-input';
import { BasicButton } from '~/app/_components/ui/basic-button';
import { PageHeader } from '~/app/_components/ui/page-header';
import GenericList from '~/app/_components/ui/generic-list';
import PlatformLayout from '~/layouts/platform';
import { type FirebasePostModel } from '~/models/firebase-post-model';
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
		<div className="flex flex-col min-h-full max-h-full">
			<div className="flex justify-between items-center mb-4">
				<PageHeader>Group Name</PageHeader>
				<BasicButton type="secondary">Leave group</BasicButton>
			</div>

			<div className="grid grid-rows-2 gap-2 flex-1 min-h-full max-h-full">
				<div className="grid grid-cols-4 grid-rows-2 gap-2">
					<div className="col-span-4 p-2 bg-light-grey rounded-md flex gap-2">
						<div className="w-1/3 bg-medium-grey rounded-md"></div>
						<div className="w-2/3">
							<h2>Product Name</h2>
							<p>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ac quam sed sem efficitur
								scelerisque a eget nisi. Aliquam tincidunt euismod ligula, in rutrum metus auctor eu.
								Proin ut mauris varius, ultrices risus eu, sagittis magna. Pellentesque nec mauris vel
								felis pellentesque fermentum id nec lacus. Nam dui erat, bibendum ut tempus id, pretium.
							</p>
						</div>
					</div>

					<div className="col-span-4 grid gap-2 grid-cols-4">
						<div className="min-h-full bg-light-grey p-2 rounded-md flex flex-col flex-end">
							<p className="mt-auto">Auction/Payment</p>
						</div>
						<div className="min-h-full bg-light-grey p-2 rounded-md flex flex-col flex-end">
							<p className="mt-auto">Offer Details</p>
						</div>
						<div className="min-h-full bg-light-grey p-2 rounded-md flex flex-col flex-end">
							<p className="mt-auto">Product Details</p>
						</div>
						<div className="min-h-full bg-light-grey p-2 rounded-md flex flex-col flex-end">
							<p className="mt-auto">About GO</p>
						</div>
					</div>
				</div>

				<div className="flex-1 overflow-y-scroll">
					<GroupPost groupId={groupId} refetchPosts={handlePostSubmission} />
					<GenericList<FirebasePostModel>
						query={api.FirebasePost.getPosts.useQuery}
						renderItem={(post) => (
							<GroupPostItem
								key={post.hash}
								posterKey={post.posterKey}
								hash={post.hash}
								group={post.group}
								imageHash={post?.imageHash}
							/>
						)}
						refreshData={refreshPosts}
						onRefresh={() => {
							setRefreshPosts(false);
						}}
						queryParameters={{ groupId }}
					/>
				</div>
			</div>
		</div>
	);
}

Group.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
