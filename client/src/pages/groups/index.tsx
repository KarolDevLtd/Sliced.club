import InlineLink from '~/app/_components/ui/InlineLink';
import PageHeader from '~/app/_components/ui/PageHeader';
import PlatformLayout from '~/layouts/platform';

const Groups = () => {
	const groupId = '69';

	return (
		<div>
			<PageHeader text="Groups" subtext="Check out which groups you want to join" />
			<ul>
				<li>
					<InlineLink href={`groups/${groupId}`}>Group 69</InlineLink>
				</li>
			</ul>
		</div>
	);
};

Groups.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};

export default Groups;
