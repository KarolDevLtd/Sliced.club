import PageHeader from '~/app/_components/ui/page-header';
import PlatformLayout from '~/layouts/platform';

export default function Settings() {
	return (
		<>
			<PageHeader text="Settings" />
		</>
	);
}

Settings.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
