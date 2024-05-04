import React from 'react';

type SpinnerProps = {
	size?: 'sm' | 'md' | 'lg';
	text?: string;
};

export const Spinner = ({ text, size = 'md' }: SpinnerProps) => {
	const spinnerSizeMap = {
		sm: 'w-5 h-5',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
	};
	const textSizeMap = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-md',
	};
	const borderSizeMap = {
		sm: 'border-2',
		md: 'border-4',
		lg: 'border-8',
	};

	return (
		<div className="flex flex-col items-center gap-1 m-auto">
			<span
				className={`animate-spin ${spinnerSizeMap[size]} rounded-[50%] border-b-orange ${borderSizeMap[size]} border-white`}
			></span>
			{text ? <p className={`${textSizeMap[size]}`}>{text}</p> : null}
		</div>
	);
};
