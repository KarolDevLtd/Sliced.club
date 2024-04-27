import { InlineLink } from '~/app/_components/ui/InlineLink';
import PlatformLayout from '~/layouts/platform';

export default function Groups() {
	const groupId = '69';

	return (
		<ul>
			<li>
				<InlineLink href={`groups/${groupId}`}>Group 69</InlineLink>
			</li>
		</ul>
	);
}

Groups.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
