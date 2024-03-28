import React from 'react';

type TextInputProps = {
	label: string;
	placeholder: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onChange?: (e: any) => any;
	disabled?: boolean;
};

export const TextInput = ({ label, placeholder, onChange, disabled }: TextInputProps) => {
	return (
		<div className="m-2">
			{label ? <label>{label}</label> : null}
			<input
				type="text"
				placeholder={placeholder}
				onChange={onChange}
				disabled={disabled}
				className="w-full border-solid border-2 border-indigo-600"
			></input>
		</div>
	);
};
