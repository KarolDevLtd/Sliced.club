import React from 'react';

type PageHeaderProps = {
	text: string;
	subtext?: string;
};

const PageHeader = ({ text, subtext }: PageHeaderProps) => {
	return (
		<div>
			<h1 className="text-4xl">{text}</h1>
			{subtext ? <p className="text-xs text-dark-grey">{subtext}</p> : null}
		</div>
	);
};

export default PageHeader;
