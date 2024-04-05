import { useRouter } from 'next/router';
import { MinaButton } from '~/app/_components/ui/mina-button';
import PlatformLayout from '~/layouts/platform';
import { useWallet } from '~/providers/walletprovider';

export default function EditProfile() {
	const router = useRouter();

	const { walletDisplayAddress, isConnected } = useWallet();

	const userId = router.query.userId;

	return (
		<div>
			<h1>User ID: {userId}</h1>
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

EditProfile.getLayout = function getLayout(page) {
	return <PlatformLayout>{page}</PlatformLayout>;
};
