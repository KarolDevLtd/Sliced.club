import { useRouter } from 'next/router';
import PageHeader from '~/app/_components/ui/page-header';
import PlatformLayout from '~/layouts/platform';

export default function Category() {
	const router = useRouter();

	const categoryId = router.query.categoryId;

	return (
		<>
			<PageHeader text={categoryId ? categoryId?.toString() : 'Category'} />
		</>
	);
}

Category.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
