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
import { type ChangeEvent, useState, type ReactElement } from 'react';
import { useMinaProvider } from '@/providers/MinaProvider/minaProvider';

export default function Groups() {
	const maxProductPrice = 20000;
	const minProductPrice = 1;
	const [groupOpen, setGroupOpen] = useState(false);
	const [shouldRefreshGroups, setShouldRefreshGroups] = useState(false);
	const [searchContent, setSearchContent] = useState<string | null>(null);
	const [searchMinimumPrice, setSearchMinimumPrice] = useState<string | null>(minProductPrice.toString());
	const [searchMaximumPrice, setSearchMaximumPrice] = useState<string | null>(maxProductPrice.toString());
	const [searchCategory, setSearchCategory] = useState<string | null>(null);

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

	const handleSearchContentChange = (event: ChangeEvent<HTMLInputElement>) => {
		// console.log(event.target.value);
		setSearchContent(event.target.value);
	};

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setSearchCategory(event.target.value);
	};

	return (
		<>
			<PageHeader text="Groups" subtext="Check out which groups you want to join" />
			<div className="p-1">
				<BasicButton type="primary" onClick={showGroupModal}>
					Add Group
				</BasicButton>
			</div>
			<div>
				<div className="flex">
					<div className="w-1/2"></div>
				</div>
			</div>
			<GroupList
				key={shouldRefreshGroups ? 'refresh' : 'normal'}
				isHomeScreen={false}
				searchValue={searchContent}
				searchCategory={searchCategory}
				searchMaxPrice={searchMaximumPrice}
				searchMinPrice={searchMinimumPrice}
			/>
			<AddGroupModal groupOpen={groupOpen} hideGroup={closeModal} onGroupSubmitted={handleGroupSubmitted} />
		</>
	);
}

Groups.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
