const preventActionNotLoggedIn = (isLoggedIn: boolean | undefined) => {
	if (isLoggedIn !== true) {
		alert('You must be logged in');
		return true;
	}
	return false;
};

export { preventActionNotLoggedIn };
