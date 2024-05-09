import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

import { useUserStore } from '~/providers/store-providers/userStoreProvider';

import { toast } from 'react-toastify';

import BasicButton from '~/app/_components/ui/BasicButton';
import CheckBox from '~/app/_components/ui/CheckBox';
import InlineLink from '~/app/_components/ui/InlineLink';
import SelectOption from '~/app/_components/ui/SelectOption';
import TextInput from '~/app/_components/ui/TextInput';
import DefaultLayout from '~/layouts/default';
import { CountryOptions } from '~/models/country-options';

export default function Register() {
	const router = useRouter();

	const { logInUser } = useUserStore((state) => state);

	const {
		register,
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSubmit = (data: any) => {
		console.log(JSON.stringify(data));
		reset();
		logInUser();
		void router.push('/?register=success');
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 my-auto h-100 flex-1">
			<div className="min-w-100 bg-light-grey hidden md:block"></div>
			<div className="flex min-h-full flex-col justify-center lg:px-20 md:px-10 py-6">
				<h2 className="text-center text-2xl font-bold">Create account</h2>
				<p className="text-center mb-6">Choose your account type and log in</p>

				<form className="flex flex-col justify-center space-y-6" onSubmit={handleSubmit(onSubmit)}>
					<div>
						<TextInput
							id="first-name"
							name="first-name"
							type="text"
							placeholder="First Name"
							autoComplete="first-name"
							required={true}
							errors={errors}
							register={register}
							validationSchema={{
								required: 'First name is required',
							}}
						/>
						<TextInput
							id="last-name"
							name="last-name"
							type="text"
							placeholder="Last Name"
							autoComplete="last-name"
							required={true}
							errors={errors}
							register={register}
							validationSchema={{
								required: 'Last name is required',
							}}
						/>
						<TextInput
							id="email"
							name="email"
							type="email"
							placeholder="Email Address"
							autoComplete="email"
							required={true}
							errors={errors}
							register={register}
							validationSchema={{
								required: 'Email is required',
								pattern: {
									value: new RegExp(
										'^[a-zA-Z0-9]+(?:.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:.[a-zA-Z0-9]+)*$'
									),
									message: 'Use a valid email address',
								},
							}}
						/>
						<SelectOption
							id="country"
							name="country"
							placeholder="-- Please select a country --"
							defaultValue=""
							options={CountryOptions}
							required={true}
							errors={errors}
							register={register}
							validationSchema={{
								required: 'Country is required',
							}}
						/>
						<CheckBox
							id="terms-and-condtions"
							name="terms-and-conditions"
							required={true}
							errors={errors}
							register={register}
							validationSchema={{
								required: 'You must accept the Terms and Conditions',
							}}
						>
							Agree to <InlineLink href="#">Terms and Conditions</InlineLink>
						</CheckBox>
					</div>

					<BasicButton type="primary" submitForm={true}>
						Sign Up
					</BasicButton>
				</form>

				<p className="mt-6 text-center text-sm text-gray-500">
					Already have an account?{' '}
					<span>
						<InlineLink href="/login">Log in</InlineLink>
					</span>
				</p>
			</div>
		</div>
	);
}

Register.getLayout = function getLayout(page) {
	return <DefaultLayout>{page}</DefaultLayout>;
};
