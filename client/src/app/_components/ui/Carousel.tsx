import React, { useState } from 'react';

import { IoIosArrowBack } from 'react-icons/io';
import { IoIosArrowForward } from 'react-icons/io';

type CarouselProps = {
	slides: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		content: any;
	}[];
	options?: {
		showSlideNumber?: boolean;
	};
};

const Carousel = ({ slides, options = { showSlideNumber: false } }: CarouselProps) => {
	const [activeIndex, setActiveIndex] = useState(0);

	const nextSlide = () => {
		setActiveIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
	};

	const prevSlide = () => {
		setActiveIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
	};

	return (
		<div className="flex flex-col gap-2 min-h-full">
			<div className="flex-1 bg-light-grey rounded-md p-4 flex flex-col justify-center gap-1">
				{slides[activeIndex]?.content}
			</div>
			<div className="flex justify-end gap-2">
				<button
					className="bg-light-grey hover:bg-medium-grey p-2 w-8 h-8 rounded-sm border border-black flex justify-center items-center text-center"
					onClick={prevSlide}
				>
					<IoIosArrowBack />
				</button>
				{options.showSlideNumber ? <p>{activeIndex + 1}</p> : null}
				<button
					className="bg-light-grey hover:bg-medium-grey p-2 w-8 h-8 rounded-sm border border-black flex justify-center items-center text-center"
					onClick={nextSlide}
				>
					<IoIosArrowForward />
				</button>
			</div>
		</div>
	);
};
export default Carousel;
