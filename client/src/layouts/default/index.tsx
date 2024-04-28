import { UserStoreStatus } from '~/app/_components/temp-user-store-status';
import Providers from '~/providers';
import RootLayout from '..';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
	return (
		<RootLayout>
			<Providers>
				<UserStoreStatus />
				<div className="container py-6 min-h-screen flex flex-col">{children}</div>
			</Providers>
		</RootLayout>
	);
}
