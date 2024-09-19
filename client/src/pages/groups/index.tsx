import PageHeader from '~/app/_components/ui/PageHeader';
import BasicButton from '~/app/_components/ui/BasicButton';
import { preventActionNotLoggedIn } from '~/helpers/user-helper';
import PlatformLayout from '~/layouts/platform';
import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import AddGroupModal from '~/app/_components/groups/AddGroupModal';
import { closeModal, showModal } from '~/helpers/modal-helper';
import GroupList from '~/app/_components/groups/GroupList';
import { useState, type ReactElement } from 'react';
import { useMinaProvider } from '@/providers/MinaProvider/minaProvider';

export default function Groups() {
	const [groupOpen, setGroupOpen] = useState(false);
	const [shouldRefreshGroups, setShouldRefreshGroups] = useState(false);
	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);
	const { compileContractsOnly } = useMinaProvider();

	const showGroupModal = async () => {
		try {
			if (preventActionNotLoggedIn(isLoggedIn, 'Log in to create a group')) return;
			showModal('add-group');
			await compileContractsOnly();
		} catch (err) {
			console.log('showGroupModal', err);
		}
	};

	const handleGroupSubmitted = () => {
		setShouldRefreshGroups((prev) => !prev);
	};

	return (
		<>
			<PageHeader
				text="Groups"
				subtext="Check out which groups you want to join"
				buttonText="Add Group"
				onClick={showGroupModal}
			></PageHeader>
			<GroupList key={shouldRefreshGroups ? 'refresh' : 'normal'} isHomeScreen={false} />
			<AddGroupModal groupOpen={groupOpen} hideGroup={closeModal} onGroupSubmitted={handleGroupSubmitted} />
		</>
	);
}

Groups.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
