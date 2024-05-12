import { UserStoreStatus } from '~/app/_components/temp-user-store-status';
import Providers from '~/providers';
import RootLayout from '..';

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<RootLayout>
			<Providers>
				<UserStoreStatus />
				<div data-theme="sliced" className="container py-6 min-h-screen flex flex-col">
					{children}
				</div>
			</Providers>
		</RootLayout>
	);
};

export default DefaultLayout;
