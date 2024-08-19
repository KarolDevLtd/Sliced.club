//Pagination (Firebase & Pinata)
//Search
//Filter
//URL builder
export const defaultPageLimit = 7;
export const maxRecordNumber = 999;
export const defaultPageOffset = 0;
export const defaultStatus = 'pinned';

interface URLBuilderProps {
	creatorKey: string | null | undefined;
	type: string;
	pageLimit?: number;
	status?: string;
	searchValue?: string | null | undefined;
}

export const URLBuilder = ({ creatorKey, type, pageLimit, status, searchValue }: URLBuilderProps) => {
	// if (creatorKey !== null && creatorKey !== '')
	// 	return `https://api.pinata.cloud/data/pinList?status=${status ?? defaultStatus}&metadata[keyvalues]={"type":{"value":"${type}","op":"eq"},"creatorKey":{"value":"${creatorKey}","op":"eq"}}&pageLimit=${pageLimit ?? defaultPageLimit}&includeCount=true`;
	// else
	if (searchValue) {
		console.log('here');
		return `https://api.pinata.cloud/data/pinList?status=${status ?? defaultStatus}&metadata[keyvalues]={"type":"productName":{"value":"${searchValue}%","op":"iLike"}}&pageLimit=${pageLimit ?? defaultPageLimit}&includeCount=true`;
	} else
		return `https://api.pinata.cloud/data/pinList?status=${status ?? defaultStatus}&metadata[keyvalues]={"type":{"value":"${type}","op":"eq"}}&pageLimit=${pageLimit ?? defaultPageLimit}&includeCount=true`;
};
