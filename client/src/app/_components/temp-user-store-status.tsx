/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// THIS IS A TEMPORARY FILE TO KEEP TRACK OF USER STORE STATUS DURING TESTING
import { useState } from 'react';

import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';
import { TextInput } from './ui/text-input';
import { BasicButton } from './ui/basic-button';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

export const UserStoreStatus = ({}) => {
	const [display, setDisplay] = useState(false);

	const isLoggedIn = useStore(useUserStore, (state: UserState) => state.isLoggedIn);
	const walletConnected = useStore(useUserStore, (state: UserState) => state.walletConnected);
	const userFirstName = useStore(useUserStore, (state: UserState) => state.userFirstName);
	const _hasHydrated = useStore(useUserStore, (state: UserState) => state._hasHydrated);

	const { setUserFirstName } = useUserStore((state) => state);

	const {
		register,
		unregister,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		// Resolver for using Zod validation library schema
		// https://react-hook-form.com/docs/useform#resolver
		// resolver: {}
	});

	const onSubmit = (data: any) => {
		try {
			setUserFirstName(data['first-name']);
			reset();
			toast.success('Name updated');
		} catch (err) {
			console.log(err);
		} finally {
		}
	};

	return (
		<div className="fixed z-50 mt-1 ms-1">
			{display ? (
				<>
					<p
						className="hover:cursor-pointer hover:underline"
						onClick={() => {
							setDisplay(false);
							unregister(['first-name']);
						}}
					>
						Hide User Store
					</p>
					<div className="bg-purple-light p-3 border border-purple">
						<p>
							<strong>USER STORE</strong>
						</p>
						<p>
							<strong>isLoggedIn:</strong> {isLoggedIn?.toString()}
						</p>
						<p>
							<strong>walletConnected:</strong> {walletConnected?.toString()}
						</p>
						<p>
							<strong>userFirstName:</strong> {userFirstName}
						</p>
						<p>
							<strong>storeHasHydrated:</strong> {_hasHydrated?.toString()}
						</p>
						<div className="pt-2">
							<form className="flex items-end" onSubmit={handleSubmit(onSubmit)}>
								<TextInput
									id="first-name"
									name="first-name"
									type="text"
									label="Change First Name"
									required={true}
									errors={errors}
									register={register}
									validationSchema={{
										required: 'Name is required',
									}}
								/>
								<BasicButton type="secondary" submitForm={true}>
									Ok
								</BasicButton>
							</form>
						</div>
					</div>
				</>
			) : (
				<p className="hover:cursor-pointer hover:underline" onClick={() => setDisplay(true)}>
					Show User Store
				</p>
			)}
		</div>
	);
};
