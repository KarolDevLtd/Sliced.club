import React, { type ReactElement } from 'react';

type BasicButtonProps = {
	children: React.ReactNode;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onClick?: (e: any) => any;
	type: 'primary' | 'secondary' | 'accent' | 'neutral' | 'ghost';
	size?: 'xs' | 'sm' | 'md' | 'lg';
	iconBefore?: boolean;
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
	iconBefore = false,
	disabled,
	submitForm = false,
}: BasicButtonProps) => {
	const colourMap = {
		primary: 'btn-primary',
		secondary: 'btn-secondary',
		accent: 'btn-accent',
		neutral: 'btn-neutral',
		ghost: 'btn-ghost',
	};

	const sizeMap = {
		xs: 'btn-xs',
		sm: 'btn-sm',
		md: 'btn-md',
		lg: 'btn-lg',
	};

	return (
		<button
			className={`btn ${colourMap[type]} ${sizeMap[size]} ${disabled ? 'btn-disabled' : null} gap-0`}
			onClick={onClick}
			disabled={disabled}
			type={submitForm ? 'submit' : 'button'}
			formNoValidate={submitForm}
		>
			{icon && iconBefore ? <span className="me-1 w-4">{icon}</span> : null}
			{children}
			{icon && !iconBefore ? <span className="ms-1 w-4">{icon}</span> : null}
		</button>
	);
};

export default BasicButton;
