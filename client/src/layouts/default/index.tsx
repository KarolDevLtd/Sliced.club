import { Bounce, ToastContainer } from 'react-toastify';
import { Navbar } from '~/app/_components/global/Navbar';
import { UserStoreStatus } from '~/app/_components/temp-user-store-status';
import Providers from '~/providers';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Providers>
				<UserStoreStatus />
				<ToastContainer
					position="bottom-right"
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
					transition={Bounce}
				/>
				<Navbar />
				<div className="container pt-28 pb-6 min-h-screen flex flex-col">{children}</div>
			</Providers>
		</>
	);
}
