/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react';

type CheckboxProps = {
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

export const Checkbox = ({
	children,
	id,
	name,
	disabled,
	required = false,

	// React Hook Form Props
	validationSchema,
	register = () => [],
	errors,
}: CheckboxProps) => {
	return (
		<div>
			<div className="flex items-center mt-2">
				<input
					className="me-2 hover:cursor-pointer"
					id={id}
					type="checkbox"
					disabled={disabled}
					required={required}
					// React Hook Form
					{...register(name, validationSchema)}
				/>
				<label className="text-sm hover:cursor-pointer" htmlFor={id}>
					{children}
					{required && '*'}
				</label>
			</div>
			{/* React Hook Form Errors */}
			{errors && errors[name]?.type === 'required' && (
				<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
			)}
		</div>
	);
};
