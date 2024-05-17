/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// import React, { useEffect, useState } from 'react';
// import ProductItem from './ProductItem';
// import { type Product } from '~/types/product-types';
import { useEffect, useState } from 'react';
import { useWallet } from '~/providers/WalletProvider';
import { api } from '~/trpc/react';
import GroupItem from './GroupItem';
import { type IPFSSearchModel } from '~/models/ipfs/ipfs-search-model';
// import { useWallet } from '~/providers/walletprovider';
// import { type FirebaseProductModel } from '~/models/firebase-product-model';

type GroupListProps = {
	heading?: string;
	searchValue?: string;
	// products: Product[];
};

const GroupList = ({ heading }: GroupListProps) => {
	const { isConnected, walletAddress } = useWallet();

	const {
		data: groupData,
		error,
		refetch,
	} = api.PinataGroup.getGroups.useQuery({ creatorKey: walletAddress?.toString() });

	const [groups, setGroups] = useState<IPFSSearchModel[]>();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		if (groupData) {
			setGroups(groupData.groups == null ? [] : groupData.groups.rows);
			setIsLoading(false);
		}
	}, [groupData]);

	useEffect(() => {
		if (error) {
			console.error('Error fetching groups:', error);
			setIsLoading(false);
		}
	}, [error]);

	return (
		<div className="flex flex-col gap-2 mb-4">
			{heading ? <h2 className="text-2xl">{heading}</h2> : null}
			{groups && groups.length > 0 ? (
				groups.map((group, index) => {
					// conosle.log(group);
					console.log(group);
					return (
						<GroupItem
							key={index}
							groupHash={group.ipfs_pin_hash}
							productHash={group.metadata.keyvalues.productHash}
						/>
					);
				})
			) : (
				<p>No groups found.</p>
			)}
		</div>
	);
};
export default GroupList;
