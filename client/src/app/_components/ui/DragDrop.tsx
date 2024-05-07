/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import React, { type Dispatch } from 'react';
import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { compressImage } from '~/helpers/image-helper';
import { toast } from 'react-toastify';
import { IoClose } from 'react-icons/io5';

type DragDropProps = {
	images: File[];
	setImages: Dispatch<File[]>;
	includeButton: boolean;
};

const DragDrop = ({ images, setImages, includeButton }: DragDropProps) => {
	const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const files = Array.from(event.dataTransfer.files);
		await handleFiles(files);
	};

	const changeHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			const files = Array.from(event.target.files);
			if (files && files.length > 0) {
				await handleFiles(files);
			}
		}
	};

	const handleSetImages = async (images: File[], removing: boolean) => {
		try {
			//on removing from previw no need to compress
			if (!removing) {
				const compressedImages = await Promise.all(
					images.map(async (file) => {
						return await compressImage(file);
					})
				);
				// Update images state with the compressed images
				setImages((prevImages) => [...prevImages, ...compressedImages]);
			} else setImages(images);
		} catch (err) {
			console.log(err);
			toast.error('Could not upload one or more of your images');
		}
	};

	const handleFiles = async (files: File[]) => {
		const validFiles = files.filter(
			(file) => file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
		);
		const remainingSlots = 3 - images.length;
		const newImages = validFiles.slice(0, remainingSlots);
		await handleSetImages(newImages, false);
	};

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
		<div className="w-full">
			{includeButton ? (
				<div className="flex flex-col justify-center">
					<label htmlFor="files" className="form-label">
						{'Choose File '}
					</label>
					<input type="file" id="files" accept="image/jpeg, image/png, image/webp" onChange={changeHandler} />
				</div>
			) : null}
			<div
				className="flex justify-center items-center h-20 bg-light-grey rounded-md m-2"
				onDrop={handleDrop}
				onDragOver={(e) => e.preventDefault()}
			>
				{images.length == 0 ? (
					<label className="flex justify-center">Drag & Drop to Upload (max 3 images)</label>
				) : null}
				<div className="flex">
					{images.map((image, index) => (
						<div key={index}>
							<div className="flex flex-col">
								<div className="cursor:pointer">
									<div
										className="bg-black text-white"
										onClick={() => {
											removeImagePreview(image);
											removeImage(index);
										}}
									>
										<IoClose />
									</div>
									<Zoom>
										<div className="w-10 h-50">
											<Image
												src={URL.createObjectURL(image)}
												alt={`Preview ${index}`}
												width={100}
												height={100}
											/>
										</div>
									</Zoom>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default DragDrop;
