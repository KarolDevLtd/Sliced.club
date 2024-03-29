import { Navbar } from '~/app/_components/global/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			<div className="container py-6">{children}</div>
		</>
	);
}
