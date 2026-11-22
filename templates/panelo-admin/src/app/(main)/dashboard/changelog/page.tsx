import { ChangelogSubscribe } from "./_components/changelog-subscribe";
import { ChangelogTimeline } from "./_components/changelog-timeline";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">Changelog</h1>
        <p className="text-muted-foreground text-sm">New features, improvements and fixes shipped to Panelo.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <ChangelogTimeline />
        <aside className="order-first xl:sticky xl:top-0 xl:order-none xl:self-start">
          <ChangelogSubscribe />
        </aside>
      </div>
    </div>
  );
}
