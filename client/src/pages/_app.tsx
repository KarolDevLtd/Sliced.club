import type { AppProps } from 'next/app';
import Layout from '~/pages/layout';
import Providers from '~/providers';

export default function SlicedApp({ Component, pageProps }: AppProps) {
	return (
		<Providers>
			<Layout>
				<Component {...pageProps} />
			</Layout>
		</Providers>
	);
}
