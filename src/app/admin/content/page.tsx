import { getSiteContent } from "@/lib/data";
import { ContentEditor } from "@/components/admin/ContentEditor";

export default async function AdminContentPage() {
  const content = await getSiteContent();
  return (
    <>
      <h1>Page text</h1>
      <p className="mt-2 text-sm text-muted">
        Edit any of the copy below and it updates on the live site immediately.
        Leave a field blank to use its original wording. More pages get added
        here over time — this starts with the homepage.
      </p>
      <div className="mt-6">
        <ContentEditor initial={content} />
      </div>
    </>
  );
}
