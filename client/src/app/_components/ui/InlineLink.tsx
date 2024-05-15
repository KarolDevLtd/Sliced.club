import React from 'react';

import Link from 'next/link';

import { LiaExternalLinkAltSolid } from 'react-icons/lia';

type InlineLinkProps = {
	type?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'ghost';
	children: React.ReactNode;
	href: string;
	target?: '_self' | '_blank';
	external?: boolean;
};

const InlineLink = ({ type, children, href, target = '_self', external }: InlineLinkProps) => {
	const colourMap = {
		primary: 'btn-primary',
		secondary: 'btn-secondary',
		accent: 'btn-accent',
		neutral: 'btn-neutral',
		ghost: 'btn-ghost',
	};

	return (
		<span className="inline-block">
			<Link
				className={`link ${type && colourMap[type]}`}
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
