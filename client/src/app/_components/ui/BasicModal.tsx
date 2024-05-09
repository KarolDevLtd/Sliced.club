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
    To open modal: onClick={()=>document.getElementById('modal-id').showModal()}
    To close modal: onClick={()=>document.getElementById('modal-id').close()}
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
				<form id="modal-backdrop" method="dialog" className="modal-backdrop">
					<button form="modal-backdrop" onClick={onClose}>
						close
					</button>
				</form>
			</div>
		</dialog>
	);
};

export default BasicModal;
