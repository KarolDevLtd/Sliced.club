/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react/jsx-no-undef */
import React, { useState } from 'react';
import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

type DragDropProps = {
	images: File[];
	setImages: (any) => void;
};

const DragDrop = ({ images, setImages }: DragDropProps) => {
	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const files = Array.from(event.dataTransfer.files);
		handleFiles(files);
	};

	const handleFiles = (files: File[]) => {
		const validFiles = files.filter((file) => file.type === 'image/jpeg' || file.type === 'image/png');
		const remainingSlots = 3 - images.length;
		const newImages = validFiles.slice(0, remainingSlots);
		setImages((prevImages) => [...prevImages, ...newImages]);
	};

	//SP - Leaving here in case wish to add back button at later date
	// const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	// 	const files = Array.from(event.target.files);
	// 	handleFiles(files);
	// };

	const removeImage = (index: number) => {
		const updatedImages = [...images];
		updatedImages.splice(index, 1);
		setImages(updatedImages);
	};

	const removeImagePreview = (file: File) => {
		const updatedImages = images.filter((image) => image !== file);
		setImages(updatedImages);
	};

	return (
		<div className="w-full" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
			{/*Option to add in input below
             <input
				type="file"
				accept="image/jpeg,image/png"
				multiple
				className="display-none"
				onChange={handleFileInputChange}
			/> */}
			<label className="flex justify-center">Drag & Drop to Upload (max 3 images)</label>
			<div className="flex">
				{images.map((image, index) => (
					<div key={index}>
						<Zoom>
							<Image src={URL.createObjectURL(image)} alt={`Preview ${index}`} width={100} height={100} />
						</Zoom>
						<button
							className="flex justtify-center"
							onClick={() => {
								removeImagePreview(image);
								removeImage(index);
							}}
						>
							Remove
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default DragDrop;
