import React from 'react';
import ReactPaginate from 'react-paginate';

type PaginationProps = {
	currentPage: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) => {
	const pageCount = Math.ceil(totalItems / itemsPerPage);

	const handlePageClick = (event: { selected: number }) => {
		onPageChange(event.selected);
	};

	return (
		<div className="flex justify-center items-center mt-4">
			<ReactPaginate
				breakLabel="..."
				nextLabel="next >"
				onPageChange={handlePageClick}
				pageRangeDisplayed={5}
				pageCount={pageCount}
				previousLabel="< previous"
				renderOnZeroPageCount={null}
				containerClassName="pagination"
				activeClassName="active"
				forcePage={currentPage}
			/>
		</div>
	);
};

export default Pagination;
