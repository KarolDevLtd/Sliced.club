import { useRouter } from "next/router";

export default function ManageGroup() {
  const router = useRouter();

  const groupId = router.query.groupId;

  return (
    <div>
      <h1>Manage Group</h1>
      <p>Group ID: {groupId}</p>
    </div>
  );
}
