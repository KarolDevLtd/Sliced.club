/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react';

type SelectOptionProps = {
	id: string;
	name: string;
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	options: {
		value: string;
		name: string;
		symbol?: string;
	}[];
	defaultValue?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	validationSchema?: {
		required?: string;
	};
	register?: any;
	errors?: any;
	displayKey?: 'value' | 'name' | 'symbol'; // Allow 'value', 'name', or 'symbol'
};

const SelectOption = ({
	id,
	name,
	label,
	placeholder,
	disabled,
	required = false,
	options,
	defaultValue,
	value,
	onChange,
	displayKey = 'name', // Default to 'name'
	validationSchema,
	register = () => [],
	errors,
}: SelectOptionProps) => {
	const optionList = options.map((option, index) => (
		<option key={index} value={option.value}>
			{option[displayKey]} {/* Dynamically select the display key */}
		</option>
	));

	return (
		<div>
			{label ? (
				<label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
					{label}
					{required && '*'}
				</label>
			) : null}
			<select
				className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
				id={id}
				name={name}
				disabled={disabled}
				defaultValue={defaultValue}
				value={value}
				onChange={onChange}
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

export default SelectOption;
