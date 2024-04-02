/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from '~/trpc/react';
import { InlineLink } from '~/app/_components/ui/inline-link';

export default function Home() {
	return (
		<div>
			<h1>Sliced</h1>
			<ul>
				<li>
					<InlineLink href="/explore">Explore</InlineLink>
				</li>
				<li>
					<InlineLink href="/group/create">Create Croup</InlineLink>
				</li>
			</ul>
		</div>
	);
}
