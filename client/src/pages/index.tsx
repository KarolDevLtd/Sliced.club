import Link from 'next/link';
import { Navbar } from '~/app/_components/navbar';

export default function Home() {
	const exampleUserId = '69e8f4d1';

	return (
		<div>
			<h1 className="flex text-lime-400 bg-red-200">Home</h1>
			<Navbar />
			<ul>
				<li>
					<Link href="/login">Login</Link>
				</li>
				<li>
					<Link href="/register">Register</Link>
				</li>
				<li>
					<Link href={`/profile/${exampleUserId}`}>My Profile</Link>
				</li>
				<li>
					<Link href="/explore">Explore</Link>
				</li>
				<li>
					<Link href="/group/create">Create Croup</Link>
				</li>
			</ul>
		</div>
	);
}
