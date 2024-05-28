/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import imageCompression from 'browser-image-compression';

// hash for sliced default image
const defaultImageHash = 'QmTdpE5ZdBTnnragH1mGjgJBcoDWYxhJc59VMMgYwHc3MV';

const options = {
	maxSizeMB: 1,
	maxWidthOrHeight: 1920,
	useWebWorker: true,
};

const compressImage = async (imageFile: File): Promise<File> => {
	// console.log('originalFile instanceof Blob', imageFile instanceof Blob);
	// console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);
	const compressedFile = await imageCompression(imageFile, options);
	// console.log('compressedFile instanceof Blob', compressedFile instanceof Blob);
	// console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // ensure smaller than maxSizeMB

	return compressedFile;
};

const saveImages = async (images: File[]) => {
	const imgArr: Response[] = [];
	for (const element of images) {
		const body = new FormData();
		body.set('file', element);
		const response = await fetch('/api/upload', {
			method: 'POST',
			body,
		});
		if (!response.ok) {
			throw new Error('Error uploading profile image');
		}
		const result: Response = await response.json();
		if (!result) throw new Error('Error uploading profile image');
		imgArr.push(result);
	}
	return imgArr;
};

//Gets image hashes and info
const fetchImageData = async (data, setHasImage, setImageData, setImageError) => {
	try {
		if (data) {
			if (data.imageHash!.length > 0) {
				setHasImage(true);
				if (Array.isArray(data.imageHash)) {
					await Promise.all(
						data.imageHash.map(async (element: string) => {
							await fetchImages(element, data.imageHash, setImageData, setImageError);
						})
					);
				}
			}
		}
	} catch (err) {
		console.log(err);
	}
};

//Gets images themselves
const fetchImages = async (imageHash: string, imageHashes, setImageData, setImageError) => {
	try {
		const response = await fetch(`/api/upload?imageHash=${imageHash}`);
		if (response.ok) {
			const blob = await response.blob();
			const imageUrl = URL.createObjectURL(blob);
			//Below used to render images in the order they were uploaded to db...
			// Find the index of the current imageHash in the imageHashes array
			const index = imageHashes.indexOf(imageHash);
			if (index !== -1) {
				// Update the state at the corresponding index
				setImageData((prevImageData) => {
					const newData = [...prevImageData];
					newData[index] = imageUrl;
					return newData;
				});
			} else {
				console.log('Image hash not found in imageHashes array');
			}
		} else {
			console.log('Error fetching image');
			setImageError(true);
		}
	} catch (err) {
		console.log(err);
	}
};

export { compressImage, saveImages, fetchImageData, defaultImageHash };
