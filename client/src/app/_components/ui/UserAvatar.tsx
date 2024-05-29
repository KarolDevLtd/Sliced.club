// https://github.com/boringdesigners/boring-avatars
import Avatar from 'boring-avatars';

import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import useStore from '~/stores/utils/useStore';

export type UserAvatarProps = {
	walletAddress?: string;
};

const UserAvatar = ({ walletAddress }: UserAvatarProps) => {
	const userWalletAddress = useStore(useUserStore, (state: UserState) => state.userWalletAddress);

	return (
		<div className="avatar">
			<div className="rounded-sm h-[2.25rem] w-[2.25rem]">
				<Avatar
					size={40}
					name={(walletAddress ?? userWalletAddress)?.toString()}
					variant="pixel"
					colors={['#FFFFFF', '#FF603B', '#193646', '#6b7280', '#121A24']}
					square={true}
				/>
			</div>
		</div>
	);
};

export default UserAvatar;
