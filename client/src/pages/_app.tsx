import type { AppContext, AppInitialProps, AppLayoutProps } from 'next/app';
import '../styles/globals.css';
// https://fkhadra.github.io/react-toastify/introduction
import type { NextComponentType } from 'next';
import { type ReactNode, type ReactElement } from 'react';

const SlicedApp: NextComponentType<AppContext, AppInitialProps, AppLayoutProps> = ({
	Component,
	pageProps,
}: AppLayoutProps) => {
	const getLayout: (page: ReactNode) => ReactElement =
		Component.getLayout ?? ((page: ReactNode) => page as ReactElement);

	return getLayout(
		<>
			<link rel="icon" href="/favicon.ico" />
			<Component {...pageProps} />
		</>
	);
};

export default SlicedApp;
