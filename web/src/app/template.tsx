/** Re-mounts on every navigation, so each page settles in with the same short motion. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
