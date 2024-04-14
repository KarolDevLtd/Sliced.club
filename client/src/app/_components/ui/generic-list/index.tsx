/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useEffect, useState } from 'react';

type GenericListProps<T> = {
	query: (params: any) => any; // Define your TRPC query type here
	renderItem: (item: T) => JSX.Element;
	refreshData: boolean;
	onRefresh: () => void;
	queryParameters: any;
};

const GenericList = <T extends { hash: string }>({
	query,
	renderItem,
	refreshData,
	onRefresh,
	queryParameters,
}: GenericListProps<T>) => {
	console.log('query parameters: ');
	console.log(queryParameters);
	const { data, error, refetch } = query(queryParameters);
	const [items, setItems] = useState<T[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// If refreshData is true, trigger a manual refetch
		if (refreshData) {
			void refetch();
			onRefresh();
		}
	}, [onRefresh, refetch, refreshData]);

	useEffect(() => {
		setIsLoading(true);

		if (data?.items) {
			setItems(data.items);
			setIsLoading(false);
		} else {
			setItems([]); // Set items to an empty array if data.items is undefined
			setIsLoading(false);
		}
	}, [data]);

	useEffect(() => {
		if (error) {
			console.error('Error fetching data:', error);
			setIsLoading(false);
		}
	}, [error]);

	return (
		<div className="flex flex-auto w-full overflow-hidden">
			{isLoading ? (
				<div>Loading...</div>
			) : (
				<ul className="overflow-auto flex flex-col">
					{items.map((item) => (
						<React.Fragment key={item.hash}>{renderItem(item)}</React.Fragment>
					))}
				</ul>
			)}
		</div>
	);
};

export default GenericList;
