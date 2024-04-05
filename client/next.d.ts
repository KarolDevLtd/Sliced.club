/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import type { NextComponentType, NextPageContext, NextLayoutComponentType } from 'next';
import type { AppProps } from 'next/app';

declare module 'next' {
	type NextLayoutComponentType<P = {}> = NextComponentType<NextPageContext, any, P> & {
		getLayout?: (page: ReactNode) => ReactNode;
	};
}

declare module 'next/app' {
	type AppLayoutProps<P = {}> = AppProps & {
		Component: NextLayoutComponentType;
	};
}

export { NextComponentType };
