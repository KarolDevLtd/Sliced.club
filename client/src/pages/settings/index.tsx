import PlatformLayout from '~/layouts/platform';

const Settings = () => {
	return (
		<div>
			<h1>Settings</h1>
		</div>
	);
};

Settings.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default Settings;
