import { useRouter } from "next/router";

export default function ManageGroup() {
  const router = useRouter();

  const groupId = router.query.groupId;

  return <div>Manage Group ID: {groupId}</div>;
}
