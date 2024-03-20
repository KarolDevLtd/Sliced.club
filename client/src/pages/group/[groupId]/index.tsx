import { useRouter } from "next/router";
import Link from "next/link";

export default function Group() {
  const router = useRouter();

  const groupId = router.query.groupId;

  return (
    <div>
      <h1>Group</h1>
      <p>Group ID: {groupId}</p>
      <Link href={`${groupId?.toString()}/manage`}>Manage</Link>
      <Link href={`${groupId?.toString()}/claim`}>Claim</Link>
    </div>
  );
}
