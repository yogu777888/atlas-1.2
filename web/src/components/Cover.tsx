import { FlipMark } from "./Logo";

/**
 * Cover for articles and tools: one key number on graph paper instead of a
 * stock photo. `size="lg"` is the article header version.
 */
export function Cover({ figure, caption, size = "md", visual }: { figure: string; caption: string; size?: "md" | "lg"; visual?: React.ReactNode }) {
  const lg = size === "lg";
  return (
    <div className={`glow relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-[10px] border border-line bg-surface ${lg ? "min-h-56 p-7 sm:p-9" : "min-h-44 p-5"}`}>
      <div className="bg-grid absolute inset-0" aria-hidden />
      {visual ? <div className="relative self-end">{visual}</div> : <FlipMark className={`relative self-end ${lg ? "size-4" : "size-3"}`} />}
      <div className="relative">
        <p className={`num leading-none font-bold ${lg ? "text-6xl sm:text-7xl" : "text-5xl"}`}>{figure}</p>
        <p className={`mt-2 text-muted ${lg ? "text-sm" : "line-clamp-2 text-xs"}`}>{caption}</p>
      </div>
    </div>
  );
}
