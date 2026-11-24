import { RiGithubFill } from "@remixicon/react";

import { pill } from "@/components/application/site/site-ui";
import { cx } from "@/utils/cx";

const REPO = "raycanvas-ai/paneloui";

/** The GitHub mark in the nav, linking to the repo. Icon only: no star count. */
export function GitHubLink({ className }: { className?: string }) {
  return (
    <a href={`https://github.com/${REPO}`} target="_blank" rel="noreferrer" aria-label="Panelo UI on GitHub" className={cx(pill("secondary"), "size-8 px-0 [&_svg]:size-[22px]", className)}>
      <RiGithubFill aria-hidden />
    </a>
  );
}
