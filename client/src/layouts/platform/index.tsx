import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { PlatformSidebar } from '~/app/_components/global/platform-sidebar';
import { UserStoreStatus } from '~/app/_components/temp-user-store-status';
import Providers from '~/providers';
import RootLayout from '..';

import { GiHamburgerMenu } from 'react-icons/gi';
import { IoIosClose } from 'react-icons/io';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	const [showNav, setShowNav] = useState(false);

	useEffect(() => {
		setShowNav(false);
	}, [pathname]);

	return (
		<RootLayout>
			<Providers>
				<UserStoreStatus />
				<div className="min-h-screen max-h-screen min-w-screen relative flex">
					<div className="absolute p-2 right-0 z-50 sm:hidden text-4xl">
						{showNav ? (
							<IoIosClose onClick={() => setShowNav(false)} />
						) : (
							<GiHamburgerMenu onClick={() => setShowNav(true)} />
						)}
					</div>
					<PlatformSidebar hidden={!showNav} />
					<main className="p-6 ms-0 w-full sm:ms-auto sm:w-3/4 md:w-4/5 lg:w-5/6 flex flex-col gap-4 min-h-full max-h-full">
						{children}
					</main>
				</div>
			</Providers>
		</RootLayout>
	);
}
