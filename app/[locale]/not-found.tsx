import Link from "next/link";
import { Mail } from "lucide-react";
import { SITE, LISTING_TYPES } from "@/lib/config/site";
import YogaSilhouette from "@/components/ui/YogaSilhouette";

const TYPE_PREFIXES: Record<string, string> = {
  studio:   "/yogastudio",
  teacher:  "/yogateacher",
  school:   "/yogaschool",
  retreat:  "/retreatcenter",
  product:  "/yogaproducts",
  workshop: "/yogaworkshops",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg px-6 py-24 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Mark + 404 */}
        <div className="flex flex-col items-center text-center mb-12">
          <YogaSilhouette pose="child" size={72} color="#11181a" />
          <p className="font-serif text-[6rem] leading-none text-on-surface/10 select-none mt-6 mb-2">
            404
          </p>
          <h1 className="font-serif text-display-sm text-on-surface mb-4">
            This space doesn&apos;t exist
          </h1>
          <p className="font-sans text-base text-on-surface-variant leading-relaxed max-w-md">
            The page you&apos;re looking for may have moved, been renamed,
            or the studio may have closed. Try one of these instead:
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {LISTING_TYPES.map((t) => (
            <Link
              key={t.id}
              href={TYPE_PREFIXES[t.id]}
              className="group flex flex-col items-center justify-center gap-1 px-4 py-5 rounded-2xl bg-surface-low hover:bg-secondary-container transition-all duration-300"
            >
              <span className="font-sans text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                {t.label}
              </span>
              <span className="font-sans text-xs text-on-surface-variant">
                Browse {t.label.toLowerCase()}
              </span>
            </Link>
          ))}
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[2px] font-sans font-semibold text-sm text-white transition-all duration-300 hover:opacity-90"
            style={{ background: "#231E17" }}
          >
            Return home
          </Link>
          <Link
            href="/search"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[2px] font-sans font-semibold text-sm text-on-surface border border-outline-variant/40 hover:bg-surface-low transition-all duration-300"
          >
            Search the directory
          </Link>
        </div>

        {/* Contact */}
        <p className="text-center font-sans text-sm text-on-surface-variant">
          Still can&apos;t find it?{" "}
          <a
            href={`mailto:${SITE.email}?subject=Help finding a yoga listing`}
            className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
          >
            <Mail size={13} />
            Email us
          </a>
          {" "}— we&apos;ll point you in the right direction.
        </p>
      </div>
    </div>
  );
}
