import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Unsubscribed — Yoga Founders Network",
  robots: { index: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let success = false;

  if (token) {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from("newsletter_subscribers")
      .update({ is_confirmed: false })
      .eq("unsubscribe_token", token);

    if (!error) success = true;
  }

  return (
    <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">🍃</div>

        {success || !token ? (
          <>
            <h1 className="font-serif text-display-sm text-on-surface mb-4">
              You&apos;ve been unsubscribed
            </h1>
            <p className="font-sans text-base text-on-surface-variant mb-8 leading-relaxed">
              You&apos;ve been removed from our Weekly Sanctuary Dispatches. We&apos;ll
              miss having you in the community.
            </p>
            <p className="font-sans text-sm text-on-surface-variant mb-10">
              Changed your mind? You can always re-subscribe from our homepage.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-display-sm text-on-surface mb-4">
              Something went wrong
            </h1>
            <p className="font-sans text-base text-on-surface-variant mb-8 leading-relaxed">
              We couldn&apos;t process your unsubscribe request. The link may be
              invalid or expired.
            </p>
            <p className="font-sans text-sm text-on-surface-variant mb-10">
              Please contact us at{" "}
              <a
                href="mailto:info@yogafoundersnetwork.com"
                className="text-primary hover:underline"
              >
                info@yogafoundersnetwork.com
              </a>{" "}
              and we&apos;ll take care of it.
            </p>
          </>
        )}

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-sans font-semibold text-sm text-white transition-all duration-300 hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
