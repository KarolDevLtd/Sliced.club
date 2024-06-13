import React from 'react';
import Image from 'next/image';

import { FaBell } from 'react-icons/fa';
import { FaCaretDown } from 'react-icons/fa';
import BasicButton from './BasicButton';
import UserAvatar from './UserAvatar';

type PageHeaderProps = {
	text: string;
	subtext?: string;
	hideQuickLinks?: boolean;
	buttonText?: string;
	onClick?: () => void;
};

const PageHeader = ({ text, subtext, hideQuickLinks = false, buttonText, onClick }: PageHeaderProps) => {
	return (
		<div className="flex justify-between items-center min-h-[56px] min-w-full">
			<div className="flex items-center">
				<div>
					<h1 className="text-4xl">{text}</h1>
					<div className="min-h-[16px]">
						{subtext ? <p className="text-xs text-dark-grey">{subtext}</p> : null}
					</div>
				</div>
				{buttonText && (
					<div className="ms-8">
						<BasicButton type="accent" onClick={onClick}>
							{buttonText}
						</BasicButton>
					</div>
				)}
			</div>
			{!hideQuickLinks ? (
				<div className="flex items-center gap-3">
					<div className=" flex justify-center items-center border rounded-md min-h-[2.25rem] min-w-[2.25rem]">
						<FaBell />
					</div>
					<div className="dropdown dropdown-hover dropdown-end">
						<div tabIndex={0} role="button" className="p-0 flex items-center">
							<UserAvatar />
							<FaCaretDown className="h-[12px] w-[12px] text-white" />
						</div>
						<ul
							tabIndex={0}
							className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
						>
							<li>
								<a>Item 1</a>
							</li>
							<li>
								<a>Item 2</a>
							</li>
						</ul>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default PageHeader;
