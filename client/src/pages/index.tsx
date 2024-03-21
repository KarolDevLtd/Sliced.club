import Link from "next/link";

export default function Home() {
  const exampleUserId = "69e8f4d1";

  return (
    <div>
      <h1>Home</h1>
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
