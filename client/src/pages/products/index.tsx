import PlatformLayout from '~/layouts/platform';

export default function Products() {
	return (
		<div>
			<h1>Products</h1>
		</div>
	);
}

Products.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
