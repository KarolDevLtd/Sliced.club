/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';
import React, { useCallback } from 'react';

export type IMinaButton = {
	children?: string;
	disabled?: boolean;
	onClick: (e: React.MouseEvent<HTMLElement>) => object;
	checkInstall?: boolean;
};

export const MinaButton = ({ children, disabled, onClick, checkInstall = true }): IMinaButton => {
	const onClickBtn = useCallback(
		(e: any) => {
			if (checkInstall) {
				if (!(window as any)?.mina) {
					alert('No provider was found Please install Auro Wallet');
					return;
				} else {
					onClick(e);
				}
			} else {
				onClick(e);
			}
		},
		[onClick]
	);

	return (
		<button className="m-2 p-2 bg-green-200" disabled={disabled} onClick={onClickBtn}>
			{children}
		</button>
	);
};
