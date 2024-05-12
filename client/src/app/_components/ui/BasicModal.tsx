/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { IoIosClose } from 'react-icons/io';

interface BasicModalProps {
	id: string;
	header?: string;
	content: React.ReactNode;
	footer?: React.ReactNode;
	onClose?: () => void;
}

const BasicModal = ({ id, header, content, footer, onClose }: BasicModalProps) => {
	/*
    To open modal: use showModal('modal-id') from modal-helper.ts
    To close modal: use closeModal('modal-id') from modal-helper.ts
    */

	return (
		<dialog id={id} className="modal">
			<div className="modal-box">
				<form id="modal-close" method="dialog">
					<button
						form="modal-close"
						className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
						onClick={onClose}
					>
						<IoIosClose />
					</button>
				</form>
				<h3 className="font-bold text-lg">{header}</h3>
				{content}
				{footer}
			</div>
		</dialog>
	);
};

export default BasicModal;
