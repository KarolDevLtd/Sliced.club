import Link from 'next/link';

export default function Home() {
	return (
		<div>
			<h1 className="flex text-lime-400 bg-red-200">Sliced</h1>
			<ul>
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
