import React from 'react';

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
}: TextAreaProps) => {
	return (
		<div>
			<div className="flex items-center justify-between">
				{label ? (
					<label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
						{label}
					</label>
				) : null}
			</div>
			<div className="mt-1">
				<textarea
					className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
					id={id}
					name={name}
					placeholder={placeholder}
					rows={rows}
					onChange={onChange}
					disabled={disabled}
					required={required}
				></textarea>
			</div>
		</div>
	);
};
