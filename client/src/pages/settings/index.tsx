import PlatformLayout from '~/layouts/platform';

export default function Settings() {
	return (
		<div>
			<h1>Settings</h1>
		</div>
	);
}

Settings.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
