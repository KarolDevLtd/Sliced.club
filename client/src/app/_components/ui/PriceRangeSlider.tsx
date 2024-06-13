/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { useState } from 'react';
import { Range, getTrackBackground } from 'react-range';

type InstalmentSliderProps = {
	minValue: number;
	maxValue: number;
	onSlide: (values: number[]) => void;
};

const PriceRangeSlider = ({ minValue, maxValue, onSlide }: InstalmentSliderProps) => {
	const [values, setValues] = useState([]);

	const handleRangeChange = (values: number[]) => {
		console.log(`HEllo`);
	};

	return (
		<div className="w-80 mx-auto p-4 bg-white shadow-lg rounded-lg">
			<Range
				values={values}
				step={1}
				min={6}
				max={48}
				onChange={handleRangeChange}
				renderTrack={({ props, children }) => (
					<div
						{...props}
						className="h-2 w-full rounded-lg bg-gray-300"
						style={{
							background: getTrackBackground({
								values,
								colors: ['#ccc', '#3b82f6', '#ccc'],
								min: minValue,
								max: maxValue,
							}),
						}}
					>
						{children}
					</div>
				)}
				renderThumb={({ props, isDragged }) => (
					<div
						{...props}
						className={`h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center ${
							isDragged ? 'border-2 border-blue-500' : ''
						}`}
					>
						<div className="h-3 w-1 bg-blue-500" />
					</div>
				)}
			/>
		</div>
	);
};

export default PriceRangeSlider;
