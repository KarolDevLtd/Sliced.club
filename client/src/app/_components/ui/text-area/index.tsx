import React from 'react';

type TextAreaProps = {
	label: string;
	placeholder: string;
	rows: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onChange?: (e: any) => any;
	disabled?: boolean;
};

export const TextArea = ({ label, placeholder, rows, onChange, disabled }: TextAreaProps) => {
	return (
		<div className="m-2">
			{label ? <label>{label}</label> : null}
			<textarea
				placeholder={placeholder}
				onChange={onChange}
				disabled={disabled}
				rows={rows}
				className="w-full border-solid border-2 border-indigo-600"
			></textarea>
		</div>
	);
};
