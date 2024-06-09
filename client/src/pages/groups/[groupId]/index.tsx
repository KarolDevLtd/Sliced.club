/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import GroupNavigation from '~/app/_components/groups/GroupNavigation';
import GroupPosts from '~/app/_components/groups/group-post/GroupPosts';
import Breadcrumbs from '~/app/_components/ui/Breadcrumbs';
import PageHeader from '~/app/_components/ui/PageHeader';
import { fetchImageData } from '~/helpers/image-helper';
import PlatformLayout from '~/layouts/platform';
import { type IPFSGroupModel } from '~/models/ipfs/ipfs-group-model';
import { type IPFSProductModel } from '~/models/ipfs/ipfs-product-model';
import { api } from '~/trpc/react';

export default function Group() {
	const router = useRouter();
	const [refreshPosts, setRefreshPosts] = useState(false);

	const groupId = router.query.groupId;
	const { data: groupData } = api.PinataGroup.getGroup.useQuery({ hash: groupId });
	const { data: productData } = api.PinataProduct.getProduct.useQuery({
		hash: groupData == undefined ? '' : groupData?.group?.productHash,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [group, setGroup] = useState<IPFSGroupModel>();
	const [product, setProduct] = useState<IPFSProductModel>();
	const [hasImage, setHasImage] = useState<boolean>(false);
	const [imageData, setImageData] = useState<string[]>([]);
	const [imageError, setImageError] = useState(false);

	const handlePostSubmission = () => {
		// After the post is submitted successfully, set refreshPosts to true to trigger a refresh of posts
		setRefreshPosts(true);
	};

	const fetchInfo = useCallback(async () => {
		setIsLoading(true);
		try {
			if (groupData) {
				const currGroup = groupData.group as IPFSGroupModel;
				setGroup(currGroup);
			}
			if (productData) {
				const currProd = productData.product as IPFSProductModel;
				setProduct(productData.product);
				await fetchImageData(currProd, setHasImage, setImageData, setImageError);
			}
		} catch (err) {
			console.log(err);
			toast.error('Error fetching group item info');
		} finally {
			setIsLoading(false);
		}
	}, [groupData, productData]);

	useEffect(() => {
		void fetchInfo();
	}, [fetchInfo, group]);

	return (
		<>
			<div className="flex flex-col justify-between items-start">
				<div>
					<Breadcrumbs
						breadCrumbs={[
							{
								text: 'Home',
								link: '/',
							},
							{
								text: 'Groups',
								link: '/groups',
							},
							{
								text: groupData?.group?.name ?? 'Group Name',
								link: '/',
							},
						]}
					/>
				</div>
				<PageHeader
					text={groupData?.group?.name ?? 'Group Name'}
					subtext={groupData?.group?.groupOrganiser ?? 'Group Organiser'}
					buttonText="Leave group"
					onClick={() => console.log('Leave group')}
				/>
			</div>

			<div className="flex-1">
				<div className="grid grid-cols-4 grid-rows-2 gap-2">
					<div className="card card-side bg-base-100 col-span-4 items-center">
						<figure className="min-w-[200px] h-32 bg-accent"></figure>
						<div className="card-body p-6">
							<h2 className="card-title">{product?.name ?? 'Product Name'}</h2>
							<div className="flex items-center gap-4">
								<span>Price: ${product?.price ?? '420.00'}</span>
								<span>Installment: $69.00</span>
							</div>
							<p>
								{groupData?.group?.description ??
									'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sodales neque lacus, quis volutpat lorem faucibus a. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam sit amet augue rutrum, eleifend dui et, sodales orci. Duis eu sodales risus. Vivamus gravida fringilla nibh in venenatis. Proin sit amet leo dapibus, efficitur diam a, viverra leo. Donec metus ante, ornare in blandit eu, elementum id enim. Fusce augue leo, sollicitudin eu dolor vitae.'}
							</p>
						</div>
					</div>

					<GroupNavigation groupHash={groupId?.toString() ?? ''} group={group} product={product} />
				</div>

				<div className="flex-1 mt-6 grid grid-cols-8 gap-4">
					<div className="col-span-5">
						<GroupPosts groupId={groupId} refetchPosts={handlePostSubmission} />
					</div>
					<div className="col-span-3"></div>
				</div>
			</div>
		</>
	);
}

Group.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
