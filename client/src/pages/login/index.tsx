import { useForm } from 'react-hook-form';
// https://react-hook-form.com/docs/useform

import { BasicButton } from '~/app/_components/ui/basic-button';
import { InlineLink } from '~/app/_components/ui/inline-link';
import { TextInput } from '~/app/_components/ui/text-input';

export default function Login() {
	const handleConnectWallet = () => {
		alert('Connect with wallet');
	};

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
				<h2 className="mb-6 text-center text-2xl font-bold">Sign in to Slice</h2>

				<BasicButton type="primary" onClick={handleConnectWallet}>
					Connect Wallet
				</BasicButton>

				<div className="w-100 h-3 border-b text-center mt-4 mb-5">
					<span className="w-100 px-3 bg-white">or</span>
				</div>

				<form className="flex flex-col justify-center space-y-6" onSubmit={handleSubmit(onSubmit)}>
					<div>
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
						<div className="flex items-center mt-2">
							<input
								className="me-2 hover:cursor-pointer"
								id="remember-me"
								type="checkbox"
								{...register('rememberMe')}
							/>
							<label className="text-sm hover:cursor-pointer" htmlFor="remember-me">
								Remember me
							</label>
						</div>
					</div>

					<BasicButton type="primary" submitForm={true}>
						Sign In
					</BasicButton>
				</form>

				<p className="mt-6 text-center text-sm text-gray-500">
					Don&#39;t have an account?{' '}
					<span>
						<InlineLink href="/register">Create an account</InlineLink>
					</span>
				</p>
			</div>
		</div>
	);
}
