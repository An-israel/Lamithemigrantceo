import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { setSubscribedByToken } from "@/lib/subscribers";

/**
 * POST only — a GET never unsubscribes anyone, because inbox link scanners
 * open every link in an email.
 *
 * Two callers:
 *  - Mail clients' one-click button (RFC 8058): token in the query string,
 *    body "List-Unsubscribe=One-Click". Answered with a plain 200.
 *  - The /unsubscribe page's form: token and action in the body, redirected
 *    back to the page to show the result.
 */
export async function POST(request: Request) {
  if (!rateLimit(`unsubscribe:${clientIp(request)}`, 20, 60_000)) {
    return new NextResponse("Too many attempts. Try again in a minute.", { status: 429 });
  }

  const url = new URL(request.url);
  let form: URLSearchParams;
  try {
    form = new URLSearchParams(await request.text());
  } catch {
    form = new URLSearchParams();
  }

  const token = (form.get("t") || url.searchParams.get("t") || "").trim();
  const fromPage = form.get("from") === "page";
  const resubscribe = fromPage && form.get("action") === "resubscribe";

  let outcome: Awaited<ReturnType<typeof setSubscribedByToken>> = null;
  let failed = false;
  try {
    outcome = await setSubscribedByToken(token, resubscribe, fromPage ? "unsubscribe page" : "one-click in their inbox");
  } catch {
    failed = true;
  }

  if (fromPage) {
    const back = new URL("/unsubscribe", url.origin);
    back.searchParams.set("t", token);
    back.searchParams.set("done", failed ? "error" : resubscribe ? "resubscribed" : "unsubscribed");
    return NextResponse.redirect(back, 303);
  }

  if (failed) return new NextResponse("Something went wrong. Please try again.", { status: 500 });
  if (!outcome) return new NextResponse("Unknown unsubscribe link.", { status: 404 });
  return new NextResponse("You have been unsubscribed.", { status: 200 });
}
