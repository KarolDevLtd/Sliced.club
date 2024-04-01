/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
// https:jujuontheweb.medium.com/how-to-use-react-hook-form-with-your-custom-form-components-a86a1a77cf3c

import React from 'react';

import { InlineLink } from '../inline-link';

type TextInputProps = {
	label?: string;
	link?: {
		text: string;
		external?: boolean;
		href: string;
	};
	id: string;
	name: string;
	// Feel free to add more types to this enum as we need them
	type: 'text' | 'email' | 'password';
	autoComplete?: string;
	placeholder?: string;
	onChange?: (e: any) => any;
	disabled?: boolean;
	required?: boolean;

	// React Hook Form Props
	validationSchema?: {
		required?: string;
		minlength?: {
			value?: number;
			message?: string;
		};
		maxlength?: {
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

export const TextInput = ({
	label,
	link,
	id,
	name,
	type,
	autoComplete,
	placeholder,
	onChange,
	disabled,
	required = false,

	// React Hook Form Props
	validationSchema,
	register,
	errors,
}: TextInputProps) => {
	return (
		<div>
			<div className="flex items-center justify-between">
				{label ? (
					<label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
						{label}
						{required && '*'}
					</label>
				) : null}
				{link ? (
					<div className="text-sm">
						<InlineLink href={link.href} external={link.external}>
							{link.text}
						</InlineLink>
					</div>
				) : null}
			</div>
			<div className="mt-1">
				<input
					className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
					id={id}
					name={name}
					type={type}
					autoComplete={autoComplete}
					placeholder={`${placeholder}${required ? '*' : null}`}
					onChange={onChange}
					disabled={disabled}
					required={required}
					// React Hook Form
					{...register(name, validationSchema)}
				></input>
				{/* React Hook Form Errors */}
				{errors && errors[name]?.type === 'required' && (
					<span className="mt-1 text-xs text-red-error">{errors[name]?.message}</span>
				)}
				{errors && errors[name]?.type === 'pattern' && (
					<span className="mt-1 text-xs text-red-error">{errors[name]?.message}</span>
				)}
			</div>
		</div>
	);
};
