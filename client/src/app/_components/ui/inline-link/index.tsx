import React from 'react';

import Link from 'next/link';

export const InlineLink = ({
	children,
	href,
	target = '_self',
}: {
	children: React.ReactNode;
	href: string;
	target?: '_self' | '_blank';
}) => {
	return (
		<Link className="text-orange hover:underline" href={href} target={target}>
			{children}
		</Link>
	);
};
