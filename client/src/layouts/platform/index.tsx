import { Bounce, ToastContainer } from 'react-toastify';
import { UserStoreStatus } from '~/app/_components/temp-user-store-status';
import Providers from '~/providers';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
	return (
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
			<div className="container pt-28 pb-6 min-h-screen flex">
				<div className="flex flex-col w-1/4">
					<p>a</p>
					<p>b</p>
					<p>c</p>
					<p>d</p>
					<p>e</p>
					<p>f</p>
				</div>
				<div>{children}</div>
			</div>
		</Providers>
	);
}
