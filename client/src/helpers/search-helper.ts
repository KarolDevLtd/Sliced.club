//Pagination (Firebase & Pinata)
//Search
//Filter
//URL builder
export const defaultPageLimit = 1;
export const defaultPageOffset = 0;
export const defaultStatus = 'pinned';
export const URLBuilder = (creatorKey: string, pageLimit?: number, pageOffset?: number, status?: string) => {
	return `https://api.pinata.cloud/data/pinList?status=${status ?? defaultStatus}&metadata[keyvalues]={"type":{"value":"product","op":"eq"},"creatorKey":{"value":"${creatorKey}","op":"eq"}}&pageLimit=${pageLimit ?? defaultPageLimit}&pageOffset=${pageOffset ?? defaultPageOffset}&includeCount=true`;
};
