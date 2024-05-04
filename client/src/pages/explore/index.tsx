import PlatformLayout from '~/layouts/platform';

export default function Explore() {
	return (
		<>
			<h1>Explore</h1>
		</>
	);
}

Explore.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
