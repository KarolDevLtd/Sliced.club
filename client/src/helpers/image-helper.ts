/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import imageCompression from 'browser-image-compression';

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

export { compressImage, saveImages };
