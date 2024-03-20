import { useRouter } from "next/router";

export default function GroupClaim() {
  const router = useRouter();

  const groupId = router.query.groupId;

  return (
    <div>
      <p>Claim</p>
      <p>Group ID: {groupId}</p>
    </div>
  );
}
