import { Navbar } from '~/app/_components/global/Navbar';
import { UserStoreStatus } from '~/app/_components/temp-user-store-status';
import Providers from '~/providers';
import RootLayout from '..';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
	return (
		<RootLayout>
			<Providers>
				<UserStoreStatus />
				<Navbar />
				<div className="container pt-28 pb-6 min-h-screen flex flex-col">{children}</div>
			</Providers>
		</RootLayout>
	);
}
