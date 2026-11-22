import { DangerZone } from "./_components/danger-zone";
import { ProfileForm } from "./_components/profile-form";
import { WorkspaceForm } from "./_components/workspace-form";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <ProfileForm />
      <WorkspaceForm />
      <DangerZone />
    </div>
  );
}
