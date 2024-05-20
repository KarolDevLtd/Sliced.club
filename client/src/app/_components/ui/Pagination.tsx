import React from 'react';

type PaginationProps = {
	currentPage: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) => {
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	const handlePrevious = () => {
		if (currentPage > 0) {
			onPageChange(currentPage - 1);
		}
	};

	const handleNext = () => {
		if (currentPage < totalPages - 1) {
			onPageChange(currentPage + 1);
		}
	};

	return (
		<div className="flex justify-center items-center mt-4">
			<button onClick={handlePrevious} disabled={currentPage === 0} className="mx-2">
				Previous
			</button>
			<span>
				Page {currentPage + 1} of {totalPages}
			</span>
			<button onClick={handleNext} disabled={currentPage === totalPages - 1} className="mx-2">
				Next
			</button>
		</div>
	);
};

export default Pagination;
