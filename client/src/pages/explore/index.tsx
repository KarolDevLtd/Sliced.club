import { InlineLink } from '~/app/_components/ui/inline-link';

export default function Explore() {
	const groupId = '69';

	return (
		<div>
			<h1>Explore</h1>
			<ul>
				<li>
					<InlineLink href={`group/${groupId}`}>Group 69</InlineLink>
				</li>
			</ul>
		</div>
	);
}
