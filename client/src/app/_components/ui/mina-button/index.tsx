import React, { useCallback } from 'react';
import { BasicButton } from '../basic-button';

import { FaWallet } from 'react-icons/fa';

export type IMinaButton = {
	children?: React.ReactNode;
	disabled?: boolean;
	onClick: (e: Event) => object;
	checkInstall?: boolean;
};

export const MinaButton = ({ children, disabled, onClick, checkInstall = true }: IMinaButton) => {
	const onClickBtn = useCallback(
		(e: Event) => {
			if (checkInstall) {
				if (!window?.mina) {
					alert('No provider was found Please install Auro Wallet');
					return;
				} else {
					onClick(e);
				}
			} else {
				onClick(e);
			}
		},
		[checkInstall, onClick]
	);

	return (
		<BasicButton type="tertiary" icon={<FaWallet />} disabled={disabled} onClick={onClickBtn}>
			{children}
		</BasicButton>
	);
};
