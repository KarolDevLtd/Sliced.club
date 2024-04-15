import { useCallback, useState } from 'react';
import { Controlled as ControlledZoom } from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import Image from 'next/image';

type ZoomableImageProps = {
	source: string;
	width: number;
	height: number;
	alt: string;
};

const ZoomableImage = ({ source, width, height, alt }: ZoomableImageProps) => {
	const [isZoomed, setIsZoomed] = useState<boolean>(false);

	const handleZoomChange = useCallback((shouldZoom: boolean | ((prevState: boolean) => boolean)) => {
		setIsZoomed(shouldZoom);
	}, []);

	return (
		<div className="w-3/4">
			<ControlledZoom isZoomed={isZoomed} onZoomChange={handleZoomChange}>
				<Image src={source} width={width} height={height} alt={alt} />
			</ControlledZoom>
		</div>
	);
};
export default ZoomableImage;
