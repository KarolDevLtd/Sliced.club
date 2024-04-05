import type { AppProps } from 'next/app';
import Layout from '~/pages/layout';
import Providers from '~/providers';
import '../styles/globals.css';
// https://fkhadra.github.io/react-toastify/introduction
import { Bounce, ToastContainer } from 'react-toastify';

export default function SlicedApp({ Component, pageProps }: AppProps) {
	return (
		<Providers>
			<Layout>
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
				<Component {...pageProps} />
			</Layout>
		</Providers>
	);
}
