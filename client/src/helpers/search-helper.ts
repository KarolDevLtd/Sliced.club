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
}

export const URLBuilder = ({ creatorKey, type, pageLimit, status, searchValue }: URLBuilderParams): string => {
	let metadataParams = '';
	if (searchValue && type == 'group') {
		//if search value and on group page
		const encodedSearchValue = encodeURIComponent(searchValue + '%');
		metadataParams = `metadata[keyvalues]={"type":{"value":"${type}","op":"eq"},"creatorKey":{"value":"${creatorKey}","op":"eq"},"productName":{"value":"${encodedSearchValue}","op":"iLike"}}&`;
	} else {
		metadataParams = `metadata[keyvalues]={"type":{"value":"${type}","op":"eq"},"creatorKey":{"value":"${creatorKey}","op":"eq"}}&`;
	}
	return `https://api.pinata.cloud/data/pinList?status=${status ?? defaultStatus}&${metadataParams}pageLimit=${pageLimit ?? defaultPageLimit}&includeCount=true`;
};
