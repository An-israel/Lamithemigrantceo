import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { loadCampaign, sendNextBatch } from "@/lib/campaigns";

// A batch is one Resend call, but if Resend rejects it the emails are sent
// one by one, which needs more than the default 10s.
export const maxDuration = 60;

/** Sends the next slice of a campaign. The admin page calls this in a loop. */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 403 });

  const campaign = await loadCampaign(params.id);
  if (!campaign) return NextResponse.json({ error: "Email not found." }, { status: 404 });

  return NextResponse.json(await sendNextBatch(campaign));
}
