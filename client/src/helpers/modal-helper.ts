/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-ts-comment */

export const showModal = (modalId: string) => {
	// @ts-ignore
	document?.getElementById(modalId)?.showModal();
};

export const closeModal = (modalId: string) => {
	// @ts-ignore
	document?.getElementById(modalId)?.close();
};
