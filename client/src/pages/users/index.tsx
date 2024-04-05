import DefaultLayout from '~/layouts/default';

export default function Users() {
	return (
		<div>
			<h1>Users</h1>
		</div>
	);
}

Users.getLayout = function getLayout(page) {
	return <DefaultLayout>{page}</DefaultLayout>;
};
