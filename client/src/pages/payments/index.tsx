import PlatformLayout from '~/layouts/platform';

export default function Payments() {
	return (
		<div>
			<h1>Payments</h1>
		</div>
	);
}

Payments.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
