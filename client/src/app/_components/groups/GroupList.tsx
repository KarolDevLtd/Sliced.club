/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// import React, { useEffect, useState } from 'react';
// import ProductItem from './ProductItem';
// import { type Product } from '~/types/product-types';
import { useEffect, useState } from 'react';
import { set } from 'zod';
import { type FirebaseGroupModel } from '~/models/firebase/firebase-group-model';
import { useWallet } from '~/providers/walletprovider';
import { api } from '~/trpc/react';
import GroupItem from './GroupItem';
import { group } from 'console';
// import { useWallet } from '~/providers/walletprovider';
// import { type FirebaseProductModel } from '~/models/firebase-product-model';

type GroupListProps = {
	heading?: string;
	// products: Product[];
};

const GroupList = ({ heading }: GroupListProps) => {
	const { isConnected, walletAddress } = useWallet();

	const {
		data: groupData,
		error,
		refetch,
	} = api.FirebaseGroup.getGroups.useQuery({
		creatorKey: walletAddress?.toString(),
	});

	const [groups, setGroups] = useState<FirebaseGroupModel[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		if (groupData) {
			setGroups(groupData.groups);
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
			{groups ? (
				groups.map((group, index) => {
					return <GroupItem key={index} firebaseGroup={group} />;
				})
			) : (
				<p>No products found.</p>
			)}
		</div>
	);
};
export default GroupList;
