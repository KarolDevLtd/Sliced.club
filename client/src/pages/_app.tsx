import type { AppProps } from "next/app";

export default function SlicedApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
