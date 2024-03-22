import { Navbar } from '~/app/_components/navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			<div>{children}</div>
		</>
	);
}
