import { Navbar } from '~/app/_components/global/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			<div className="container pt-28 pb-6 min-h-screen flex flex-col">{children}</div>
		</>
	);
}
