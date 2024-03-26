import { BasicButton } from '~/app/_components/ui/basic-button';
import { InlineLink } from '~/app/_components/ui/inline-link';

export default function Login() {
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
						<label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
							Email address
						</label>
						<div className="mt-2">
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							/>
						</div>
					</div>

					<div>
						<div className="flex items-center justify-between">
							<label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
								Password
							</label>
							<div className="text-sm">
								<InlineLink href="#">Forgot password?</InlineLink>
							</div>
						</div>
						<div className="mt-2">
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							/>
						</div>
					</div>

					<div className="flex justify-center">
						<BasicButton type="primary">Login</BasicButton>
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
