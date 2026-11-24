// Long-form markdown (the blog) in the site's type and colour tokens. Applied to one wrapper, since the HTML
// comes from markdown and carries no classes of its own.
export const PROSE = [
  "text-site-text text-site-muted",
  "[&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:scroll-mt-24 [&_h2]:text-site-section [&_h2]:text-balance [&_h2]:text-site-ink",
  "[&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:scroll-mt-24 [&_h3]:text-site-question [&_h3]:text-site-ink",
  "[&_p]:my-5 [&_p]:text-pretty [&_li]:my-1.5 [&_li]:text-pretty",
  "[&_ul]:my-5 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:ps-6",
  "[&_a]:text-site-ink [&_a]:underline [&_a]:decoration-site-hairline [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:decoration-current",
  "[&_a]:rounded-sm [&_a]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-border-focus-ring",
  "[&_strong]:font-medium [&_strong]:text-site-ink",
  // Long URLs and identifiers break instead of pushing a phone screen sideways.
  "[&_a]:[overflow-wrap:anywhere] [&_:not(pre)>code]:[overflow-wrap:anywhere] [&_td]:[overflow-wrap:anywhere]",
  "[&_blockquote]:my-8 [&_blockquote]:rounded-3xl [&_blockquote]:border [&_blockquote]:border-site-hairline [&_blockquote]:bg-site-surface [&_blockquote]:px-6 [&_blockquote]:py-1",
  "[&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:bg-site-surface [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.875em] [&_:not(pre)>code]:text-site-ink",
  "[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-site-hairline [&_pre]:bg-site-surface [&_pre]:p-5 [&_pre]:font-mono [&_pre]:text-body-2-regular [&_pre]:leading-6 [&_pre]:text-site-ink",
  "[&_table]:my-8 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:text-site-body",
  "[&_th]:border-b [&_th]:border-site-hairline [&_th]:py-2.5 [&_th]:pe-5 [&_th]:text-start [&_th]:font-medium [&_th]:whitespace-nowrap [&_th]:text-site-ink",
  "[&_td]:border-b [&_td]:border-site-hairline [&_td]:py-2.5 [&_td]:pe-5 [&_td]:align-top",
  "[&_hr]:my-12 [&_hr]:border-site-hairline [&_img]:rounded-2xl",
].join(" ");
