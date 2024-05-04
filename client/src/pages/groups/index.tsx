import PageHeader from '~/app/_components/ui/page-header';
import { useState } from 'react';
import { BasicButton } from '~/app/_components/ui/basic-button';
import { InlineLink } from '~/app/_components/ui/inline-link';
import { preventActionNotLoggedIn } from '~/helpers/user-helper';
import PlatformLayout from '~/layouts/platform';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import AddGroupModal from '~/app/_components/groups/AddGroupModal';
export default function Groups() {
	const groupId = '69';
	const [groupOpen, setGroupOpen] = useState(false);

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);

	const showGroup = () => {
		if (preventActionNotLoggedIn(isLoggedIn, 'Log in to create a group')) return;
		setGroupOpen(true);
	};

	const hideGroup = () => {
		setGroupOpen(false);
	};

	return (
		<>
			<PageHeader text="Groups" subtext="Check out which groups you want to join" />
			<InlineLink href={`groups/${groupId}`}>Group 69</InlineLink>
			<div className="p-1">
				<BasicButton type="primary" onClick={showGroup}>
					Add Group
				</BasicButton>
			</div>
			<AddGroupModal groupOpen={groupOpen} hideGroup={hideGroup} />
		</>
	);
}

Groups.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
