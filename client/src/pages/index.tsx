import Link from "next/link";

export default function Home() {
  const exampleUserId = "69e8f4d1";

  return (
    <div>
      <h1>Home</h1>
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
      <Link href={`/profile/${exampleUserId}`}>My Profile</Link>
      <Link href="/explore">Explore</Link>
      <Link href="/group/create">Create Croup</Link>
    </div>
  );
}
