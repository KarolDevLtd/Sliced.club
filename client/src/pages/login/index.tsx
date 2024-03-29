import { type SetStateAction, useState } from 'react';

import { BasicButton } from '~/app/_components/ui/basic-button';
import { InlineLink } from '~/app/_components/ui/inline-link';
import { TextInput } from '~/app/_components/ui/text-input';

export default function Login() {
	const [email, setEmail] = useState('');
	const [rememberMe, setRememberMe] = useState(false);

	type LoginFormData = {
		email: string;
		rememberMe: boolean;
	};

	const formData: LoginFormData = {
		email,
		rememberMe,
	};

	const handleEmail = (e: { target: { value: SetStateAction<string> } }) => {
		setEmail(e.target.value);
	};

	const handleRememberMe = () => {
		setRememberMe(!rememberMe);
	};

	const handleLogin = () => {
		alert(`Email: ${formData.email}\nRemember me: ${formData.rememberMe}`);
	};

	const handleConnectWallet = () => {
		alert('Connect with wallet');
	};

	return (
		<div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 m-auto w-96">
			<div className="">
				<h2 className="mb-6 text-center text-2xl font-bold">Sign in to Slice</h2>
			</div>

			<BasicButton type="primary" onClick={handleConnectWallet}>
				Connect Wallet
			</BasicButton>

			<div className="w-100 h-3 border-b text-center mt-4 mb-5">
				<span className="w-100 px-3 bg-white">or</span>
			</div>

			<form className="flex flex-col justify-center space-y-6" action="#" method="POST">
				<div>
					<TextInput
						id="email"
						name="email"
						type="email"
						placeholder="Email Address"
						autoComplete="email"
						required={true}
						onChange={handleEmail}
					/>
					<div className="flex items-center mt-2">
						<input
							className="me-2 hover:cursor-pointer"
							id="remember-me"
							type="checkbox"
							checked={rememberMe}
							onChange={handleRememberMe}
						/>
						<label className="text-sm hover:cursor-pointer" htmlFor="remember-me">
							Remember me
						</label>
					</div>
				</div>

				<BasicButton type="primary" onClick={handleLogin}>
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
	);
}
