import React, { type ReactElement } from 'react';

type BasicButtonProps = {
	children: React.ReactNode;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onClick?: (e: any) => any;
	type: 'primary' | 'secondary' | 'accent' | 'neutral';
	size?: 'xs' | 'sm' | 'md' | 'lg';
	icon?: ReactElement | null;
	disabled?: boolean;
	submitForm?: boolean;
};

const BasicButton = ({
	children,
	onClick,
	type,
	size = 'md',
	icon,
	disabled,
	submitForm = false,
}: BasicButtonProps) => {
	const colourMap = {
		primary: 'btn-primary',
		secondary: 'btn-secondary',
		accent: 'btn-accent',
		neutral: 'btn-neutral',
	};

	const sizeMap = {
		xs: 'btn-xs',
		sm: 'btn-sm',
		md: 'btn-md',
		lg: 'btn-lg',
	};

	return (
		<button
			className={`btn ${colourMap[type]} ${sizeMap[size]} ${disabled ? 'btn-disabled' : null}`}
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
