import { useRouter } from "next/router";

export default function Group() {
  const router = useRouter();

  const groupId = router.query.groupId;

  return <div>Group ID: {groupId}</div>;
}
