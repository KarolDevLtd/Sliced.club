const preventActionNotLoggedIn = (isLoggedIn: boolean | undefined) => {
	if (!isLoggedIn) {
		alert('You must be logged in');
		return true;
	}
	return false;
};

const preventActionWalletNotConnected = (walletConnected: boolean | undefined) => {
	if (!walletConnected) {
		alert('You need to connect a wallet');
		return true;
	}
	return false;
};

export { preventActionNotLoggedIn, preventActionWalletNotConnected };
