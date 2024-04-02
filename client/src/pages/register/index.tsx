import { useForm } from 'react-hook-form';

import { BasicButton } from '~/app/_components/ui/basic-button';
import { InlineLink } from '~/app/_components/ui/inline-link';
import { TextInput } from '~/app/_components/ui/text-input';

export default function Register() {
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
		alert(JSON.stringify(data));
		reset();
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
						<select
							className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							id="country"
							defaultValue={''}
							{...register('country', { required: true, maxLength: 2 })}
						>
							<option value="" disabled>
								--Please select a country--
							</option>
							<option value="AR">Argentina</option>
							<option value="BR">Brazil</option>
							<option value="FR">France</option>
							<option value="DE">Germany</option>
							<option value="IE">Ireland</option>
							<option value="PL">Poland</option>
							<option value="UK">United Kingdom</option>
							<option value="US">United States</option>
						</select>
						{errors && errors.country?.type === 'required' && (
							<span className="mt-1 text-xs text-red-error">Country is required</span>
						)}
						<div className="flex items-center mt-2">
							<input
								className="me-2 hover:cursor-pointer"
								id="terms-and-condtions"
								type="checkbox"
								{...register('termsAndConditions', { required: true })}
							/>
							<label className="text-sm hover:cursor-pointer" htmlFor="terms-and-condtions">
								Agree to <InlineLink href="#">Terms and Conditions</InlineLink>
							</label>
						</div>
						{errors && errors.termsAndConditions?.type === 'required' && (
							<span className="mt-1 text-xs text-red-error">
								You must accept the terms and conditions
							</span>
						)}
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
