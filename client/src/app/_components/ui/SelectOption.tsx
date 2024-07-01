/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react';

type SelectOptionProps = {
	type?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'ghost';
	size?: 'xs' | 'sm' | 'md' | 'lg';
	id: string;
	name: string;
	label?: string;
	altLabel1?: string;
	altLabel2?: string;
	altLabel3?: string;
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
	type,
	size,
	id,
	name,
	label,
	altLabel1,
	altLabel2,
	altLabel3,
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

	const optionList = options.map((option, index) => (
		<option key={index} value={option.value}>
			{option[displayKey]} {/* Dynamically select the display key */}
		</option>
	));

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (onChange) {
			onChange(e);
		}
	};

	return (
		<>
			<label htmlFor={id} className="form-control w-full max-w-xs">
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
				<select
					className={`select select-bordered ${type && colourMap[type]} ${size && sizeMap[size]}  ${errors && 'select-error'}`}
					id={id}
					name={name}
					disabled={disabled}
					defaultValue={defaultValue}
					value={value}
					onChange={onChange}
					{...register(name, {
						...validationSchema,
						onChange: (e) => {
							handleChange(e);
						},
					})}
				>
					{placeholder ? (
						<option value="" disabled>
							{placeholder}
							{required && '*'}
						</option>
					) : null}
					{optionList}
				</select>
				{altLabel2 ?? altLabel3 ? (
					<div className="label">
						{altLabel2 ? <span className="label-text-alt">{altLabel2}</span> : null}
						{altLabel3 ? <span className="label-text-alt">{altLabel3}</span> : null}
					</div>
				) : null}
				{errors && errors[name]?.type === 'required' && (
					<p className="mt-1 text-xs text-red-error">{errors[name]?.message}</p>
				)}
			</label>
		</>
	);
};

export default SelectOption;
