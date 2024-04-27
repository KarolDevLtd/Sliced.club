import React from 'react';

type PageHeaderProps = {
	children: React.ReactNode;
};

const PageHeader = ({ children }: PageHeaderProps) => {
	return <h1 className="text-4xl">{children}</h1>;
};

export default PageHeader;
