import { useRouter } from 'next/router';
import InlineLink from '~/app/_components/ui/InlineLink';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

const Profile = () => {
	const router = useRouter();

	const userId = router.query.userId;

	return (
		<div>
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
		</div>
	);
};

Profile.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default Profile;
