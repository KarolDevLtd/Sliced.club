//Pagination (Firebase & Pinata)
//Search
//Filter
//URL builder
export const defaultPageLimit = 3;
export const defaultPageOffset = 0;
export const defaultStatus = 'pinned';
export const URLBuilder = (creatorKey: string | null, type: string, pageLimit?: number, status?: string) => {
	if (creatorKey !== null && creatorKey !== '')
		return `https://api.pinata.cloud/data/pinList?status=${status ?? defaultStatus}&metadata[keyvalues]={"type":{"value":"${type}","op":"eq"},"creatorKey":{"value":"${creatorKey}","op":"eq"}}&pageLimit=${pageLimit ?? defaultPageLimit}&includeCount=true`;
	else
		return `https://api.pinata.cloud/data/pinList?status=${status ?? defaultStatus}&metadata[keyvalues]={"type":{"value":"${type}","op":"eq"}}&pageLimit=${pageLimit ?? defaultPageLimit}&includeCount=true`;
};
