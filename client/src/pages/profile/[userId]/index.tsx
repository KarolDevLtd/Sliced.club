import { useRouter } from 'next/router';
import PageHeader from '~/app/_components/ui/page-header';
import { InlineLink } from '~/app/_components/ui/inline-link';
import PlatformLayout from '~/layouts/platform';

export default function Profile() {
	const router = useRouter();

	const userId = router.query.userId;

	return (
		<>
			<PageHeader text="My Profile" subtext={`User ID: ${userId ? userId?.toString() : '69'}`} />
			<ul>
				<li>
					<InlineLink href={`/profile/${userId?.toString()}/edit`}>Edit</InlineLink>
				</li>
				<li>
					<InlineLink href="https://create.t3.gg/" target="_blank" external={true}>
						External Link
					</InlineLink>
				</li>
			</ul>
		</>
	);
}

Profile.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
