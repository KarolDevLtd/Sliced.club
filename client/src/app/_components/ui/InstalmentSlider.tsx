import React from 'react';
import BasicSlider from './BasicSlider';

type InstalmentSliderProps = {
	participants: number;
	duration: number;
	onSlide: (value: number) => void;
};

const InstalmentSlider = ({ participants, duration, onSlide }: InstalmentSliderProps) => {
	const handleRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(event.target.value, 10);
		onSlide(value);
	};

	return (
		<div className="w-80 mx-auto">
			<div className="m-3"></div>
			<div>{`Participants: ${participants}`}</div>
			<div>{`Duration: ${duration} (months)`}</div>
			<BasicSlider
				defaultValue={duration}
				minValue={6}
				maxValue={48}
				onSlide={handleRangeChange}
				isReversed={false}
			/>
		</div>
	);
};

export default InstalmentSlider;
