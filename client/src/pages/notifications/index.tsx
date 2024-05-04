import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

export default function Notifications() {
	return (
		<div>
			<PageHeader text="Notifications" />
		</div>
	);
}

Notifications.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
