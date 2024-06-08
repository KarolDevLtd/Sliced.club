import router from 'next/router';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

export default function GroupOrganiser() {
	const handleBackClick = () => {
		router.back();
	};
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
					<div className="bg-accent col-span-3">Image</div>
					<div className="bg-accent col-span-4">GO Name</div>
				</div>
				<div className="bg-accent col-span-3 row-span-2">All GO Groups</div>
			</div>
		</>
	);
}

GroupOrganiser.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
