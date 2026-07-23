export function ComingSoon({
  title,
  release,
  children,
}: {
  title: string;
  release: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <h1>{title}</h1>
      <div className="mt-6 rounded-card border border-line bg-peach p-6">
        <span className="pill bg-clay text-shell text-sm">{release}</span>
        <p className="mt-3 text-muted">
          {children ||
            "This section is scaffolded and ships in an upcoming release. The database tables and access rules are already in place."}
        </p>
      </div>
    </>
  );
}
