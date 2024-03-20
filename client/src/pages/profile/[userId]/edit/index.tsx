import { useRouter } from "next/router";

export default function EditProfile() {
  const router = useRouter();

  const userId = router.query.userId;

  return <div>Edit Profile with User ID {userId}</div>;
}
