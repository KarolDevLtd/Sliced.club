import React, { useState } from 'react';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';

export type DropdownOption = {
	text: string;
	onClick: () => void;
};

type DropdownProps = {
	title: string;
	options: DropdownOption[];
};

const Dropdown = ({ title, options }: DropdownProps) => {
	const [menuOpen, setMenuOpen] = useState(false);

	const handleClick = () => {
		setMenuOpen(!menuOpen);
	};

	return (
		<details className="dropdown dropdown-end">
			<summary tabIndex={0} className="m-1 btn flex items-center justify-between gap-2" onClick={handleClick}>
				{title}
				{menuOpen ? (
					<FaCaretUp className="h-[12px] w-[12px] text-white" />
				) : (
					<FaCaretDown className="h-[12px] w-[12px] text-white" />
				)}
			</summary>
			<ul tabIndex={0} className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
				{options.map((option: DropdownOption, index) => {
					return (
						<li key={index}>
							<span onClick={() => option.onClick()}>{option.text}</span>
						</li>
					);
				})}
			</ul>
		</details>
	);
};

export default Dropdown;
