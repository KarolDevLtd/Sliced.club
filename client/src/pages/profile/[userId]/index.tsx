import { useRouter } from 'next/router';
import { InlineLink } from '~/app/_components/ui/inline-link';

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
			</ul>
		</div>
	);
}
