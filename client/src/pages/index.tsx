/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { toast } from 'react-toastify';

import { InlineLink } from '~/app/_components/ui/inline-link';
import DefaultLayout from '~/layouts/default';

import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import { partialUtil } from 'node_modules/zod/lib/helpers/partialUtil';

export default function Home() {
	const router = useRouter();
	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);

	useEffect(() => {
		if (router.query.logout === 'success') toast.success('Logged out successfully');
	}, [router.query.logout]);

	return (
		<div>
			<ul>
				<li>{isLoggedIn ? <h1>Sliced</h1> : <p>Log in to go to platform</p>}</li>
			</ul>
		</div>
	);
}

Home.getLayout = function getLayout(page) {
	return <DefaultLayout>{page}</DefaultLayout>;
};
