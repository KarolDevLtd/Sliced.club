/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import React from 'react';

type InstalmentSliderProps = {
	participants: number;
	duration: number;
	onSlide: (number) => void;
};

const InstalmentSlider = ({ participants, duration, onSlide }: InstalmentSliderProps) => {
	const handleRangeChange = (event) => {
		const value = parseInt(event.target.value);
		onSlide(value);
	};

	return (
		<div className="w-80 mx-auto">
			<div className="m-3"></div>
			<div>{`Participants: ${participants}`}</div>
			<div>{`Duration: ${duration} (months)`}</div>
			<input
				className="range"
				type="range"
				min="6"
				max="48"
				defaultValue={duration}
				onChange={handleRangeChange}
			/>
		</div>
	);
};

export default InstalmentSlider;
