import { useRouter } from "next/router";

export default function GroupClaim() {
  const router = useRouter();

  const groupId = router.query.groupId;

  return (
    <div>
      <h1>Claim</h1>
      <p>Group ID: {groupId}</p>
    </div>
  );
}
