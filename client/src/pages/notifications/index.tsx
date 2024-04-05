import PlatformLayout from '~/layouts/platform';

export default function Notifications() {
	return (
		<div>
			<h1>Notifications</h1>
		</div>
	);
}

Notifications.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
