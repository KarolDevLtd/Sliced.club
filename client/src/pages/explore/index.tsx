import { type ReactElement } from 'react';
import PlatformLayout from '~/layouts/platform';

export default function Explore() {
	return (
		<>
			<h1>Explore</h1>
		</>
	);
}

Explore.getLayout = function getLayout(page: ReactElement) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
