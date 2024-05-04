import React from 'react';
import Image from 'next/image';

import { FaBell } from 'react-icons/fa';
import { FaCaretDown } from 'react-icons/fa';

type PageHeaderProps = {
	text: string;
	subtext?: string;
	hideQuickLinks?: boolean;
};

const PageHeader = ({ text, subtext, hideQuickLinks = false }: PageHeaderProps) => {
	return (
		<div className="flex justify-between items-center min-h-[56px]">
			<div>
				<h1 className="text-4xl">{text}</h1>
				<div className="min-h-[16px]">
					{subtext ? <p className="text-xs text-dark-grey">{subtext}</p> : null}
				</div>
			</div>
			{!hideQuickLinks ? (
				<div className="flex items-center gap-3">
					<div className=" flex justify-center items-center border rounded-md min-h-[2.25rem] min-w-[2.25rem]">
						<FaBell />
					</div>
					<div className="flex items-center bg-black border rounded-md min-h-[2.25rem] min-w-[2.25rem] overflow-hidden">
						<div className="bg-white rounded-r-md min-h-[2.25rem] min-w-[2.25rem]">
							<Image src={''} alt={''} />
						</div>
						<div className="min-w-[0.25rem]">
							<FaCaretDown className="h-[12px] w-[12px] text-white" />
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default PageHeader;
