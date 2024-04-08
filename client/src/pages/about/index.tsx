import DefaultLayout from '~/layouts/default';

export default function About() {
	return (
		<div>
			<h1>About</h1>
		</div>
	);
}

About.getLayout = function getLayout(page) {
	return <DefaultLayout>{page}</DefaultLayout>;
};
