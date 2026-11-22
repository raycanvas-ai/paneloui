"use client";

import { useEffect, useState } from "react";

import { cn } from "cn";

import { useIsLg } from "@/hooks/use-lg";

import { ChatConversationList } from "./chat-conversation-list";
import { ChatProfileDetails } from "./chat-profile-details";
import { ChatThread } from "./chat-thread";
import type { Conversation } from "./data";

export const PANEL = "min-h-0 min-w-0 overflow-hidden rounded-xl bg-card shadow-xs";

/** Below md the list and thread share one grid cell; whichever isn't active slides out of view. */
const SLIDE = "transition-transform duration-300 ease-out max-md:col-start-1 max-md:row-start-1";
const PARKED_LEFT = "max-md:pointer-events-none max-md:-translate-x-[110%]";
const PARKED_RIGHT = "max-md:pointer-events-none max-md:translate-x-[110%]";

type Pane = "list" | "thread";

export function Chat({ conversations }: { readonly conversations: Conversation[] }) {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [pane, setPane] = useState<Pane>("list");
  // null follows the breakpoint (docked on desktop, closed below lg) until someone toggles it.
  const [profileChoice, setProfileChoice] = useState<boolean | null>(null);
  const isLg = useIsLg();
  const profileOpen = profileChoice ?? isLg;
  const floating = profileOpen && !isLg;

  const active = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];

  // The floating profile covers the thread, so Escape should dismiss it like any overlay.
  useEffect(() => {
    if (!floating) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setProfileChoice(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [floating]);

  return (
    <div
      className={cn(
        "relative grid min-h-0 flex-1 grid-cols-1 gap-4 max-md:overflow-hidden md:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]",
        profileOpen && "lg:grid-cols-[320px_minmax(0,1fr)_300px] xl:grid-cols-[340px_minmax(0,1fr)_320px]",
      )}
    >
      <ChatConversationList
        conversations={conversations}
        selectedId={active.id}
        onSelect={(conversation) => {
          setActiveId(conversation.id);
          setPane("thread");
        }}
        className={cn(PANEL, SLIDE, pane === "thread" && PARKED_LEFT)}
      />
      <ChatThread
        key={active.id}
        conversation={active}
        profileOpen={profileOpen}
        onBack={() => setPane("list")}
        onToggleContact={() => setProfileChoice(!profileOpen)}
        className={cn(PANEL, SLIDE, pane === "list" && PARKED_RIGHT)}
      />
      {profileOpen ? (
        <ChatProfileDetails
          contact={active.contact}
          onClose={() => setProfileChoice(false)}
          // Docked as a third column on desktop; below lg it floats over the thread's right edge.
          className={cn(
            PANEL,
            "max-lg:absolute max-lg:inset-y-0 max-lg:right-0 max-lg:z-20 max-lg:w-80 max-lg:max-w-[calc(100%-1rem)] max-lg:shadow-lg",
          )}
        />
      ) : null}
    </div>
  );
}
