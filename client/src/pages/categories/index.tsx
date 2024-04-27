import PlatformLayout from '~/layouts/platform';

const Categories = () => {
	return (
		<div>
			<h1>Categories</h1>
		</div>
	);
};

Categories.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default Categories;
