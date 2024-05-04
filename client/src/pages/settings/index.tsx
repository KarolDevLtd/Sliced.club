import PageHeader from '~/app/_components/ui/page-header';
import PlatformLayout from '~/layouts/platform';

export default function Settings() {
	return (
		<div>
			<PageHeader text="Settings" />
		</div>
	);
}

Settings.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
