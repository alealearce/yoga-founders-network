import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-lg">
        {/* Large serif 404 */}
        <p className="font-serif text-[8rem] leading-none text-on-surface/10 select-none mb-6">
          404
        </p>

        <h1 className="font-serif text-display-sm text-on-surface mb-4">
          This space doesn&apos;t exist yet
        </h1>

        <p className="font-sans text-base text-on-surface-variant mb-10 leading-relaxed">
          The studio, teacher, or page you&apos;re looking for may have moved,
          been renamed, or it simply hasn&apos;t found its way here yet.
        </p>

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
