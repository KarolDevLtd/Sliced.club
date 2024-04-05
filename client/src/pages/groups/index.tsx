import { InlineLink } from '~/app/_components/ui/inline-link';
import PlatformLayout from '~/layouts/platform';

export default function Groups() {
	const groupId = '69';

	return (
		<ul>
			<li>
				<InlineLink href={`group/${groupId}`}>Group 69</InlineLink>
			</li>
		</ul>
	);
}

Groups.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};