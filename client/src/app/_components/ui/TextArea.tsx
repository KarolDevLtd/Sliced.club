/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { type ChangeEvent, useState } from 'react';

type TextAreaProps = {
	type?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'ghost';
	size?: 'xs' | 'sm' | 'md' | 'lg';
	id: string;
	name: string;
	label?: string;
	altLabel1?: string;
	altLabel2?: string;
	altLabel3?: string;
	placeholder?: string;
	rows?: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onChange?: (e: any) => any;
	disabled?: boolean;
	required?: boolean;
	showCharacterCount?: boolean;

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
	};
	register?: any;
	errors?: any;
};

const TextArea = ({
	type,
	size,
	id,
	name,
	label,
	altLabel1,
	altLabel2,
	altLabel3,
	placeholder,
	rows = 5,
	onChange,
	disabled,
	required = false,
	showCharacterCount = false,

	// React Hook Form Props
	validationSchema,
	register = () => [],
	errors,
}: TextAreaProps) => {
	const [characterCount, setCharacterCount] = useState(0);

	const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		onChange;
		setCharacterCount(e.target.value.length);
	};

	const colourMap = {
		primary: 'select-primary',
		secondary: 'select-secondary',
		accent: 'select-accent',
		neutral: 'select-neutral',
		ghost: 'select-ghost',
	};

	const sizeMap = {
		xs: 'select-xs',
		sm: 'select-sm',
		md: 'select-md',
		lg: 'select-lg',
	};

	return (
		<div>
			<label htmlFor={id} className="form-control">
				{label ?? altLabel1 ? (
					<div className="label">
						{label ? (
							<span className="label-text">
								{label}
								{required && '*'}
							</span>
						) : null}
						{altLabel1 ? <span className="label-text-alt">{altLabel1}</span> : null}
					</div>
				) : null}
				<textarea
					className={`textarea textarea-bordered h-24 ${type && colourMap[type]} ${size && sizeMap[size]}`}
					id={id}
					name={name}
					placeholder={`${placeholder ? placeholder : ''}${required && placeholder && !label ? '*' : ''}`}
					rows={rows}
					disabled={disabled}
					required={required}
					// React Hook Form
					{...register(name, validationSchema)}
					onChange={handleOnChange}
				></textarea>
				{altLabel2 ?? altLabel3 ? (
					<div className="label">
						{altLabel2 ? <span className="label-text-alt">{altLabel2}</span> : null}
						{altLabel3 ? <span className="label-text-alt">{altLabel3}</span> : null}
					</div>
				) : null}
			</label>
			{showCharacterCount && <span className="label-text-alt">Character count: {characterCount}</span>}
			{/* React Hook Form Errors */}
			{errors && errors[name]?.type === 'required' && (
				<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
			)}
			{errors && errors[name]?.type === 'minLength' && (
				<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
			)}
		</div>
	);
};

export default TextArea;
