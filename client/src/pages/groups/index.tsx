/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import PageHeader from '~/app/_components/ui/PageHeader';
import BasicButton from '~/app/_components/ui/BasicButton';
import InlineLink from '~/app/_components/ui/InlineLink';
import { preventActionNotLoggedIn } from '~/helpers/user-helper';
import PlatformLayout from '~/layouts/platform';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import AddGroupModal from '~/app/_components/groups/AddGroupModal';
import { showModal } from '~/helpers/modal-helper';
import GroupList from '~/app/_components/groups/GroupList';
import { useState } from 'react';

export default function Groups() {
	const groupId = '69';
	const [groupOpen, setGroupOpen] = useState(false);
	const [shouldRefreshGroups, setShouldRefreshGroups] = useState(false);

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);

	const showGroupModal = () => {
		if (preventActionNotLoggedIn(isLoggedIn, 'Log in to create a group')) return;
		showModal('add-group');
	};

	const handleGroupSubmitted = () => {
		setShouldRefreshGroups((prev) => !prev);
	};

	const hideGroup = () => {
		setGroupOpen(false);
	};

	return (
		<>
			<PageHeader text="Groups" subtext="Check out which groups you want to join" />
			<InlineLink href={`groups/${groupId}`}>Group 69</InlineLink>
			<div className="p-1">
				{/* @ts-ignore */}
				<BasicButton type="primary" onClick={showGroupModal}>
					Add Group
				</BasicButton>
			</div>
			<GroupList key={shouldRefreshGroups ? 'refresh' : 'normal'} />
			<AddGroupModal groupOpen={groupOpen} hideGroup={hideGroup} onGroupSubmitted={handleGroupSubmitted} />
		</>
	);
}

Groups.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
