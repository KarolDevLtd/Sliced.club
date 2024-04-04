import { Navbar } from '~/app/_components/global/Navbar';
import { UserStoreStatus } from '~/app/_components/temp-user-store-status';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<UserStoreStatus />
			<Navbar />
			<div className="container pt-28 pb-6 min-h-screen flex flex-col">{children}</div>
		</>
	);
}
