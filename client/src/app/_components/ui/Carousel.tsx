import React from 'react';

type CarouselProps = {
	slides: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		content: any;
	}[];
	options: {
		visibleSlides: number;
		height: number;
	};
};

const Carousel = ({ slides, options = { visibleSlides: 1, height: 150 } }: CarouselProps) => {
	return (
		<div className="carousel carousel-center min-w-full space-x-4">
			{slides.map((slide, index) => {
				return (
					<div
						id={`item${index + 1}`}
						key={`item${index + 1}`}
						className={`carousel-item ${options.visibleSlides === 1 ? 'w-full' : `w-1/${options.visibleSlides}`} h-[${options.height}px] rounded border border-neutral`}
					>
						{slide.content}
					</div>
				);
			})}
		</div>
	);
};
export default Carousel;
