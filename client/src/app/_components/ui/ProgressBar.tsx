import React from 'react';

type ProgressBarProps = {
	progress: number;
};

const ProgressBar = ({ progress = 100 }: ProgressBarProps) => {
	return (
		<div className="block min-w-full h-[2px]">
			<div className={`min-h-full bg-dark-grey`} style={{ width: `${progress}%` }}></div>
		</div>
	);
};

export default ProgressBar;
