import { useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import GroupItem from './GroupItem';
import { type IPFSSearchModel } from '~/models/ipfs/ipfs-search-model';
import { defaultPageLimit } from '~/helpers/search-helper';
import { useInView } from 'react-intersection-observer';
import Spinner from '../ui/Spinner';
import Skeleton from '../ui/Skeleton';
import { type PinataGroupsDataType } from '@/models/ipfs/ipfs-group-model';
import Search from '../ui/Search';

type GroupListProps = {
	heading?: string;
	searchValue: string | null;
	isHomeScreen: boolean;
	searchCategory: string | null;
	searchMaxPrice: string | null;
	searchMinPrice: string | null;
};

const GroupList = ({
	heading,
	isHomeScreen,
	searchValue,
	searchCategory,
	searchMaxPrice,
	searchMinPrice,
}: GroupListProps) => {
	const [groups, setGroups] = useState<IPFSSearchModel[]>([]);
	const [groupCount, setGroupCount] = useState<number>(0);
	const [displayGroupCount, setDisplayGroupCount] = useState(defaultPageLimit);

	const { ref, inView } = useInView();

	// Construct the input object based on the available properties
	const queryInput = {
		groupCount: displayGroupCount,
		...(searchValue && { searchValue }),
		...(searchCategory && { searchCategory }),
		...(searchMinPrice && { searchMinPrice }),
		...(searchMaxPrice && { searchMaxPrice }),
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
		<div className={`flex flex-col gap-2 overflow-y-scroll ${isHomeScreen ? ' h-80 py-4' : 'm-1 h-fit'}`}>
			<div className="flex justify-center align-center items-center justify-between">
				<h2 className="text-2xl font-normal">{heading}</h2>
				<Search />
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
					{groupCount > displayGroupCount ? <div ref={ref} /> : 'No more products to display...'}
					{isLoading ? <Spinner /> : null}
				</div>
			) : (
				<p>No groups found.</p>
			)}
		</div>
	);
};

export default GroupList;
