/**
 * The four quick-create glyphs are solid white shapes in the reference, which
 * lucide's stroked set can't match, so they are traced here on a 24px box.
 */
const BOX = "size-[22px] shrink-0";

export function QuickNoteIcon() {
  return (
    <svg viewBox="0 0 24 24" className={BOX} fill="currentColor" aria-hidden="true">
      <path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v1.6H2.5V7A1.5 1.5 0 0 1 4 5.5Z" />
      <path
        fillRule="evenodd"
        d="M2.5 10.1h19V17a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 17v-6.9Zm4.6 1.9a2.35 2.35 0 1 0 0 4.7 2.35 2.35 0 0 0 0-4.7Zm5.1.6a.85.85 0 0 0 0 1.7h5.9a.85.85 0 0 0 0-1.7h-5.9Zm0 2.9a.85.85 0 0 0 0 1.7h3.9a.85.85 0 0 0 0-1.7h-3.9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" className={BOX} fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M6.5 2.5h7.3l6.2 6v13a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2v-17a2 2 0 0 1 2-2Zm2.4 7.3a.9.9 0 0 0 0 1.8h6.2a.9.9 0 0 0 0-1.8H8.9Zm0 3.6a.9.9 0 0 0 0 1.8h6.2a.9.9 0 0 0 0-1.8H8.9Zm0 3.6a.9.9 0 0 0 0 1.8h3.4a.9.9 0 0 0 0-1.8H8.9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function WhiteboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className={BOX} fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M3.4 3.5h17.2a1.6 1.6 0 0 1 1.6 1.6v8.6a1.6 1.6 0 0 1-1.6 1.6h-7.7v1.9l3 2.4a.9.9 0 1 1-1.1 1.4L12 18.6l-2.8 2.4a.9.9 0 1 1-1.1-1.4l3-2.4v-1.9H3.4a1.6 1.6 0 0 1-1.6-1.6V5.1a1.6 1.6 0 0 1 1.6-1.6Zm4 3.4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm4.2.6a.85.85 0 0 0 0 1.7h5.2a.85.85 0 0 0 0-1.7h-5.2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function PresentationIcon() {
  return (
    <svg viewBox="0 0 24 24" className={BOX} fill="currentColor" aria-hidden="true">
      <path d="M1.9 3.4h20.2a.9.9 0 0 1 0 1.8H1.9a.9.9 0 0 1 0-1.8Z" />
      <path
        fillRule="evenodd"
        d="M3.3 6.4h17.4v7.3a1.6 1.6 0 0 1-1.6 1.6h-6.2v1.9l3 2.4a.9.9 0 1 1-1.1 1.4L12 18.6l-2.8 2.4a.9.9 0 1 1-1.1-1.4l3-2.4v-1.9H4.9a1.6 1.6 0 0 1-1.6-1.6V6.4Zm12.9 1.9-3.3 3.1-2-1.7-3.4 2.9a.85.85 0 1 0 1.1 1.3l2.3-2 2 1.7 4.4-4.1a.85.85 0 0 0-1.1-1.2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export const quickIcons = {
  note: QuickNoteIcon,
  document: DocumentIcon,
  whiteboard: WhiteboardIcon,
  presentation: PresentationIcon,
};
