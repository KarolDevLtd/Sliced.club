import React from 'react';
import ReactPaginate from 'react-paginate';
import { BsChevronRight, BsChevronLeft } from 'react-icons/bs';

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
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				padding: 20,
				boxSizing: 'border-box',
				width: '100%',
				height: '100%',
			}}
		>
			<ReactPaginate
				breakLabel="..."
				nextLabel={
					<span className="w-10 h-10 flex items-center justify-center bg-light-gray rounded-md">
						<BsChevronRight />
					</span>
				}
				onPageChange={handlePageClick}
				pageRangeDisplayed={5}
				pageCount={pageCount}
				previousLabel={
					<span className="w-10 h-10 flex items-center justify-center bg-light-gray rounded-md">
						<BsChevronLeft />
					</span>
				}
				renderOnZeroPageCount={null}
				containerClassName="flex items-center justify-center mt-8"
				pageClassName="block border- border-solid mx-4"
				activeClassName="active"
				forcePage={currentPage}
			/>
		</div>
	);
};

export default Pagination;
