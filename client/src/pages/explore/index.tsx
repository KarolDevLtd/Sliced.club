import PlatformLayout from '~/layouts/platform';

export default function Explore() {
	return (
		<div>
			<h1>Explore</h1>
		</div>
	);
}

Explore.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
