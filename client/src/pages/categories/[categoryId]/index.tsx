import { useRouter } from 'next/router';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

const Category = () => {
	const router = useRouter();

	const categoryId = router.query.categoryId;

	return (
		<div className="flex flex-col gap-4 min-h-full max-h-full">
			<div className="flex justify-between items-center">
				<PageHeader text={categoryId ? categoryId?.toString() : 'Category'} />
			</div>
		</div>
	);
};

Category.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default Category;
