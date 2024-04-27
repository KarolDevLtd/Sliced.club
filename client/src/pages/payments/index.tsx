import PlatformLayout from '~/layouts/platform';

const Payments = () => {
	return (
		<div>
			<h1>Payments</h1>
		</div>
	);
};

Payments.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default Payments;
