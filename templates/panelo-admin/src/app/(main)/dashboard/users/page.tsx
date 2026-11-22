import { users as roster } from "./_components/data";
import { Users } from "./_components/users";

/** Server-rendered entry: the roster is static sample data, handed to the client screen once. */
export default function TeamPage() {
  return <Users initialRoster={roster} />;
}
