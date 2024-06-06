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
import { closeModal, showModal } from '~/helpers/modal-helper';
import GroupList from '~/app/_components/groups/GroupList';
import { type ChangeEvent, useState, useEffect } from 'react';
import TextInput from '~/app/_components/ui/TextInput';
import BasicSlider from '~/app/_components/ui/BasicSlider';
import SelectOption from '~/app/_components/ui/SelectOption';
import { ProductCategoryOptions } from '~/models/product-category-options';

export default function Groups() {
	const groupId = '69';
	const maxProductPrice = 20000;
	const minProductPrice = 1;
	const [groupOpen, setGroupOpen] = useState(false);
	const [shouldRefreshGroups, setShouldRefreshGroups] = useState(false);
	const [searchContent, setSearchContent] = useState<string | null>(null);
	const [searchMinimumPrice, setSearchMinimumPrice] = useState<string | null>(minProductPrice.toString());
	const [searchMaximumPrice, setSearchMaximumPrice] = useState<string | null>(maxProductPrice.toString());
	const [searchCategory, setSearchCategory] = useState<string | null>(null);

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);

	const showGroupModal = () => {
		if (preventActionNotLoggedIn(isLoggedIn, 'Log in to create a group')) return;
		showModal('add-group');
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

	useEffect(() => {
		console.log(`max price ${searchMaximumPrice}`);
	}, [searchMaximumPrice]);

	useEffect(() => {
		console.log(`min price ${searchMinimumPrice}`);
	}, [searchMinimumPrice]);

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
			<div>
				<TextInput
					id={'group-search'}
					name={'group-search'}
					type={'text'}
					onChange={(e) => handleSearchContentChange(e)}
				/>

				<div className="flex">
					<div className="w-1/2">
						<div className="my-5 px-10">
							<div>Minimum product price: {searchMinimumPrice}</div>
							<BasicSlider
								maxValue={maxProductPrice}
								minValue={minProductPrice}
								defaultValue={maxProductPrice}
								onSlide={function (event: ChangeEvent<HTMLInputElement>): void {
									const value = parseInt(event.target.value);
									setSearchMinimumPrice((maxProductPrice - value + minProductPrice).toString());
								}}
								isReversed={true}
							/>
						</div>
						<div className="my-5 px-10">
							<div>Maximum product price: {searchMaximumPrice}</div>
							<BasicSlider
								maxValue={maxProductPrice}
								minValue={minProductPrice}
								defaultValue={maxProductPrice}
								onSlide={function (event: ChangeEvent<HTMLInputElement>): void {
									const value = parseInt(event.target.value);
									setSearchMaximumPrice(value.toString());
								}}
								isReversed={false}
							/>
						</div>
					</div>
					<div className="flex w-2/5 justify-center items-center">
						<SelectOption
							id={'group-categories-options'}
							name={'Categories'}
							options={ProductCategoryOptions}
							onChange={(e) => handleSelectChange(e)}
						/>
					</div>
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

Groups.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
