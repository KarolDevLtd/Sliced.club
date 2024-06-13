/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState } from 'react';

import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';

import BasicButton from '../../ui/BasicButton';
import { preventActionNotLoggedIn } from '~/helpers/user-helper';
import { showModal } from '~/helpers/modal-helper';
import Dropdown from '../../ui/Dropdown';
import GroupPostsList from './GroupPostsList';
import AddGroupPostModal from './AddGroupPostModal';

type GroupPostProps = {
	groupId: string;
	refetchPosts: () => void;
};

const GroupPosts = ({ groupId, refetchPosts }: GroupPostProps) => {
	const [refreshPosts, setRefreshPosts] = useState(false);

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);

	const showPostInput = () => {
		if (preventActionNotLoggedIn(isLoggedIn, 'Log in to make a post')) return;
		showModal('add-post');
	};

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between">
				<h3 className="text-2xl">Posts</h3>
				<div className="flex items-center gap-2">
					<Dropdown
						title="Sort by"
						options={[
							{
								text: 'Item 1',
								onClick: () => console.log('Clicked Item 1'),
							},
							{
								text: 'Item 2',
								onClick: () => console.log('Clicked Item 2'),
							},
						]}
					/>
					<BasicButton type="secondary" onClick={showPostInput}>
						Add Post
					</BasicButton>
				</div>
			</div>

			<GroupPostsList
				groupId={groupId}
				refreshPosts={refreshPosts}
				onRefresh={() => {
					setRefreshPosts(false);
				}}
			/>

			<AddGroupPostModal
				groupId={groupId}
				refetchPosts={() => {
					setRefreshPosts(true);
				}}
			/>
		</div>
	);
};

export default GroupPosts;
