import { PlatformSidebar } from '~/app/_components/global/platform-sidebar';
import { UserStoreStatus } from '~/app/_components/temp-user-store-status';
import Providers from '~/providers';
import RootLayout from '..';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
	return (
		<RootLayout>
			<Providers>
				<UserStoreStatus />
				<div className="min-h-screen max-h-screen flex">
					<PlatformSidebar />
					<main className="flex-1 p-6">{children}</main>
				</div>
			</Providers>
		</RootLayout>
	);
}
