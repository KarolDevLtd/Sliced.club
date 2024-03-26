import React from 'react';

import Link from 'next/link';

import { LiaExternalLinkAltSolid } from 'react-icons/lia';

export const InlineLink = ({
	children,
	href,
	target = '_self',
	external,
}: {
	children: React.ReactNode;
	href: string;
	target?: '_self' | '_blank';
	external?: boolean;
}) => {
	return (
		<Link className="text-orange hover:underline flex items-center" href={href} target={target}>
			{children}
			{external ? (
				<span className="text-black ms-1 text-sm">
					<LiaExternalLinkAltSolid />
				</span>
			) : null}
		</Link>
	);
};
