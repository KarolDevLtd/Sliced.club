import PlatformLayout from '~/layouts/platform';

const CreateGroup = () => {
	return (
		<div>
			<h1>Create Group</h1>
		</div>
	);
};

CreateGroup.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default CreateGroup;
