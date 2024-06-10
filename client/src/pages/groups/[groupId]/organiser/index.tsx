/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import GroupList from '~/app/_components/groups/GroupList';
import PageHeader from '~/app/_components/ui/PageHeader';
import UserAvatar from '~/app/_components/ui/UserAvatar';
import { defaultPageLimit } from '~/helpers/search-helper';
import PlatformLayout from '~/layouts/platform';
import { IPFSSearchModel } from '~/models/ipfs/ipfs-search-model';
import { api } from '~/trpc/react';

export default function GroupOrganiser() {
	const router = useRouter();

	const handleBackClick = () => {
		router.back();
	};
	const { pathname, query, asPath } = router;

	return (
		<>
			<div className="flex flex-col justify-between items-start">
				<PageHeader
					text={'GO Details'}
					// text={groupData?.group?.name ?? 'Group Name'}
					// subtext={groupData?.group?.groupOrganiser ?? 'Group Organiser'}
					buttonText="Back"
					onClick={handleBackClick}
				/>
			</div>
			<div className="grid grid-rows-4 grid-flow-col gap-4 h-full">
				<div className="col-span-3 row-span-2 grid grid-cols-7 gap-4">
					<div className="bg-accent col-span-3">
						<UserAvatar />
					</div>
					<div className="bg-accent col-span-4">GO Name</div>
				</div>
				<div className="bg-accent col-span-3 row-span-2">
					All GO Groups
					<GroupList isHomeScreen={false} creatorKey={query.creatorHash} />
				</div>
			</div>
		</>
	);
}

GroupOrganiser.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
