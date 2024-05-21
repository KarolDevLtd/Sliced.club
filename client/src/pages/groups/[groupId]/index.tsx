/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import GroupPost from '~/app/_components/groups/group-post/GroupPost';
// import GroupPostInput from '~/app/_components/groups/group-post-input';
import GroupPostsList from '~/app/_components/groups/group-post/GroupPostsList';
import BasicButton from '~/app/_components/ui/BasicButton';
import Carousel from '~/app/_components/ui/Carousel';
import PageHeader from '~/app/_components/ui/PageHeader';
import ZoomableImage from '~/app/_components/ui/ZoomableImage';
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
		hash: groupData == undefined ? '' : groupData?.group.productHash,
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
			<div className="flex justify-between items-center">
				{/* <PageHeader text={groupData?.group.name} hideQuickLinks={true} /> */}
				<BasicButton type="secondary">Leave group</BasicButton>
			</div>

			<div className="grid grid-rows-2 gap-2 flex-1 min-h-full max-h-full">
				<div className="grid grid-cols-4 grid-rows-2 gap-2">
					<div className="col-span-4 p-2 bg-light-grey rounded-md flex gap-2">
						<div className="w-1/3 bg-medium-grey rounded-md">
							<Carousel
								slides={imageData.map((value, index) => ({
									content: (
										<ZoomableImage
											source={value}
											width={600}
											height={600}
											alt={`Uploaded image ${index}`}
										/>
									),
								}))}
							/>
						</div>
						<div className="w-2/3">
							<strong>{product?.name}</strong>
							<div className="flex">{`${'Price (USD$)'} ${product?.price}`}</div>
							<div className="flex">{`${'Duration'} ${group?.duration} months`}</div>
							<div className="flex">{`${'Installments'} ${(group?.price as unknown as number) / (group?.participants * group?.duration)}`}</div>
							<p>{groupData?.group.description}</p>
							<div>
								{product?.productAttributes?.map((attribute) => {
									return (
										<div key={attribute.propertyName}>
											<strong>{attribute.propertyName}:</strong> {attribute.propertyValue}
										</div>
									);
								})}
							</div>
						</div>
					</div>

					<div className="col-span-4 grid gap-2 grid-cols-4">
						<div className="min-h-full bg-light-grey p-2 rounded-md flex flex-col flex-end">
							<p className="mt-auto">Auction/Payment</p>
						</div>
						<div className="min-h-full bg-light-grey p-2 rounded-md flex flex-col flex-end">
							<p className="mt-auto">Offer Details</p>
						</div>
						<div className="min-h-full bg-light-grey p-2 rounded-md flex flex-col flex-end">
							<p className="mt-auto">Product Details</p>
						</div>
						<div className="min-h-full bg-light-grey p-2 rounded-md flex flex-col flex-end">
							<p className="mt-auto">About GO</p>
						</div>
					</div>
				</div>

				<div className="flex-1 overflow-y-scroll">
					<GroupPost groupId={groupId} refetchPosts={handlePostSubmission} />
					<GroupPostsList
						groupId={groupId}
						refreshPosts={refreshPosts}
						onRefresh={() => {
							setRefreshPosts(false);
						}}
					/>
				</div>
			</div>
		</>
	);
}

Group.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
