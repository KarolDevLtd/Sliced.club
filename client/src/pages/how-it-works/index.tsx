import DefaultLayout from '~/layouts/default';

export default function HowItWorks() {
	return (
		<div>
			<h1>How It Works</h1>
		</div>
	);
}

HowItWorks.getLayout = function getLayout(page) {
	return <DefaultLayout>{page}</DefaultLayout>;
};
