import PlatformLayout from '~/layouts/platform';

export default function Categories() {
	return (
		<div>
			<h1>Categories</h1>
		</div>
	);
}

Categories.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
