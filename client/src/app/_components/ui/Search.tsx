import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { FaSliders } from 'react-icons/fa6';
import TextInput from './TextInput';
import SelectOption from './SelectOption';
import { ProductCategoryOptions } from '@/models/product-category-options';
import BasicButton from './BasicButton';
import { RxCross2 } from 'react-icons/rx';

type SearchProps = {
	searchValue: string;
	setSearchValue: (value: string) => void;
	searchCategory: string;
	setSearchCategory: (value: string) => void;
	searchMaxPrice: string;
	setSearchMaxPrice: (value: string) => void;
	searchMinPrice: string;
	setSearchMinPrice: (value: string) => void;
};

const Search = ({
	searchValue,
	setSearchValue,
	searchCategory,
	setSearchCategory,
	searchMaxPrice,
	setSearchMaxPrice,
	searchMinPrice,
	setSearchMinPrice,
}: SearchProps) => {
	const [displaySearchBar, setDisplaySearchBar] = useState<boolean>(false);

	const handleClear = () => {
		setSearchCategory('');
		setSearchMinPrice('');
		setSearchMaxPrice('');
	};

	const clearSearch = () => {
		setSearchValue('');
	};

	return (
		<div className="flex">
			<div className="dropdown dropdown-click dropdown-end">
				<div tabIndex={0} role="button" className="p-0 flex items-center">
					<div
						className={`bg-${searchCategory != '' || searchMinPrice != '' || searchMaxPrice != '' ? `brightwhite` : `itemfade`} border-accent p-3 border rounded-xl text-xl cursor-pointer m-1`}
					>
						{<FaSliders />}
					</div>
				</div>
				<ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
					<div className="p-1">
						<TextInput
							label={'Min'}
							id={'min'}
							name={'min'}
							type={'number'}
							placeholder="Min"
							required={false}
							value={searchMinPrice}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setSearchMinPrice(e.target.value);
							}}
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
							value={searchMaxPrice}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setSearchMaxPrice(e.target.value);
							}}
							width="w-3/4"
						/>
					</div>

					<div className="p-1">
						<SelectOption
							id="product-category"
							name="product-category"
							placeholder="Category"
							defaultValue={undefined}
							value={searchCategory}
							options={ProductCategoryOptions}
							width={'w-full'}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
								setSearchCategory(e.target.value);
							}}
						/>
					</div>
					<BasicButton
						type={'neutral'}
						onClick={() => {
							handleClear();
						}}
					>
						Clear
					</BasicButton>
				</ul>
			</div>
			{displaySearchBar && (
				<TextInput
					id={'group-list-search'}
					name={'group-list-search'}
					type={'text'}
					value={searchValue}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setSearchValue(e.target.value);
					}}
					icon={<RxCross2 />}
					iconClick={clearSearch}
				/>
			)}
			<div
				className={`bg-${searchValue ? `brightwhite` : `itemfade`} border-accent p-3 border rounded-xl text-xl cursor-pointer m-1`}
				onClick={() => setDisplaySearchBar(!displaySearchBar)}
			>
				{<FaSearch />}
			</div>
		</div>
	);
};

export default Search;
