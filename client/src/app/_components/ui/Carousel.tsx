import React from 'react';

type CarouselProps = {
	slides: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		content: any;
	}[];
	options: {
		visibleSlides: 1 | 2 | 3 | 4 | 5;
	};
};

const Carousel = ({ slides, options = { visibleSlides: 3 } }: CarouselProps) => {
	const visibleSlidesMapping = {
		1: 'w-full',
		2: 'w-1/2',
		3: 'w-1/3',
		4: 'w-1/4',
		5: 'w-1/5',
	};

	return (
		<div className="carousel carousel-center min-w-full space-x-4">
			{slides.map((slide, index) => {
				return (
					<div
						id={`item${index + 1}`}
						key={`item${index + 1}`}
						className={`carousel-item ${visibleSlidesMapping[options.visibleSlides]} rounded border border-neutral`}
					>
						{slide.content}
					</div>
				);
			})}
		</div>
	);
};
export default Carousel;
