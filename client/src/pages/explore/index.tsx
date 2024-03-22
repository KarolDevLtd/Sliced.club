import Link from 'next/link';

export default function Explore() {
	const groupId = '69';

	return (
		<div>
			<h1>Explore</h1>
			<ul>
				<li>
					<Link href={`group/${groupId}`}>Group 69</Link>
				</li>
			</ul>
		</div>
	);
}
