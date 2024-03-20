import { useRouter } from "next/router";

export default function Profile() {
  const router = useRouter();

  const userId = router.query.userId;

  return <div>User ID: {userId}</div>;
}
