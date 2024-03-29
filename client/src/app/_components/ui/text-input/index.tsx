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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onChange?: (e: any) => any;
	disabled?: boolean;
	required?: boolean;
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
}: TextInputProps) => {
	return (
		<div>
			<div className="flex items-center justify-between">
				{label ? (
					<label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
						{label}
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
					placeholder={placeholder}
					onChange={onChange}
					disabled={disabled}
					required={required}
				></input>
			</div>
		</div>
	);
};
