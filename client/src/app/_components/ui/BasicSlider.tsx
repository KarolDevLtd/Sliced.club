import React from 'react';

type BasicSliderProps = {
	defaultValue: number;
	maxValue: number;
	minValue: number;
	onSlide: (event: React.ChangeEvent<HTMLInputElement>) => void;
	isReversed: boolean;
};

const BasicSlider = ({ defaultValue, maxValue, minValue, onSlide, isReversed }: BasicSliderProps) => {
	return (
		<input
			className={`range ${isReversed ? 'transform rotate-180' : ''}`}
			type="range"
			min={minValue}
			max={maxValue}
			defaultValue={defaultValue}
			onChange={onSlide}
		/>
	);
};

export default BasicSlider;
