import type { AppProps } from 'next/app';
import Providers from '~/providers';

export default function SlicedApp({ Component, pageProps }: AppProps) {
	return (
		<Providers>
			<Component {...pageProps} />
		</Providers>
	);
}
