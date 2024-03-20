import { useRouter } from "next/router";
import Link from "next/link";

export default function Profile() {
  const router = useRouter();

  const userId = router.query.userId;

  return (
    <div>
      <h1>My Profile</h1>
      <p>User ID: {userId}</p>
      <Link href={`/profile/${userId?.toString()}/edit`}>Edit</Link>
    </div>
  );
}
