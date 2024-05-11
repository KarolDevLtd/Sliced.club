/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react';

type CheckBoxProps = {
	type?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'ghost';
	children: React.ReactNode;
	id: string;
	name: string;
	disabled?: boolean;
	required?: boolean;

	// React Hook Form Props
	validationSchema?: {
		required?: string;
	};
	register?: any;
	errors?: any;
};

const CheckBox = ({
	type,
	children,
	id,
	name,
	disabled,
	required = false,

	// React Hook Form Props
	validationSchema,
	register = () => [],
	errors,
}: CheckBoxProps) => {
	const colourMap = {
		primary: 'checkbox-primary',
		secondary: 'checkbox-secondary',
		accent: 'checkbox-accent',
		neutral: 'checkbox-neutral',
		ghost: 'checkbox-ghost',
	};

	return (
		<div className="form-control">
			<label htmlFor={id} className="label cursor-pointer">
				<span className="label-text">
					{children}
					{required && '*'}
				</span>
				<input
					id={id}
					disabled={disabled}
					required={required}
					// React Hook Form
					{...register(name, validationSchema)}
					type="checkbox"
					defaultChecked
					className={`checkbox ${type && colourMap[type]}`}
				/>
			</label>
			{errors && errors[name]?.type === 'required' && (
				<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
			)}
		</div>
	);
};

export default CheckBox;
