/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Link from 'next/link';
import { Navbar } from '~/app/_components/navbar';
import { api } from '~/trpc/react';

export default function Home() {
	const exampleUserId = '69e8f4d1';
	const postToFirebase = api.PostToFirebase.postSample.useMutation();
	const postToIPFS = api.PostToIPFS.postMessage.useMutation();

	const sendInput = () => {
		postToFirebase.mutate({ name: 'this', email: 'is', age: 'shit' });
		postToIPFS.mutate({ name: 'this', email: 'is', age: 'shit' });
	};

	return (
		<div>
			<h1>Home</h1>
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
			<button onClick={sendInput}>post shit</button>
		</div>
	);
}
