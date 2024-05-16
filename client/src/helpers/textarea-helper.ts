import { useEffect } from 'react';

// Updates the height of a <textarea> when the value changes.
/* //https:medium.com/@oherterich/creating-a-textarea-with-dynamic-height-using-react-and-typescript-5ed2d78d9848 */
export const useAutosizeTextArea = (textAreaRef: HTMLTextAreaElement | null, value: string, enableEffect: boolean) => {
	useEffect(() => {
		if (textAreaRef && enableEffect) {
			// We need to reset the height momentarily to get the correct scrollHeight for the textarea
			textAreaRef.style.height = '0px';
			const scrollHeight = textAreaRef.scrollHeight;

			// We then set the height directly, outside of the render loop
			// Trying to set this with state or a ref will product an incorrect value.
			textAreaRef.style.height = scrollHeight + 'px';
		}
	}, [enableEffect, textAreaRef, value]);
};
