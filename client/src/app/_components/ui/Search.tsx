import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { FaSliders } from 'react-icons/fa6';
import TextInput from './TextInput';
import Dropdown from './Dropdown';
import SelectOption from './SelectOption';
import { ProductCategoryOptions } from '@/models/product-category-options';
import BasicButton from './BasicButton';

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
						{/* <a>Price Range</a> */}
						<div className="p-1">
							<TextInput
								label={'Min'}
								id={'min'}
								name={'min'}
								type={'number'}
								placeholder="Min"
								required={false}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {}}
								width="w-3/4"
							/>
						</div>
						<div className="p-1">
							<TextInput
								label={'Max'}
								id={'max'}
								name={'max'}
								type={'number'}
								placeholder="Max"
								required={false}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {}}
								width="w-3/4"
							/>
						</div>
					</li>
					<li>
						{/* <a>Category</a> */}
						<SelectOption
							id="product-category"
							name="product-category"
							placeholder="Category"
							defaultValue=""
							options={ProductCategoryOptions}
							width={'w-full'}
						/>
					</li>
					<BasicButton type={'neutral'}>Clear</BasicButton>
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
