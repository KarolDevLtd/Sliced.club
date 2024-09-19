import React, { type ReactElement } from 'react';

type TextInputProps = {
	label?: string;
	id: string;
	name: string;
	// Feel free to add more types to this enum as we need them
	type: 'text' | 'email' | 'password' | 'number';
	autoComplete?: string;
	placeholder?: string;
	icon?: ReactElement | null;
	iconClick?: () => void;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
	required?: boolean;
	value?: string;
	width?: string | null;

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
	iconClick,
	onChange,
	disabled,
	required = false,
	value,
	width = null,
	validationSchema,
	register = () => [],
	errors,
}: TextInputProps) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (onChange) {
			onChange(e);
		}
	};

	return (
		<>
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
						onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
							handleChange(e);
						},
					})}
					className={`grow ${width ?? ''}`}
				/>
				{required && <span className="badge badge-info">Required</span>}
				{icon ? <span onClick={iconClick}>{icon}</span> : null}
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
		</>
	);
};

export default TextInput;
