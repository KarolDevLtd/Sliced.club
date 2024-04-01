import { type SetStateAction, useState } from 'react';

import { BasicButton } from '~/app/_components/ui/basic-button';
import { InlineLink } from '~/app/_components/ui/inline-link';
import { TextInput } from '~/app/_components/ui/text-input';

export default function Register() {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [country, setCountry] = useState('');
	const [termsAndConditions, setTermsAndConditions] = useState(false);

	type RegisterFormData = {
		firstName: string;
		lastName: string;
		email: string;
		country: string;
		termsAndConditions: boolean;
	};

	const formData: RegisterFormData = {
		firstName,
		lastName,
		email,
		country,
		termsAndConditions,
	};

	const handleFirstName = (e: { target: { value: SetStateAction<string> } }) => {
		setFirstName(e.target.value);
	};

	const handleLastName = (e: { target: { value: SetStateAction<string> } }) => {
		setLastName(e.target.value);
	};

	const handleEmail = (e: { target: { value: SetStateAction<string> } }) => {
		setEmail(e.target.value);
	};

	const handleTermsAndConditions = () => {
		setTermsAndConditions(!termsAndConditions);
	};

	const handleRegister = () => {
		alert(
			`First Name: ${formData.firstName}\nLast Name: ${formData.lastName}\nEmail: ${formData.email}\nCountry: ${formData.country}\nTerms and Conditions: ${formData.termsAndConditions}`
		);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 my-auto h-100 flex-1">
			<div className="min-w-100 bg-light-grey hidden md:block"></div>
			<div className="flex min-h-full flex-col justify-center lg:px-20 md:px-10 py-6">
				<h2 className="text-center text-2xl font-bold">Create account</h2>
				<p className="text-center mb-6">Choose your account type and log in</p>

				<form className="flex flex-col justify-center space-y-6" action="#" method="POST">
					<div>
						<TextInput
							id="first-name"
							name="first-name"
							type="text"
							placeholder="First Name"
							autoComplete="first-name"
							required={true}
							onChange={handleFirstName}
						/>
						<TextInput
							id="last-name"
							name="last-name"
							type="text"
							placeholder="Last Name"
							autoComplete="last-name"
							required={true}
							onChange={handleLastName}
						/>
						<TextInput
							id="email"
							name="email"
							type="email"
							placeholder="Email Address"
							autoComplete="email"
							required={true}
							onChange={handleEmail}
						/>
						<select
							className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							name="country"
							id="country"
							value={country}
							onChange={(e) => setCountry(e.target.value)}
						>
							<option value="" disabled selected>
								--Please select a country--
							</option>
							<option value="ar">Argentina</option>
							<option value="br">Brazil</option>
							<option value="de">Germany</option>
							<option value="pl">Poland</option>
							<option value="uk">United Kingdom</option>
							<option value="us">United States</option>
						</select>
						<div className="flex items-center mt-2">
							<input
								className="me-2 hover:cursor-pointer"
								id="terms-and-condtions"
								type="checkbox"
								checked={termsAndConditions}
								onChange={handleTermsAndConditions}
							/>
							<label className="text-sm hover:cursor-pointer" htmlFor="terms-and-condtions">
								Agree to <InlineLink href="#">Terms and Conditions</InlineLink>
							</label>
						</div>
					</div>

					<BasicButton type="primary" onClick={handleRegister}>
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
