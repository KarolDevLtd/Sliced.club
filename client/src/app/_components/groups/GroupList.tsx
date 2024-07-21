import { useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import GroupItem from './GroupItem';
import { type IPFSSearchModel } from '~/models/ipfs/ipfs-search-model';
import { defaultPageLimit } from '~/helpers/search-helper';
import { useInView } from 'react-intersection-observer';
import Spinner from '../ui/Spinner';
import Skeleton from '../ui/Skeleton';
import { IPFSGroupModel } from '@/models/ipfs/ipfs-group-model';

interface PinataGroupDataType {
	groups: {
		rows: IPFSSearchModel[];
		count: number;
	};
}

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
	} = api.PinataGroup.getGroups.useQuery<PinataGroupDataType>(queryInput);

	useEffect(() => {
		if (groupData) {
			setGroups(groupData.groups == null ? [] : groupData.groups.rows);
			setGroupCount(groupData.groups == null ? 0 : groupData.groups.count);
		}
	}, [groupData]);

	useEffect(() => {
		if (error) {
			console.error('Error fetching groups:', error);
		}
	}, [error]);

	useEffect(() => {
		if (inView) {
			setDisplayGroupCount((prevCount) => prevCount + defaultPageLimit);
		}
	}, [inView]);

	return (
		//TODO: bug here with multiple isHomeScreens. Reduce to one.
		<div className={`flex flex-col gap-2 py-4 overflow-y-scroll ${isHomeScreen ? ' h-80' : 'm-4 h-fit'}`}>
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
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
