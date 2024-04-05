import { MinaButton } from '~/app/_components/ui/mina-button';
import PlatformLayout from '~/layouts/platform';
import { useWallet } from '~/providers/walletprovider';

export default function Settings() {
	const { walletDisplayAddress, isConnected } = useWallet();

	return (
		<div>
			<h1>Settings</h1>
			<div>
				<MinaButton disabled={false} checkInstall={true} type="connnect">
					{isConnected ? walletDisplayAddress : 'Connect'}
				</MinaButton>
				{isConnected == true && (
					<MinaButton disabled={false} checkInstall={true} type="chain">
						Switch Chain
					</MinaButton>
				)}
			</div>
		</div>
	);
}

Settings.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
