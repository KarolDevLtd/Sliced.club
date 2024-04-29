import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

const Settings = () => {
	return (
		<div>
			<PageHeader text="Settings" />
		</div>
	);
};

Settings.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default Settings;
