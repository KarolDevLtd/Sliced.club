import { MinaButton } from '~/app/_components/ui/mina-button';
import PlatformLayout from '~/layouts/platform';
import { useWallet } from '~/providers/walletprovider';

export default function Payments() {
	const { walletDisplayAddress, isConnected } = useWallet();

	return (
		<div>
			<h1>Payments</h1>
		</div>
	);
}

Payments.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
