//Pagination (Firebase & Pinata)
//Search
//Filter
//URL builder
export const defaultPageLimit = 3;
export const defaultPageOffset = 0;
export const defaultStatus = 'pinned';

interface URLBuilderParams {
	creatorKey: string;
	type: string;
	pageLimit?: number;
	status?: string;
	searchValue?: string | null;
	searchCategory?: string | null;
	searchMaxPrice?: string | null;
	searchMinPrice?: string | null;
}

export const URLBuilder = ({
	creatorKey,
	type,
	pageLimit,
	status,
	searchValue,
	searchCategory,
	searchMinPrice,
	searchMaxPrice,
}: URLBuilderParams): string => {
	let filterParams = '';
	if (type == 'group') {
		if (searchValue) {
			//if search value and on group page
			const encodedSearchValue = encodeURIComponent(searchValue + '%');
			filterParams += `,"productName":{"value":"${encodedSearchValue}","op":"iLike"}`;
		}
		if (searchMinPrice && searchMaxPrice) {
			filterParams += `,"productPrice":{"value":${searchMinPrice},"secondValue":${searchMaxPrice},"op":"between"}`;
		}
	}
	const metadataParams = `metadata[keyvalues]={"type":{"value":"${type}","op":"eq"},"creatorKey":{"value":"${creatorKey}","op":"eq"}${filterParams}}&`;
	return `https://api.pinata.cloud/data/pinList?status=${status ?? defaultStatus}&${metadataParams}pageLimit=${pageLimit ?? defaultPageLimit}&includeCount=true`;
};
