import { type ReactElement } from 'react';
import PlatformLayout from '~/layouts/platform';

export default function CreateGroup() {
	return (
		<>
			<h1>Create Group</h1>
		</>
	);
}

CreateGroup.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
