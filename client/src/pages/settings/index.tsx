import { MinaButton } from '~/app/_components/ui/mina-button';
import PlatformLayout from '~/layouts/platform';
import { useWallet } from '~/providers/walletprovider';

export default function Settings() {
	const { walletDisplayAddress, isConnected } = useWallet();

	return (
		<div>
			<h1>Settings</h1>
		</div>
	);
}

Settings.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
