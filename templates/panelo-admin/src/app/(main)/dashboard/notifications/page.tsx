import { NotificationsInbox } from "./_components/notifications-inbox";

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">Notifications</h1>
        <p className="text-muted-foreground text-sm">
          Mentions, access requests and system alerts from across your Panelo workspace.
        </p>
      </div>

      <NotificationsInbox />
    </div>
  );
}
