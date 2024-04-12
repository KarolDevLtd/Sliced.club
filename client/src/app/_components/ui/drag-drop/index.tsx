/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import React, { useState } from 'react';
import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

type DragDropProps = {
	images: File[];
	handleSetImages: (files: any, removing: boolean) => void;
	includeButton: boolean;
};

const DragDrop = ({ images, handleSetImages, includeButton }: DragDropProps) => {
	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const files = Array.from(event.dataTransfer.files);
		handleFiles(files);
	};

	const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			const files = Array.from(event.target.files);
			if (files && files.length > 0) {
				handleFiles(files);
			}
		}
	};

	const handleFiles = (files: File[]) => {
		const validFiles = files.filter(
			(file) => file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
		);
		const remainingSlots = 3 - images.length;
		const newImages = validFiles.slice(0, remainingSlots);
		handleSetImages(newImages, false);
	};

	const removeImage = (index: number) => {
		const updatedImages = [...images];
		updatedImages.splice(index, 1);
		handleSetImages(updatedImages, true);
	};

	const removeImagePreview = (file: File) => {
		const updatedImages = images.filter((image) => image !== file);
		handleSetImages(updatedImages, true);
	};

	return (
		<div className="w-full">
			{includeButton ? (
				<div className="flex flex-col justify-center">
					<label for="files" className="form-label">
						{'Choose File '}
					</label>
					<input
						type="file"
						id="files"
						accept="image/jpeg, image/png, image/webp"
						onChange={changeHandler}
						class="hidden"
					/>
				</div>
			) : (
				<></>
			)}
			<div
				className="flex justify-center items-center h-20 bg-light-grey rounded-md m-2"
				onDrop={handleDrop}
				onDragOver={(e) => e.preventDefault()}
			>
				{images.length == 0 ? (
					<label className="flex justify-center">Drag & Drop to Upload (max 3 images)</label>
				) : (
					<></>
				)}
				<div className="flex">
					{images.map((image, index) => (
						<div key={index}>
							<Zoom>
								<Image
									src={URL.createObjectURL(image)}
									alt={`Preview ${index}`}
									width={100}
									height={100}
								/>
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
		</div>
	);
};

export default DragDrop;
