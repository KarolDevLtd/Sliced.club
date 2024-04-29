import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

const Products = () => {
	return (
		<div className="flex flex-col gap-4 min-h-full max-h-full">
			<PageHeader text="My Products" subtext="Check the details of your products" />
		</div>
	);
};

Products.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default Products;
