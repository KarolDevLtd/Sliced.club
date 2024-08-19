import { useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import GroupItem from './GroupItem';
import { type IPFSSearchModel } from '~/models/ipfs/ipfs-search-model';
import { defaultPageLimit, maxRecordNumber } from '~/helpers/search-helper';
import { useInView } from 'react-intersection-observer';
import Spinner from '../ui/Spinner';
import Skeleton from '../ui/Skeleton';
import { type PinataGroupsDataType } from '@/models/ipfs/ipfs-group-model';
import Search from '../ui/Search';

type GroupListProps = {
	heading?: string;
	isHomeScreen: boolean;
};

const GroupList = ({ heading, isHomeScreen }: GroupListProps) => {
	const [groups, setGroups] = useState<IPFSSearchModel[]>([]);
	const [groupCount, setGroupCount] = useState<number>(0);
	const [displayGroupCount, setDisplayGroupCount] = useState(defaultPageLimit);
	const [searchValue, setSearchValue] = useState<string>('');
	const [category, setCategory] = useState<string>('');
	const [minValue, setMinValue] = useState<string>('');
	const [maxValue, setMaxValue] = useState<string>('');

	const { ref, inView } = useInView();

	// Construct the input object based on the available properties
	const queryInput = {
		groupCount: displayGroupCount,
		searchValue: searchValue,
		...(category && { category }),
		...(minValue && { minValue }),
		...(maxValue && { maxValue }),
	};

	const {
		data: groupData,
		error,
		refetch,
		isLoading,
	} = api.PinataGroup.getGroups.useQuery<PinataGroupsDataType>(queryInput);

	useEffect(() => {
		if (groupData) {
			setGroups(groupData == null ? [] : groupData.rows);
			setGroupCount(groupData == null ? 0 : groupData.count);
		}
	}, [groupData]);

	useEffect(() => {
		if (inView) {
			setDisplayGroupCount((prevCount) => prevCount + defaultPageLimit);
		}
	}, [inView]);

	return (
		//TODO: bug here with multiple isHomeScreens. Reduce to one.
		<div className={`flex flex-col gap-2 overflow-y-scroll ${isHomeScreen ? ' h-80' : 'm-1 h-fit'}`}>
			<div className="flex justify-center align-center items-center justify-between">
				<h2 className="text-2xl font-normal">{heading}</h2>
				<Search
					searchValue={searchValue}
					setSearchValue={setSearchValue}
					searchCategory={category}
					setSearchCategory={setCategory}
					searchMinPrice={minValue}
					setSearchMinPrice={setMinValue}
					searchMaxPrice={maxValue}
					setSearchMaxPrice={setMaxValue}
				/>
			</div>
			{isLoading && groups.length == 0 ? (
				<Skeleton count={isHomeScreen ? 3 : 6} />
			) : groups && groups.length > 0 ? (
				<div className={`overflow-y-scroll flex flex-col  ${isHomeScreen ? 'h-80' : 'm-4 h-fit'}`}>
					{groups.map((group, index) => (
						<GroupItem
							key={index}
							groupHash={group.ipfs_pin_hash}
							productHash={group.metadata.keyvalues.productHash}
						/>
					))}
					{groupCount < maxRecordNumber ? (
						<div ref={ref} />
					) : (
						<div className="flex w-full justify-center">No more groups to display...</div>
					)}
					{isLoading ? <Spinner /> : null}
				</div>
			) : (
				<p>No groups found.</p>
			)}
		</div>
	);
};

export default GroupList;
