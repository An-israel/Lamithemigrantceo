/**
 * Renders content saved by RichTextEditor (HTML). Falls back to treating
 * the value as legacy plain text (one paragraph per line) for content
 * saved before the rich editor existed, so nothing written earlier breaks.
 */
export function RichText({ html, className }: { html: string; className?: string }) {
  if (!html) return null;

  const isHtml = /<[a-z][\s\S]*>/i.test(html);
  if (isHtml) {
    return (
      <div
        className={`rich-content ${className || ""}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className={`rich-content ${className || ""}`}>
      {html
        .split("\n")
        .filter(Boolean)
        .map((line, i) => (
          <p key={i}>{line}</p>
        ))}
    </div>
  );
}
