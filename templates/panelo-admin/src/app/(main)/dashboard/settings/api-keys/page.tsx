import { ApiKeysTable } from "./_components/api-keys-table";
import { UsageSnippet } from "./_components/usage-snippet";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <ApiKeysTable />
      <UsageSnippet />
    </div>
  );
}
