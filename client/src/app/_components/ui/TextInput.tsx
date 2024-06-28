/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
// https:jujuontheweb.medium.com/how-to-use-react-hook-form-with-your-custom-form-components-a86a1a77cf3c

import React, { type ReactElement } from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';

type TextInputProps = {
	label?: string;
	id: string;
	name: string;
	// Feel free to add more types to this enum as we need them
	type: 'text' | 'email' | 'password' | 'number';
	autoComplete?: string;
	placeholder?: string;
	icon?: ReactElement | null;
	onChange?: (e: any) => void;
	disabled?: boolean;
	required?: boolean;
	value?: string;

	// React Hook Form Props
	validationSchema?: {
		required?: string;
		minLength?: {
			value?: number;
			message?: string;
		};
		maxLength?: {
			value?: number;
			message?: string;
		};
		pattern?: {
			value?: RegExp;
			message?: string;
		};
		min?: {
			value?: number;
			message?: string;
		};
		max?: {
			value?: number;
			message?: string;
		};
	};
	register?: any;
	errors?: any;
};

const TextInput = ({
	label,
	id,
	name,
	type,
	autoComplete,
	placeholder,
	icon,
	onChange,
	disabled,
	required = false,
	value,
	// React Hook Form Props
	validationSchema,
	register = () => [],
	errors,
}: TextInputProps) => {
	// const { register } = useFormContext();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (onChange) {
			onChange(e);
		}
	};

	return (
		<div>
			<label htmlFor={id} className="input input-bordered flex items-center gap-2">
				{label && `${label}:`}
				<input
					id={id}
					name={name}
					type={type}
					autoComplete={autoComplete}
					placeholder={`${placeholder ? placeholder : ''}${required && placeholder && !label ? '*' : ''}`}
					onChange={handleChange}
					disabled={disabled}
					required={required}
					value={value}
					// React Hook Form
					{...register(name, {
						...validationSchema,
						onChange: (e) => {
							handleChange(e);
						},
					})}
					className="grow"
				/>
				{required && <span className="badge badge-info">Required</span>}
				{icon ? <span>{icon}</span> : null}
			</label>
			{/* React Hook Form Errors */}
			{errors && errors[name]?.type === 'required' && (
				<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
			)}
			{errors && errors[name]?.type === 'pattern' && (
				<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
			)}
			{errors && errors[name]?.type === 'minLength' && (
				<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
			)}
			{errors && errors[name]?.type === 'min' && (
				<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
			)}
			{errors && errors[name]?.type === 'max' && (
				<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
			)}
		</div>
	);
};

export default TextInput;
