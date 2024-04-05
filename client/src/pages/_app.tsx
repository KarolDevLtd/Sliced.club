/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { AppContext, AppInitialProps, AppLayoutProps } from 'next/app';
import '../styles/globals.css';
// https://fkhadra.github.io/react-toastify/introduction
import type { NextComponentType } from 'next';
import { type ReactNode } from 'react';

const SlicedApp: NextComponentType<AppContext, AppInitialProps, AppLayoutProps> = ({
	Component,
	pageProps,
}: AppLayoutProps) => {
	const getLayout = Component.getLayout ?? ((page: ReactNode) => page);

	return getLayout(
		<>
			<Component {...pageProps} />
		</>
	);
};

export default SlicedApp;
