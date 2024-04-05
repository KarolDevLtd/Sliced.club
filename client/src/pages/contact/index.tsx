import DefaultLayout from '~/layouts/default';

export default function Contact() {
	return (
		<div>
			<h1>Contact</h1>
		</div>
	);
}

Contact.getLayout = function getLayout(page) {
	return <DefaultLayout>{page}</DefaultLayout>;
};
