import React, { type ReactElement } from 'react';

type BasicButtonProps = {
	children: React.ReactNode;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onClick?: (e: any) => any;
	type: 'primary' | 'secondary' | 'tertiary';
	icon?: ReactElement | null;
	disabled?: boolean;
	submitForm?: boolean;
};

const BasicButton = ({ children, onClick, type, icon, disabled, submitForm = false }: BasicButtonProps) => {
	const bgColour = {
		primary: 'bg-purple',
		secondary: 'bg-white',
		tertiary: 'bg-orange',
	};
	const bgHoverColour = {
		primary: 'hover:bg-purple-dark',
		secondary: 'hover:bg-purple-light',
		tertiary: 'hover:bg-orange-dark',
	};
	const textColour = {
		primary: 'text-white',
		secondary: 'text-purple',
		tertiary: 'text-white',
	};
	const borderColour = {
		primary: 'border-purple',
		secondary: 'border-purple',
		tertiary: 'border-orange',
	};
	const borderHoverColour = {
		primary: 'hover:border-purple-dark',
		secondary: 'hover:border-purple',
		tertiary: 'hover:border-orange-dark',
	};

	return (
		<button
			className={`flex items-center justify-center rounded-md px-4 py-3 text-base font-medium hover:bg-indigo-700 md:px-5 md:py-2 border-2 ${bgColour[type]} ${textColour[type]} ${bgHoverColour[type]} ${borderColour[type]} ${borderHoverColour[type]} ${disabled ? 'opacity-70' : null}`}
			onClick={onClick}
			disabled={disabled}
			type={submitForm ? 'submit' : 'button'}
			formNoValidate={submitForm}
		>
			{children}
			{icon ? <span className="ms-2">{icon}</span> : null}
		</button>
	);
};

export default BasicButton;
