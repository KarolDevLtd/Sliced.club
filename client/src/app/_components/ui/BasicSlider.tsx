type BasicSliderProps = {
	defaultValue: number;
	maxValue: number;
	minValue: number;
	onSlide: (number) => void;
	isReversed: boolean;
};

const BasicSlider = ({ defaultValue, maxValue, minValue, onSlide, isReversed }: BasicSliderProps) => {
	return (
		<input
			className={`range ${isReversed ? 'transform rotate-180' : null}`}
			type="range"
			min={minValue}
			max={maxValue}
			defaultValue={defaultValue}
			onChange={onSlide}
		/>
	);
};

export default BasicSlider;
