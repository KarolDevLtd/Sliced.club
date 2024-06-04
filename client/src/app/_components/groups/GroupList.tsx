/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useState } from 'react';
import { useWallet } from '~/providers/WalletProvider';
import { api } from '~/trpc/react';
import GroupItem from './GroupItem';
import { type IPFSSearchModel } from '~/models/ipfs/ipfs-search-model';
import { defaultPageLimit } from '~/helpers/search-helper';
import { useInView } from 'react-intersection-observer';
import Spinner from '../ui/Spinner';

type GroupListProps = {
	heading?: string;
	searchValue: string | null;
	isHomeScreen: boolean;
	// products: Product[];
};

const GroupList = ({ heading, isHomeScreen, searchValue }: GroupListProps) => {
	const { isConnected, walletAddress } = useWallet();
	const [groups, setGroups] = useState<IPFSSearchModel[]>([]);
	const [groupCount, setGroupCount] = useState<number>(0);
	const [displayGroupCount, setDisplayGroupCount] = useState(defaultPageLimit);

	const { ref, inView } = useInView();

	const {
		data: groupData,
		error,
		refetch,
		isLoading,
	} = api.PinataGroup.getGroups.useQuery({
		creatorKey: walletAddress?.toString(),
		groupCount: displayGroupCount,
		searchValue: searchValue,
	});

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
		<div className="flex flex-col gap-2 mb-4">
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
			{groups && groups.length > 0 ? (
				<div
					className={
						isHomeScreen
							? 'overflow-y-scroll flex flex-col m-4 h-60'
							: 'overflow-y-scroll flex flex-col m-4 h-96'
					}
				>
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
