// https://fkhadra.github.io/react-toastify/introduction
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const preventActionNotLoggedIn = (isLoggedIn: boolean | undefined, customMessage?: string) => {
	const message = customMessage ? customMessage : "You're not logged in";

	if (!isLoggedIn) {
		toast.error(message);
		return true;
	}
	return false;
};

const preventActionWalletNotConnected = (walletConnected: boolean | undefined, customMessage?: string) => {
	const message = customMessage ? customMessage : 'Wallet not connected';

	if (!walletConnected) {
		toast.error(message);
		return true;
	}
	return false;
};

export { preventActionNotLoggedIn, preventActionWalletNotConnected };
