import PlatformLayout from '~/layouts/platform';

export default function Explore() {
	const groupId = '69';

	return (
		<div>
			<h1>Explore</h1>
		</div>
	);
}

Explore.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
