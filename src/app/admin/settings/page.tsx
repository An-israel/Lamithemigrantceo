import { getSettings } from "@/lib/data";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <h1>Settings</h1>
      <p className="mt-2 text-sm text-muted">
        These feed the header, footer and contact page everywhere, and take
        effect immediately.
      </p>
      <div className="mt-6">
        <SettingsForm initial={settings} />
      </div>
    </>
  );
}
