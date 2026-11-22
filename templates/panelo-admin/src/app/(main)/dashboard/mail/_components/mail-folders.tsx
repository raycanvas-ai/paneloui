import { cn } from "cn";
import { Archive, File, Inbox, type LucideIcon, Send, ShieldAlert, Star, Trash2 } from "lucide-react";

import { type Email, FOLDERS, type FolderId, inView, LABELS, type View } from "./mail-data";

export const FOLDER_ICON: Record<FolderId, LucideIcon> = {
  inbox: Inbox,
  starred: Star,
  sent: Send,
  drafts: File,
  archive: Archive,
  spam: ShieldAlert,
  trash: Trash2,
};

/** Inbox and Spam count what's unread; Drafts counts everything; the rest stay quiet. */
export function folderCount(emails: Email[], id: FolderId) {
  if (id === "inbox" || id === "spam") return emails.filter((email) => email.folder === id && email.unread).length;
  if (id === "drafts") return emails.filter((email) => email.folder === id).length;
  return 0;
}

const ROW =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50";

interface MailFoldersProps {
  readonly emails: Email[];
  readonly view: View;
  readonly onViewChange: (view: View) => void;
  readonly className?: string;
}

export function MailFolders({ emails, view, onViewChange, className }: MailFoldersProps) {
  return (
    <nav aria-label="Mail folders" className={cn("flex flex-col gap-5 overflow-y-auto p-3", className)}>
      <ul className="flex flex-col gap-0.5">
        {FOLDERS.map((folder) => {
          const Icon = FOLDER_ICON[folder.id];
          const count = folderCount(emails, folder.id);
          const active = view === folder.id;
          return (
            <li key={folder.id}>
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onViewChange(folder.id)}
                className={cn(
                  ROW,
                  active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4 shrink-0", active && "text-[var(--tone-primary)]")} strokeWidth={1.8} />
                <span className="flex-1 truncate">{folder.label}</span>
                {count > 0 ? (
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      folder.id === "inbox" ? "font-medium text-[var(--tone-primary)]" : "text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-1 border-t pt-4">
        <p className="px-2.5 pb-1 text-muted-foreground text-xs">Labels</p>
        <ul className="flex flex-col gap-0.5">
          {LABELS.map((label) => {
            const id = `label:${label.id}` as const;
            const active = view === id;
            return (
              <li key={label.id}>
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => onViewChange(id)}
                  className={cn(
                    ROW,
                    active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <span className={cn("ml-1 size-2 shrink-0 rounded-full", label.dot)} />
                  <span className="flex-1 truncate">{label.label}</span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {emails.filter((email) => inView(email, id)).length}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
