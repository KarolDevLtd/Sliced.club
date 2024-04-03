/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react';

type SelectOptionProps = {
	id: string;
	name: string;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	options: {
		value: string;
		name: string;
	}[];
	defaultValue?: string;

	// React Hook Form Props
	validationSchema?: {
		required?: string;
	};
	register?: any;
	errors?: any;
};

export const SelectOption = ({
	id,
	name,
	placeholder,
	disabled,
	required = false,
	options,
	defaultValue = '',

	// React Hook Form Props
	validationSchema,
	register = () => [],
	errors,
}: SelectOptionProps) => {
	const optionList = options.map((option, index) => (
		<option key={index} value={option.value}>
			{option.name}
		</option>
	));

	return (
		<div>
			<select
				className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
				id={id}
				name={name}
				disabled={disabled}
				defaultValue={defaultValue}
				{...register(name, validationSchema)}
			>
				{placeholder ? (
					<option value="" disabled>
						{placeholder}
						{required && '*'}
					</option>
				) : null}
				{optionList}
			</select>
			{errors && errors[name]?.type === 'required' && (
				<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
			)}
		</div>
	);
};
