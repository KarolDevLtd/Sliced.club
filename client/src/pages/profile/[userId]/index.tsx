import { useRouter } from 'next/router';
import { InlineLink } from '~/app/_components/ui/InlineLink';
import PlatformLayout from '~/layouts/platform';

export default function Profile() {
	const router = useRouter();

	const userId = router.query.userId;

	return (
		<div>
			<h1>My Profile</h1>
			<p>User ID: {userId}</p>
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
		</div>
	);
}

Profile.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
