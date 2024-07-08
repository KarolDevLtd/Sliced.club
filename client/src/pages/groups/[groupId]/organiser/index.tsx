/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import BasicButton from '@/app/_components/ui/BasicButton';
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
import { FaFacebookSquare, FaYoutube, FaInstagramSquare } from 'react-icons/fa';

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
			<div className="grid grid-rows-4 grid-flow-col gap-4 h-full ">
				<div className="col-span-3 row-span-2 grid grid-cols-7 gap-4 border border-accent rounded-xl">
					<div className="col-span-2 flex justify-center items-center">
						<UserAvatar size={300} />
					</div>
					<div className="p-5 col-span-5 flex flex-col justify-center">
						<div className="text-3xl">GO Name</div>
						{/* <br /> */}
						<div className="flex">
							<FaFacebookSquare size={40} className="m-2" />
							<FaYoutube size={40} className="m-2" />
							<FaInstagramSquare size={40} className="m-2" />
						</div>
						<div>
							Lorem ipsum dolor sit amet. Cum doloremque illo aut libero similique in sunt odit qui earum
							odit eum delectus ullam aut consequatur ratione ut magnam fugiat. Qui dolor aliquam nam
							ratione sapiente ut autem corporis aut commodi amet et autem nesciunt non internos rerum.
							Aut maiores molestias ab saepe veritatis sit labore sint cum dicta labore a assumenda velit
							et minus aliquid sed aspernatur voluptas. Qui repudiandae commodi ad nihil fugit ad quia
							aliquam. Qui esse nesciunt rem magnam dicta qui temporibus suscipit et animi dolore. Quo
							odio vitae vel amet debitis ea quia commodi eos perspiciatis saepe aut quia maxime ex
							voluptates perferendis ex voluptas pariatur! Est excepturi quasi cum doloremque nesciunt nam
							cumque neque id officiis aliquam qui vero nihil ab quis officiis ex dignissimos alias? Ut
							aperiam illum 33 rerum sunt et temporibus dolorum et repellendus aliquam aut debitis
							deleniti. In aliquid quasi aut cupiditate odio quo voluptatem quia et harum commodi?
						</div>
						<br />
						<div>
							<BasicButton type={'accent'}>Send message</BasicButton>
						</div>
					</div>
				</div>
				<div className="col-span-3 row-span-2 overflow-y-auto">
					<div className="text-3xl mx-2">All GO Groups</div>
					<GroupList isHomeScreen={false} creatorKey={query.creatorHash} />
				</div>
			</div>
		</>
	);
}

GroupOrganiser.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
