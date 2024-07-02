import { useState } from 'react';
import ZoomableImage from './ZoomableImage';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

type CCarouselProps = {
	images: string[];
};

const CCarousel = ({ images }: CCarouselProps) => {
	const [currentIndex, setCurrentIndex] = useState<number>(0);

	const handlePrev = () => {
		setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
	};

	const handleNext = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
	};

	const handleThumbnailClick = (index: number) => {
		setCurrentIndex(index);
	};

	return (
		<div className="flex flex-col items-center">
			<div className="relative h-60 flex items-center">
				<ZoomableImage source={images[currentIndex]} alt={`Slide ${currentIndex}`} height={400} width={400} />
			</div>
			<div className="flex">
				<button
					className="bg-accent border text-white p-2 rounded-xl focus:outline-none mt-5 mx-2 "
					onClick={handlePrev}
				>
					<FaChevronLeft />
				</button>
				<div className="flex justify-center mt-4 space-x-2">
					{images.map((image, index) => (
						<Image
							key={index}
							src={image}
							alt={`Thumbnail ${index}`}
							className={`rounded-lg cursor-pointer ${currentIndex === index ? 'border-4 border-blue-500' : ''}`}
							onClick={() => handleThumbnailClick(index)}
							height={0}
							width={100}
						/>
					))}
				</div>
				<button
					className="bg-accent border text-white p-2 rounded-xl focus:outline-none mt-5 mx-2"
					onClick={handleNext}
				>
					<FaChevronRight />
				</button>
			</div>
		</div>
	);
};

export default CCarousel;
