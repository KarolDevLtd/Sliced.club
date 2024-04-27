import PlatformLayout from '~/layouts/platform';

const Notifications = () => {
	return (
		<div>
			<h1>Notifications</h1>
		</div>
	);
};

Notifications.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default Notifications;
