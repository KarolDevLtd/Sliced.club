/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { type ChangeEvent, useState } from 'react';

type TextAreaProps = {
	label?: string;
	id: string;
	name: string;
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

export const TextArea = ({
	label,
	id,
	name,
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

	return (
		<div className="w-full p-2">
			<div className="flex items-center justify-between">
				{label ? (
					<label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
						{label}
						{required && '*'}
					</label>
				) : null}
			</div>
			<div className="mt-1">
				<textarea
					className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
				{showCharacterCount && <p className="text-sm text-light-grey">Character count: {characterCount}</p>}
				{/* React Hook Form Errors */}
				{errors && errors[name]?.type === 'required' && (
					<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
				)}
				{errors && errors[name]?.type === 'minLength' && (
					<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
				)}
			</div>
		</div>
	);
};
