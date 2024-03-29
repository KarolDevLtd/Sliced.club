import { type SetStateAction, useState } from 'react';

import { BasicButton } from '~/app/_components/ui/basic-button';
import { InlineLink } from '~/app/_components/ui/inline-link';
import { TextInput } from '~/app/_components/ui/text-input';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const credentials = {
		email,
		password,
	};

	const handleEmail = (e: { target: { value: SetStateAction<string> } }) => {
		setEmail(e.target.value);
	};

	const handlePassword = (e: { target: { value: SetStateAction<string> } }) => {
		setPassword(e.target.value);
	};

	const handleSubmit = () => {
		alert(`Email: ${credentials.email}\nPassword: ${credentials.password}`);
	};

	return (
		<div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-sm">
				{/* Small logo can go here
				<img
					className="mx-auto h-10 w-auto"
					src=""
					alt="Sliced"
				/> */}
				<h2 className="mt-10 text-center text-2xl font-bold">Log in to your account</h2>
			</div>

			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				<form className="space-y-6" action="#" method="POST">
					<div>
						<TextInput
							label="Email address"
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required={true}
							onChange={handleEmail}
						/>
					</div>

					<div>
						<TextInput
							label="Password"
							link={{ text: 'Forgot password?', href: '#' }}
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required={true}
							onChange={handlePassword}
						/>
					</div>

					<div className="flex justify-center">
						<BasicButton type="primary" onClick={handleSubmit}>
							Login
						</BasicButton>
					</div>
				</form>

				<p className="mt-10 text-center text-sm text-gray-500">Don&#39;t have an account yet?</p>
				<div className="text-sm flex justify-center">
					<InlineLink href="/register">Register now</InlineLink>
				</div>
			</div>
		</div>
	);
}
