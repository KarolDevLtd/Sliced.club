import React from 'react';

import InlineLink from './InlineLink';

export type BreadCrumb = {
	text: string;
	link: string;
};

type BreadcrumbProps = {
	breadCrumbs: BreadCrumb[];
};

const Breadcrumbs = ({ breadCrumbs }: BreadcrumbProps) => {
	const allBreadCrumbs = breadCrumbs;
	const lastBreadCrumb = allBreadCrumbs.pop();

	return (
		<div className="text-sm breadcrumbs pt-0 pb-4">
			<ul>
				{breadCrumbs.map((breadCrumb: BreadCrumb, index) => {
					return (
						<li key={index}>
							<InlineLink href={breadCrumb.link}>{breadCrumb.text}</InlineLink>
						</li>
					);
				})}
				<li>
					<strong>{lastBreadCrumb?.text}</strong>
				</li>
			</ul>
		</div>
	);
};

export default Breadcrumbs;
