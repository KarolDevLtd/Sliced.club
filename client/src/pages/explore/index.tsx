import PlatformLayout from '~/layouts/platform';

const Explore = () => {
	return (
		<div>
			<h1>Explore</h1>
		</div>
	);
};

Explore.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default Explore;
