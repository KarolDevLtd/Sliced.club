export const formatDate = (date: Date) => {
	return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'numeric', day: 'numeric' });
};
