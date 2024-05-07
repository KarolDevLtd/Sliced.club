/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { IoIosClose } from 'react-icons/io';

interface BasicModalProps {
	header: React.ReactNode;
	content: React.ReactNode;
	footer?: React.ReactNode;
	isOpen: boolean;
	onClose: () => void;
}

const BasicModal = ({ isOpen, onClose, header, footer, content }: BasicModalProps) => {
	const [isOverlayClicked, setIsOverlayClicked] = useState(false);

	const handleOverlayClick = () => {
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
					<div className="relative bg-white rounded-lg p-8 lg:w-1/2 md:w-2/3 flex flex-col gap-4">
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

export default BasicModal;
