import React from 'react';

import Link from 'next/link';

import { LiaExternalLinkAltSolid } from 'react-icons/lia';

const InlineLink = ({
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
		<span className="inline-block">
			<Link
				className="text-orange hover:underline flex items-center w-fit"
				href={href}
				target={target}
				onClick={(e) => {
					e?.stopPropagation();
				}}
			>
				{children}
				{external ? (
					<span className="text-black ms-1 text-sm">
						<LiaExternalLinkAltSolid />
					</span>
				) : null}
			</Link>
		</span>
	);
};

export default InlineLink;
