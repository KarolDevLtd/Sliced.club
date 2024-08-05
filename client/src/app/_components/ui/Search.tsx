import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { FaSliders } from 'react-icons/fa6';
import TextInput from './TextInput';

const Search = () => {
	const [hasFilters, setHasFilters] = useState<boolean>(false);
	const [hasSearch, setHasSearch] = useState<boolean>(false);
	const [displaySearchBar, setDisplaySearchBar] = useState<boolean>(false);
	return (
		<div className="flex">
			<div className="dropdown dropdown-click dropdown-end">
				<div tabIndex={0} role="button" className="p-0 flex items-center">
					<div
						className={`bg-${hasSearch ? `brightwhite` : `itemfade`} border-accent p-3 border rounded-xl text-xl cursor-pointer m-1`}
					>
						{<FaSliders />}
					</div>
				</div>
				<ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
					<li>
						<a>Price Range</a>
						<TextInput id={'price-range-min'} name={'price-range-min'} type={'number'} />
						<TextInput id={'price-range-max'} name={'price-range-max'} type={'number'} />
					</li>
					<li>
						<a>Category</a>
					</li>
				</ul>
			</div>
			{displaySearchBar && <TextInput id={'group-list-search'} name={'group-list-search'} type={'text'} />}
			<div
				className={`bg-${displaySearchBar ? `brightwhite` : `itemfade`} border-accent p-3 border rounded-xl text-xl cursor-pointer m-1`}
				onClick={() => setDisplaySearchBar(!displaySearchBar)}
			>
				{<FaSearch />}
			</div>
		</div>
	);
};

export default Search;
