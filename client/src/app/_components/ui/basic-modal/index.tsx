/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { IoIosClose } from 'react-icons/io';

interface BasicModalProps {
	header: React.ReactNode;
	content: React.ReactNode;
	footer: React.ReactNode;
	isOpen: boolean;
	onClose: () => void;
}

export const BasicModal = ({ isOpen, onClose, header, footer, content }: BasicModalProps) => {
	const [isOverlayClicked, setIsOverlayClicked] = useState(false);

	const handleOverlayClick = () => {
		console.log('Overlay clicked');
		if (!isOverlayClicked) {
			onClose();
		}
	};

	useEffect(() => {
		handleOverlayClick;
	}, [handleOverlayClick, isOverlayClicked]);

	return (
		<>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex justify-center items-center">
					<div className="fixed inset-0 bg-black opacity-50" onClick={() => handleOverlayClick()}></div>
					<div className="relative bg-white rounded-lg p-8 w-1/3">
						<button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={onClose}>
							<IoIosClose size={30} />
						</button>
						{header}
						{content}
						{footer}
					</div>
				</div>
			)}
		</>
	);
};
